// ==UserScript==
// @name         BrightEducation Reader Unlocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Unlocks right-click and text selection in BrightEducation epubjs reader for Speechify/Dyslexia support.
// @author       barleymane
// @match        https://www.brighteducation.io/*
// @icon         https://www.brighteducation.io/images/general/logo-green.png
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. Force CSS selection on every element (Live and Future)
    const styleCSS = `
        * {
            user-select: text !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
        }
    `;

    const unlockFrame = (doc) => {
        try {
            // Inject CSS into the frame
            const style = doc.createElement('style');
            style.innerHTML = styleCSS;
            doc.head.appendChild(style);

            // Kill event listeners that block right-click
            const events = ['contextmenu', 'copy', 'cut', 'paste', 'selectstart', 'mousedown', 'auxclick'];
            events.forEach(eventType => {
                doc.addEventListener(eventType, (e) => e.stopPropagation(), true);
            });

            // Specific fix for epubjs inner body
            if (doc.body) {
                doc.body.oncontextmenu = null;
                doc.body.onselectstart = null;
            }
        } catch (e) {
            // Usually occurs if frame is cross-origin, but srcdoc frames are usually accessible
        }
    };

    // 2. Watch for the epubjs iframe being created
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // If it's an iframe (like the epubjs-view one)
                if (node.tagName === 'IFRAME') {
                    node.addEventListener('load', () => unlockFrame(node.contentDocument));
                    // Initial unlock for srcdoc frames
                    unlockFrame(node.contentDocument);
                }
            });
        });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 3. Initial run for the main window
    const style = document.createElement('style');
    style.innerHTML = styleCSS;
    document.head.appendChild(style);

    window.addEventListener('contextmenu', (e) => e.stopPropagation(), true);
})();
