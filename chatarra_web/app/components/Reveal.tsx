'use client';

import { useEffect } from 'react';

/** Decode accidental literal \\uXXXX sequences left in text nodes (encoding bug safety net). */
function decodeUnicodeEscapesInDom() {
  const re = /\\u([0-9a-fA-F]{4})/g;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeValue && re.test(n.nodeValue)) nodes.push(n as Text);
    re.lastIndex = 0;
  }
  for (const node of nodes) {
    node.nodeValue = node.nodeValue!.replace(re, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
  }
}

/** Activa animación fade-up al entrar en viewport para elementos .reveal */
export default function RevealInit() {
  useEffect(() => {
    decodeUnicodeEscapesInDom();

    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealVisible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
