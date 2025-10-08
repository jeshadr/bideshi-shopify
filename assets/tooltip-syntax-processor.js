/**
 * Tooltip Syntax Processor
 * 
 * Processes lightweight inline syntax: [[[term|definition]]]
 * Automatically converts to proper tooltip HTML
 */

class TooltipSyntaxProcessor {
  constructor() {
    this.syntaxPattern = /\[\[\[([^|]+)\|([^\]]+)\]\]\]/g;
    this.init();
  }

  init() {
    // Process content when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.processContent());
    } else {
      this.processContent();
    }

    // Also process dynamically added content
    this.setupMutationObserver();
  }

  processContent() {
    const contentElements = document.querySelectorAll('.blog-post-content, .rte, article');
    
    contentElements.forEach(element => {
      this.processElement(element);
    });
  }

  processElement(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    
    // Collect all text nodes
    while (node = walker.nextNode()) {
      if (node.textContent.includes('[[')) {
        textNodes.push(node);
      }
    }

    // Process each text node
    textNodes.forEach(textNode => {
      this.processTextNode(textNode);
    });
  }

  processTextNode(textNode) {
    const originalText = textNode.textContent;
    
    // Check if the text contains our syntax
    if (!this.syntaxPattern.test(originalText)) {
      return;
    }

    // Reset regex lastIndex
    this.syntaxPattern.lastIndex = 0;

    // Replace syntax with HTML
    const newHTML = originalText.replace(this.syntaxPattern, (match, term, definition) => {
      // Clean up the term and definition
      const cleanTerm = term.trim();
      const cleanDefinition = definition.trim();
      
      // Create tooltip HTML
      return `<span data-tooltip="${this.escapeHTML(cleanDefinition)}" class="has-tooltip">${this.escapeHTML(cleanTerm)}</span>`;
    });

    // Only replace if content changed
    if (newHTML !== originalText) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = newHTML;
      
      // Replace the text node with the new content
      const parent = textNode.parentNode;
      while (wrapper.firstChild) {
        parent.insertBefore(wrapper.firstChild, textNode);
      }
      parent.removeChild(textNode);
    }
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node contains our syntax
              if (node.textContent && node.textContent.includes('[[')) {
                this.processElement(node);
              }
            }
          });
        }
      });
    });

    // Observe the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Manual processing method for testing
  processText(text) {
    return text.replace(this.syntaxPattern, (match, term, definition) => {
      const cleanTerm = term.trim();
      const cleanDefinition = definition.trim();
      return `<span data-tooltip="${this.escapeHTML(cleanDefinition)}" class="has-tooltip">${this.escapeHTML(cleanTerm)}</span>`;
    });
  }
}

// Initialize the processor
new TooltipSyntaxProcessor();

// Make it globally available for testing
window.TooltipSyntaxProcessor = TooltipSyntaxProcessor;
