/**
 * Utility functions for the Grid Overlay extension
 */

window.GridOverlay = window.GridOverlay || {};

/**
 * Debounce function to limit function execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
window.GridOverlay.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
window.GridOverlay.sanitizeHTML = function(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Create element with properties and children
 * @param {string} tag - HTML tag name
 * @param {Object} properties - Element properties
 * @param {Array} children - Child elements or strings
 * @returns {HTMLElement} Created element
 */
window.GridOverlay.createElement = function(tag, properties = {}, children = []) {
  const element = document.createElement(tag);

  Object.entries(properties).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child) {
      element.appendChild(child);
    }
  });

  return element;
};

/**
 * Check if extension context is valid
 * @returns {boolean} True if context is valid
 */
window.GridOverlay.isExtensionContextValid = function() {
  try {
    return chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
};

/**
 * Validate and sanitize preset name
 * @param {string} name - Preset name to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} Sanitized name or null if invalid
 */
window.GridOverlay.sanitizePresetName = function(name, maxLength = 50) {
  if (!name || typeof name !== 'string') return null;
  const sanitized = window.GridOverlay.sanitizeHTML(name.trim()).substring(0, maxLength);
  return sanitized.replace(/[^a-zA-Z0-9\s\-_]/g, '');
};

/**
 * Ensure backwards compatibility for rowGap in config
 * @param {Object} config - Grid configuration
 * @param {number} defaultRowGap - Default row gap value
 * @returns {Object} Config with rowGap ensured
 */
window.GridOverlay.ensureRowGapCompatibility = function(config, defaultRowGap = 8) {
  if (config.rowGap === undefined) {
    config.rowGap = defaultRowGap;
  }
  if (config.breakpoints) {
    config.breakpoints.forEach(bp => {
      if (bp.rowGap === undefined) {
        bp.rowGap = defaultRowGap;
      }
    });
  }
  return config;
};
