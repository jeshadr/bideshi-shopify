/**
 * Tooltip Syntax Processor
 * 
 * Processes lightweight inline syntax: [[[term|definition]]]
 * Automatically converts to proper tooltip HTML
 */

class TooltipSyntaxProcessor {
  constructor() {
    // More robust regex that handles HTML content properly
    // Looks for the pattern: [[[content|content]]] where | is not inside HTML tags
    this.syntaxPattern = /\[\[\[(.*?)\|(.*?)\]\]\]/gs;
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
    if (!originalText.includes('[[')) {
      return;
    }

    // Use a more sophisticated parser for HTML content
    const newHTML = this.parseTooltipSyntax(originalText);

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

  parseTooltipSyntax(text) {
    let result = text;
    let startIndex = 0;
    
    while (true) {
      // Find the start of a tooltip pattern
      const startMatch = result.indexOf('[[[', startIndex);
      if (startMatch === -1) break;
      
      // Find the corresponding closing ]]]
      const endMatch = result.indexOf(']]]', startMatch + 3);
      if (endMatch === -1) break;
      
      // Extract the content between [[[ and ]]]
      const content = result.substring(startMatch + 3, endMatch);
      
      // Find the pipe separator that's not inside HTML tags
      const pipeIndex = this.findPipeOutsideTags(content);
      
      if (pipeIndex !== -1) {
        const term = content.substring(0, pipeIndex).trim();
        const definition = content.substring(pipeIndex + 1).trim();
        
        // Create the tooltip HTML
        const tooltipHTML = `<span data-tooltip="${definition}" class="has-tooltip">${term}</span>`;
        
        // Replace the original pattern with the tooltip HTML
        result = result.substring(0, startMatch) + tooltipHTML + result.substring(endMatch + 3);
        
        // Update startIndex to continue from after the replacement
        startIndex = startMatch + tooltipHTML.length;
      } else {
        // No valid pipe found, skip this pattern
        startIndex = endMatch + 3;
      }
    }
    
    return result;
  }

  findPipeOutsideTags(content) {
    let inTag = false;
    let tagDepth = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (char === '<') {
        inTag = true;
        tagDepth++;
      } else if (char === '>') {
        inTag = false;
        tagDepth--;
      } else if (char === '|' && !inTag && tagDepth === 0) {
        return i;
      }
    }
    
    return -1;
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
    return this.parseTooltipSyntax(text);
  }
}

// Initialize the processor
new TooltipSyntaxProcessor();

// Make it globally available for testing
window.TooltipSyntaxProcessor = TooltipSyntaxProcessor;
