// @ts-nocheck
/* eslint-env browser */
/* global Node, NodeFilter */
// Minimal, robust footnotes for Shopify articles.
// Works with either <hr> before references OR a "References" heading.
// Turns [1]... into links with hover tooltips and bottom anchors + collapsible References.

(function(){
  function log(){ console.log.apply(console, ["[footnotes]"].concat([].slice.call(arguments))); }
  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(() => {
    // Limit to article pages
    const isArticle = /\/blogs\/.+\/.+/.test(location.pathname) || document.querySelector('article, .article-template, [data-template*="article"]');
    if (!isArticle){ return; }

    const root = document.querySelector('.article-template, article, main, #MainContent, body') || document.body;

    // 1) Find where references start:
    let refStart = null;
    let hr = root.querySelector('hr');
    if (hr) {
      refStart = hr;
    } else {
      const headings = Array.from(root.querySelectorAll('h1,h2,h3,h4,strong,b,p'));
      const hit = headings.find(h => /references/i.test(h.textContent.trim()));
      if (hit) {
        refStart = hit;
        // Hide the original "References" text to avoid duplication with toggle button
        refStart.style.display = 'none';
      }
    }
    if (!refStart){ log("No <hr> or References heading found"); return; }

    // --- Make References section collapsible ---
    const refContainer = document.createElement('div');
    refContainer.className = 'fn-collapsible';

    // Wrap all following siblings (the references) inside this container
    let next = refStart.nextSibling;
    const collected = [];
    while (next) {
      const current = next;
      next = next.nextSibling;
      if (current.nodeType === Node.ELEMENT_NODE) {
        if (current.matches('section, article, .footer, footer')) break;
        collected.push(current);
      }
    }
    collected.forEach(el => refContainer.appendChild(el));
    refStart.insertAdjacentElement('afterend', refContainer);

    // Create separator line above toggle
    const separator = document.createElement('hr');
    separator.style.margin = '2rem 0 1rem 0';
    separator.style.borderTop = '1px solid #000';
    separator.style.borderBottom = 'none';
    separator.style.borderLeft = 'none';
    separator.style.borderRight = 'none';
    
    // Create toggle text
    const toggle = document.createElement('span');
    toggle.className = 'fn-toggle';
    const arrow = document.createElement('span');
    arrow.className = 'fn-arrow';
    arrow.textContent = '▾';
    toggle.appendChild(document.createTextNode('References '));
    toggle.appendChild(arrow);
    refStart.style.fontWeight = '700';
    refStart.insertAdjacentElement('afterend', separator);
    separator.insertAdjacentElement('afterend', toggle);

    // --- Start collapsed by default ---
    let expanded = false;
    refContainer.classList.remove('fn-collapsible-open');

    // Function to expand references section
    function expandReferences() {
      if (!expanded) {
        expanded = true;
        refContainer.classList.add('fn-collapsible-open');
        arrow.style.transform = 'rotate(180deg)';
      }
    }

    // Toggle open/close on click
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      if (expanded) {
        refContainer.classList.add('fn-collapsible-open');
        arrow.style.transform = 'rotate(180deg)';
      } else {
        refContainer.classList.remove('fn-collapsible-open');
        arrow.style.transform = 'rotate(0deg)';
      }
    });

    // 2) Collect bottom references into a map: { "1": {node, html} }
    const fnMap = new Map();
    let walker = refContainer.firstChild;

    while (walker) {
      if (walker.nodeType === Node.ELEMENT_NODE) {
        if (walker.matches('p, li, div')) {
          const txt = walker.textContent.trim();
          const m = txt.match(/^\[(\d{1,3})\]\s*/);
          if (m) {
            const num = m[1];
            const html = walker.innerHTML.replace(/^\[(\d{1,3})\]\s*/, '').trim();
            fnMap.set(num, { node: walker, html });
          }
        }

        if (walker.matches('ol, ul')) {
          walker.querySelectorAll('li').forEach(li => {
            const m = (li.textContent || "").trim().match(/^\[(\d{1,3})\]\s*/);
            if (m) {
              const num = m[1];
              const html = li.innerHTML.replace(/^\[(\d{1,3})\]\s*/, '').trim();
              fnMap.set(num, { node: li, html });
            }
          });
        }
      }
      walker = walker.nextSibling;
    }

    if (!fnMap.size){ log("No [n] lines found after references start"); return; }

    // 3) Ensure bottom items have ids + back link
    fnMap.forEach((val, num) => {
      const p = val.node;
      p.classList.add('fn-item');
      if (!p.id) p.id = `fn-${num}`;
      if (!p.querySelector('a.fn-back')) {
        const back = document.createElement('a');
        back.className = 'fn-back';
        back.href = '#';
        back.textContent = '↩︎ back';
        back.addEventListener('click', (e) => {
          e.preventDefault();
          const refAnchor = document.querySelector(`a.fn-ref[data-fn="${num}"]`);
          if (refAnchor) refAnchor.scrollIntoView({behavior:'smooth', block:'center'});
        });
        p.appendChild(back);
      }
    });

    function createFootnoteAnchor(num) {
      const a = document.createElement('a');
      a.href = '#';  // Use # instead of #fn-{num} to prevent hash in URL
      a.className = 'fn-ref';
      a.dataset.fn = num;
      const sup = document.createElement('sup');
      sup.textContent = `[${num}]`;
      a.appendChild(sup);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        expandReferences();
        setTimeout(() => {
          const target = document.getElementById(`fn-${num}`);
          if (target) {
            if (!refContainer.classList.contains('fn-collapsible-open')) {
              refContainer.classList.add('fn-collapsible-open');
              expanded = true;
              arrow.style.transform = 'rotate(180deg)';
            }
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            }, 100);
          }
        }, 50);
      });
      return a;
    }

    function buildReferenceFragment(text) {
      const frag = document.createDocumentFragment();
      let last = 0;
      let hadMatch = false;
      const re = /\[(\d{1,3})\]/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        const idx = m.index;
        if (idx > last) {
          frag.appendChild(document.createTextNode(text.slice(last, idx)));
        }
        const num = m[1];
        if (fnMap.has(num)) {
          frag.appendChild(createFootnoteAnchor(num));
          hadMatch = true;
        } else {
          frag.appendChild(document.createTextNode(m[0]));
        }
        last = idx + m[0].length;
      }
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }
      return hadMatch ? frag : null;
    }

    // 4) Replace [n] in text BEFORE the references section with anchors
    function replaceIn(el, options = {}){
      const { stopBeforeReferences = false, refsState = { reached: false } } = options;

      if (el === refStart && !stopBeforeReferences) return true;
      if (el.nodeType === Node.TEXT_NODE) {
        const text = el.nodeValue;
        if (!/\[(\d{1,3})\]/.test(text) && !stopBeforeReferences) return false;

        let workingText = text;
        if (stopBeforeReferences && !refsState.reached) {
          const refIdx = workingText.toLowerCase().indexOf('references');
          if (refIdx !== -1) {
            const afterText = workingText.slice(refIdx);
            const afterNode = document.createTextNode(afterText);
            el.parentNode.insertBefore(afterNode, el.nextSibling);
            workingText = workingText.slice(0, refIdx);
            el.nodeValue = workingText;
            refsState.reached = true;
            if (!/\[(\d{1,3})\]/.test(workingText)) {
              return true;
            }
          }
        }

        const fragment = buildReferenceFragment(workingText);
        if (fragment) {
          el.parentNode.replaceChild(fragment, el);
        }
        return refsState.reached;
      }
      if (el.nodeType === Node.ELEMENT_NODE) {
        if (el.matches('script, style, noscript, .fn-tooltip')) return false;
        for (let n = el.firstChild; n; n = n.nextSibling) {
            if (replaceIn(n, options)) return true;
        }
      }
      return false;
    }

    let top = root.firstChild;
    while (top) {
      if (top === refStart) {
        replaceIn(top, { stopBeforeReferences: true, refsState: { reached: false } });
        break;
      }
      replaceIn(top);
      top = top.nextSibling;
    }

    function convertLooseReferences() {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!/\[(\d{1,3})\]/.test(node.nodeValue)) return NodeFilter.FILTER_SKIP;
          if (refContainer && refContainer.contains(node)) return NodeFilter.FILTER_REJECT;
          if (refStart) {
            const relation = refStart.compareDocumentPosition(node);
            const beforeRef = Boolean(relation & Node.DOCUMENT_POSITION_PRECEDING);
            const containsRef = Boolean(relation & Node.DOCUMENT_POSITION_CONTAINS);
            if (!beforeRef && !containsRef) return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      const nodesToProcess = [];
      while (walker.nextNode()) {
        nodesToProcess.push(walker.currentNode);
      }

      nodesToProcess.forEach((textNode) => {
        const parent = textNode.parentNode;
        if (!parent) return;

        // Skip if already inside an existing fn-ref
        if (parent.closest && parent.closest('a.fn-ref')) return;

        const fragment = buildReferenceFragment(textNode.nodeValue);
        if (fragment) {
          parent.replaceChild(fragment, textNode);
        }
      });
    }

    convertLooseReferences();

    // 5) Tooltip system
    const tip = document.createElement('div');
    tip.className = 'fn-tooltip';
    document.body.appendChild(tip);

    let currentRef = null;
    let hideTimeout = null;

    function positionTip(anchor){
      // Position off-screen first to measure
      tip.style.left = '0px';
      tip.style.top = '-1000px';
      // Make it visible but off-screen for accurate measurement
      if (!tip.classList.contains('visible')) {
        tip.classList.add('visible');
      }
      
      // Force reflow to get accurate measurements after content is set
      void tip.offsetHeight;
      
      const triggerRect = anchor.getBoundingClientRect();
      const tooltipRect = tip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Default position: above the element, centered
      let top = triggerRect.top + scrollY - tooltipRect.height - 10;
      let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);

      // Check if tooltip goes off the top of the screen
      if (top < scrollY + 10) {
        // Position below the element instead
        top = triggerRect.bottom + scrollY + 10;
        tip.classList.add('below');
      } else {
        tip.classList.remove('below');
      }

      // Check if tooltip goes off the right side
      if (left + tooltipRect.width > scrollX + viewportWidth - 20) {
        left = scrollX + viewportWidth - tooltipRect.width - 20;
      }

      // Check if tooltip goes off the left side
      if (left < scrollX + 20) {
        left = scrollX + 20;
      }
      
      // Ensure tooltip doesn't exceed viewport width
      const maxTooltipWidth = viewportWidth - 40; // 20px margin on each side
      if (tooltipRect.width > maxTooltipWidth) {
        tip.style.maxWidth = `${maxTooltipWidth}px`;
        tip.style.width = 'auto';
        // Re-measure after width change
        void tip.offsetHeight;
        const newTooltipRect = tip.getBoundingClientRect();
        // Recalculate left position with new width
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (newTooltipRect.width / 2);
        if (left + newTooltipRect.width > scrollX + viewportWidth - 20) {
          left = scrollX + viewportWidth - newTooltipRect.width - 20;
        }
        if (left < scrollX + 20) {
          left = scrollX + 20;
        }
      }

      tip.style.top = `${top}px`;
      tip.style.left = `${left}px`;
    }

    function showTip(a){
      const num = a.dataset.fn;
      const data = fnMap.get(num);
      if (!data) return;
      
      // Cancel any pending hide
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Remove [n] prefix from tooltip content
      let tooltipHtml = data.html;
      // Remove [n] pattern at the start of the content (including any spaces)
      tooltipHtml = tooltipHtml.replace(/^\[(\d{1,3})\]\s*/, '');
      // Also remove any [n] patterns that might be in the text content
      tooltipHtml = tooltipHtml.replace(/\[(\d{1,3})\]\s*/g, '');
      
      // Create a temporary element to clean up the HTML structure
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = tooltipHtml;
      
      // Remove leading whitespace from all text nodes
      function cleanTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          // Remove leading spaces from text nodes
          node.textContent = node.textContent.replace(/^\s+/, '');
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Process all child nodes
          const children = Array.from(node.childNodes);
          children.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && child === node.firstChild) {
              // Remove leading spaces from first text node
              child.textContent = child.textContent.replace(/^\s+/, '');
            }
            cleanTextNodes(child);
          });
        }
      }
      
      cleanTextNodes(tempDiv);
      
      // Remove any empty text nodes at the start
      while (tempDiv.firstChild && 
             tempDiv.firstChild.nodeType === Node.TEXT_NODE && 
             tempDiv.firstChild.textContent.trim() === '') {
        tempDiv.removeChild(tempDiv.firstChild);
      }
      
      const cleanedContent = tempDiv.innerHTML.trim();
      if (!cleanedContent) return;
      
      // Build tooltip HTML with only content (no header)
      const tooltipContent = `
        <div class="fn-tooltip-content">
          <div class="fn-tooltip-text">${cleanedContent}</div>
        </div>
      `;
      
      tip.innerHTML = tooltipContent;
      
      // Position the tooltip
      positionTip(a);
      
      // Show with a slight delay for smoother UX
      setTimeout(() => {
        tip.classList.add('visible');
        currentRef = a;
      }, 50);
    }

    function scheduleHideTip(){
      hideTimeout = setTimeout(() => {
        hideTip();
      }, 200);
    }

    function cancelHideTip() {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }

    function hideTip(){
      tip.classList.remove('visible');
      currentRef = null;
    }

    // Mouse events
    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest('a.fn-ref');
      if (a) {
        showTip(a);
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const a = e.target.closest('a.fn-ref');
      if (a && !tip.contains(e.relatedTarget)) {
        scheduleHideTip();
      }
    }, { passive: true });

    // Keep tooltip visible when hovering over it
    tip.addEventListener('mouseenter', () => {
      cancelHideTip();
    });

    tip.addEventListener('mouseleave', () => {
      hideTip();
    });

    // Focus events
    document.addEventListener('focusin', (e) => {
      const a = e.target.closest('a.fn-ref');
      if (a) showTip(a);
    });
    document.addEventListener('focusout', (e) => {
      const a = e.target.closest('a.fn-ref');
      if (a && !tip.contains(e.target)) {
        scheduleHideTip();
      }
    });

    // Update position on scroll/resize
    window.addEventListener('scroll', () => {
      if (tip.classList.contains('visible') && currentRef) {
        positionTip(currentRef);
      }
    }, { passive:true });
    
    window.addEventListener('resize', () => {
      if (tip.classList.contains('visible') && currentRef) {
        positionTip(currentRef);
      }
    });

    log("Initialized with", fnMap.size, "references");
  });
})();
