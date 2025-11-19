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
  
      // 4) Replace [n] in text BEFORE the references section with anchors
      function replaceIn(el){
        if (el === refStart) return true;
        if (el.nodeType === Node.TEXT_NODE) {
          const text = el.nodeValue;
          if (!/\[(\d{1,3})\]/.test(text)) return false;
          const frag = document.createDocumentFragment();
          let last = 0, m;
          const re = /\[(\d{1,3})\]/g;
          while ((m = re.exec(text)) !== null) {
            const idx = m.index, num = m[1];
            frag.appendChild(document.createTextNode(text.slice(last, idx)));
            if (fnMap.has(num)) {
              const a = document.createElement('a');
              a.href = '#';  // Use # instead of #fn-{num} to prevent hash in URL
              a.className = 'fn-ref';
              a.dataset.fn = num;
              const sup = document.createElement('sup');
              sup.textContent = `[${num}]`;
              a.appendChild(sup);
              // Add click handler to expand references and scroll
              a.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                expandReferences();
                // Small delay to ensure references section starts expanding
                setTimeout(() => {
                  const target = document.getElementById(`fn-${num}`);
                  if (target) {
                    // Ensure the target is visible (references section is expanded)
                    if (!refContainer.classList.contains('fn-collapsible-open')) {
                      refContainer.classList.add('fn-collapsible-open');
                      expanded = true;
                      arrow.style.transform = 'rotate(180deg)';
                    }
                    // Short delay to allow element to become visible before scrolling
                    setTimeout(() => {
                      target.scrollIntoView({behavior:'smooth', block:'start'});
                      // Remove hash from URL if it was added
                      if (window.location.hash) {
                        history.replaceState(null, '', window.location.pathname + window.location.search);
                      }
                    }, 100); // Reduced delay - element becomes visible quickly
                  }
                }, 50);
              });
              frag.appendChild(a);
            } else {
              frag.appendChild(document.createTextNode(m[0]));
            }
            last = idx + m[0].length;
          }
          if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
          el.parentNode.replaceChild(frag, el);
          return false;
        }
        if (el.nodeType === Node.ELEMENT_NODE) {
          if (el.matches('script, style, noscript, .fn-tooltip')) return false;
          for (let n = el.firstChild; n; n = n.nextSibling) {
            if (replaceIn(n)) return true;
          }
        }
        return false;
      }
  
      let top = root.firstChild;
      while (top) {
        if (top === refStart) break;
        replaceIn(top);
        top = top.nextSibling;
      }
  
      // 5) Tooltip system
      const tip = document.createElement('div');
      tip.className = 'fn-tooltip';
      document.body.appendChild(tip);
  
      let currentRef = null;
  
      function positionTip(anchor){
        tip.style.left = '0px';
        tip.style.top = '-1000px';
        tip.dataset.show = 'true';
        const ar = anchor.getBoundingClientRect();
        const tr = tip.getBoundingClientRect();
        // Move tooltip 20px to the left of the anchor
        let left = Math.max(8, Math.min(ar.left - 20, window.innerWidth - tr.width - 8));
        let top = ar.top - tr.height - 12;
        if (top < 8) top = ar.bottom + 12;
        tip.style.left = `${left}px`;
        tip.style.top = `${top}px`;
      }
  
      function showTip(a){
        const num = a.dataset.fn;
        const data = fnMap.get(num);
        if (!data) return;
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
        
        tip.innerHTML = tempDiv.innerHTML.trim();
        positionTip(a);
        tip.dataset.show = 'true';
        currentRef = a;
      }
  
      function hideTip(){
        tip.dataset.show = 'false';
        currentRef = null;
      }
  
      document.addEventListener('mouseover', (e) => {
        const a = e.target.closest('a.fn-ref');
        if (a){ showTip(a); }
        else if (!tip.contains(e.target)){ hideTip(); }
      }, { passive:true });
  
      document.addEventListener('focusin', (e) => {
        const a = e.target.closest('a.fn-ref');
        if (a) showTip(a);
      });
      document.addEventListener('focusout', hideTip);
  
      window.addEventListener('scroll', () => {
        if (tip.dataset.show === 'true' && currentRef) positionTip(currentRef);
      }, { passive:true });
      window.addEventListener('resize', () => {
        if (tip.dataset.show === 'true' && currentRef) positionTip(currentRef);
      });
  
      log("Initialized with", fnMap.size, "references");
    });
  })();
  