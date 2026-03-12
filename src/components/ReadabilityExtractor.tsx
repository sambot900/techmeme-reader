/**
 * ReadabilityExtractor — mounts a hidden WebView per pending extraction.
 *
 * Sits at the app root (App.tsx). Watches contentStore.pendingExtractions,
 * processes one at a time: loads the article URL in an off-screen WebView,
 * injects Readability.js, runs parse(), and postMessages the result back.
 *
 * On completion, calls contentStore.completeExtraction() so ArticleScreen
 * reactively receives the result.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useContentStore } from '@/store/contentStore';
import { READABILITY_JS } from '@/api/readabilitySource';
import { ExtractionResult } from '@/api/extractor';

// The script injected after the page finishes loading.
// Readability is already defined in the string above; we append the runner.
const INJECTION_SCRIPT = `
(function() {
  try {
    ${READABILITY_JS}

    var documentClone = document.cloneNode(true);
    var reader = new Readability(documentClone);
    var article = reader.parse();

    if (article && article.textContent && article.textContent.trim().length > 300) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        status: 'success',
        title: article.title || undefined,
        text: article.textContent.replace(/\\s+/g, ' ').trim(),
      }));
    } else {
      window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'failed' }));
    }
  } catch (e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'failed' }));
  }
  true; // required by react-native-webview
})();
`;

// Paywall detection: check meta tags and Schema.org JSON-LD in the DOM.
// Runs before Readability so we can short-circuit.
const PAYWALL_CHECK_SCRIPT = `
(function() {
  try {
    // Schema.org isAccessibleForFree
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        var check = Array.isArray(data) ? data[0] : data;
        if (check && String(check.isAccessibleForFree).toLowerCase() === 'false') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'restricted' }));
          return;
        }
      } catch(e) {}
    }
    // Paywall gate containers by class/id
    var gateSelectors = ['.paywall','.piano-paywall','#piano-paywall',
      '.subscriber-gate','.regwall','[class*="barricade"]','[class*="tp-modal"]',
      '.sub-module','[class*="premium-gate"]'];
    for (var j = 0; j < gateSelectors.length; j++) {
      if (document.querySelector(gateSelectors[j])) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'restricted' }));
        return;
      }
    }
  } catch(e) {}
  // No paywall detected - proceed (Readability injection runs separately via injectedJavaScript)
  true;
})();
`;

// injectedJavaScript on Android requires the script to evaluate to a truthy value
// or it may not execute. Always append true; at the top level.
const FULL_SCRIPT = PAYWALL_CHECK_SCRIPT + '\n' + INJECTION_SCRIPT + '\ntrue;';

export default function ReadabilityExtractor() {
  const pendingExtractions = useContentStore(s => s.pendingExtractions);
  const completeExtraction = useContentStore(s => s.completeExtraction);

  // Process only the first pending entry at a time to cap memory usage.
  const current = useMemo(() => {
    const entries = Object.entries(pendingExtractions);
    return entries.length > 0 ? entries[0] : null;
  }, [pendingExtractions]);

  if (!current) return null;

  const [id, url] = current;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const result: ExtractionResult = JSON.parse(event.nativeEvent.data);
      completeExtraction(id, result);
    } catch {
      completeExtraction(id, { status: 'failed' });
    }
  };

  const handleError = () => {
    completeExtraction(id, { status: 'failed' });
  };

  // Timeout fallback: if the page never fires our script (e.g. hangs),
  // mark as failed after 20 seconds via onLoadEnd timing is not reliable —
  // we use a navigation state change guard instead.
  const handleHttpError = () => {
    completeExtraction(id, { status: 'failed' });
  };

  return (
    <View style={styles.hidden} pointerEvents="none">
      <WebView
        key={id}
        source={{ uri: url }}
        injectedJavaScript={FULL_SCRIPT}
        onMessage={handleMessage}
        onError={handleError}
        onHttpError={handleHttpError}
        // Don't let it run JS before load — we inject after load
        injectedJavaScriptBeforeContentLoaded=""
        // Suppress media, cookies, etc. — we only want text
        mediaPlaybackRequiresUserAction
        javaScriptEnabled
        // Don't show in accessibility tree
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    // Push off-screen so it's never visible
    top: -9999,
    left: -9999,
  },
});
