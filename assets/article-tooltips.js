/**
 * Article Tooltips - Wikipedia-style hover tooltips for blog articles
 * 
 * Usage in Shopify article editor (HTML mode):
 * <span class="article-tooltip" data-tooltip="Your brief explanation here">word or phrase</span>
 */

class ArticleTooltips extends HTMLElement {
  constructor() {
    super();
    this.tooltips = [];
    this.currentTooltip = null;
    this.hideTimeout = null;
  }

  connectedCallback() {
    this.init();
  }

  init() {
    // Find all elements with tooltip data
    const tooltipElements = this.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      this.setupTooltip(element);
    });
  }

  setupTooltip(element) {
    // Add a class for styling
    element.classList.add('has-tooltip');
    
    // Create tooltip element
    const tooltip = this.createTooltipElement(element.dataset.tooltip);
    
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

    this.tooltips.push({ element, tooltip });
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
    }, 100);
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

  disconnectedCallback() {
    // Cleanup: remove all tooltip elements
    this.tooltips.forEach(({ tooltip }) => {
      tooltip.remove();
    });
  }
}

customElements.define('article-tooltips', ArticleTooltips);

