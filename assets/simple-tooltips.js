/**
 * Simple Tooltips - Direct approach without custom elements
 * 
 * Processes [[[term|definition]]] syntax and creates working tooltips
 */

class SimpleTooltips {
  constructor() {
    this.tooltips = [];
    this.currentTooltip = null;
    this.hideTimeout = null;
    this.init();
  }

  init() {
    // Process existing content
    this.processContent();
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
  }

  processContent() {
    // Find all elements with tooltip data that aren't already processed
    const tooltipElements = document.querySelectorAll('[data-tooltip]:not(.tooltip-processed)');
    
    tooltipElements.forEach(element => {
      this.setupTooltip(element);
    });
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node has tooltip data
              if (node.hasAttribute && node.hasAttribute('data-tooltip') && !node.classList.contains('tooltip-processed')) {
                this.setupTooltip(node);
              }
              // Check if the added node contains tooltips
              const tooltips = node.querySelectorAll && node.querySelectorAll('[data-tooltip]:not(.tooltip-processed)');
              if (tooltips) {
                tooltips.forEach(tooltip => this.setupTooltip(tooltip));
              }
            }
          });
        }
      });
    });

    // Observe the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupTooltip(element) {
    // Skip if already processed
    if (element.classList.contains('tooltip-processed')) {
      return;
    }

    // Mark as processed
    element.classList.add('tooltip-processed', 'has-tooltip');
    
    // Create tooltip element
    const tooltip = this.createTooltipElement(element.dataset.tooltip);
    
    // Store reference
    this.tooltips.push({ element, tooltip });
    
    // Mouse events
    element.addEventListener('mouseenter', (e) => {
      this.showTooltip(tooltip, element);
    });

    element.addEventListener('mouseleave', (e) => {
      this.scheduleHideTooltip(tooltip);
    });

    // Touch events for mobile
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.currentTooltip === tooltip && tooltip.classList.contains('visible')) {
        this.hideTooltip(tooltip);
      } else {
        this.showTooltip(tooltip, element);
      }
    }, { passive: false });

    // Keep tooltip visible when hovering over it
    tooltip.addEventListener('mouseenter', () => {
      this.cancelHideTooltip();
    });

    tooltip.addEventListener('mouseleave', () => {
      this.hideTooltip(tooltip);
    });
  }

  createTooltipElement(content) {
    const tooltip = document.createElement('div');
    tooltip.className = 'article-tooltip-popup';
    tooltip.innerHTML = `
      <div class="article-tooltip-content">
        ${content}
      </div>
    `;
    document.body.appendChild(tooltip);
    return tooltip;
  }

  showTooltip(tooltip, triggerElement) {
    // Hide any currently visible tooltip
    if (this.currentTooltip && this.currentTooltip !== tooltip) {
      this.hideTooltip(this.currentTooltip);
    }

    this.cancelHideTooltip();
    
    // Position the tooltip
    this.positionTooltip(tooltip, triggerElement);
    
    // Show with a slight delay for smoother UX
    setTimeout(() => {
      tooltip.classList.add('visible');
      this.currentTooltip = tooltip;
    }, 50);
  }

  scheduleHideTooltip(tooltip) {
    this.hideTimeout = setTimeout(() => {
      this.hideTooltip(tooltip);
    }, 200);
  }

  cancelHideTooltip() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  hideTooltip(tooltip) {
    tooltip.classList.remove('visible');
    if (this.currentTooltip === tooltip) {
      this.currentTooltip = null;
    }
  }

  positionTooltip(tooltip, triggerElement) {
    const triggerRect = triggerElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
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
      tooltip.classList.add('below');
    } else {
      tooltip.classList.remove('below');
    }

    // Check if tooltip goes off the right side
    if (left + tooltipRect.width > scrollX + viewportWidth - 20) {
      left = scrollX + viewportWidth - tooltipRect.width - 20;
    }

    // Check if tooltip goes off the left side
    if (left < scrollX + 20) {
      left = scrollX + 20;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SimpleTooltips());
} else {
  new SimpleTooltips();
}

// Also initialize after a short delay to catch syntax processor results
setTimeout(() => {
  new SimpleTooltips();
}, 500);
