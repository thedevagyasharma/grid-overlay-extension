/**
 * Utility Helper Functions
 */

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize HTML string to prevent XSS
 */
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create element with properties and children
 */
function createElement(tag, properties = {}, children = []) {
  const element = document.createElement(tag);

  Object.entries(properties).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
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
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Clamp number between min and max
 */
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Format number with unit
 */
function formatWithUnit(value, unit) {
  return `${value}${unit}`;
}

/**
 * Split a CSS length value into its numeric and unit parts for display.
 * Simple lengths (16px, 1rem) split cleanly. CSS functions (calc, clamp)
 * keep the full expression as the numeric part and the function name as the unit.
 * Bare numbers are treated as px.
 */
function splitCSSLength(value) {
  const str = String(value ?? '').trim();
  if (!str || str === '0') return { num: str || '0', unit: '' };
  // Bare number — treat as px
  if (/^-?\d+(\.\d+)?$/.test(str)) return { num: str, unit: 'px' };
  // Simple length: number + unit
  const simple = str.match(/^(-?\d+(?:\.\d+)?)([a-z%]+)$/i);
  if (simple) return { num: simple[1], unit: simple[2] };
  // CSS function or other complex expression — can't split
  const fn = str.match(/^(calc|clamp|min|max)\s*\(/i);
  return { num: str, unit: fn ? fn[1].toLowerCase() : '' };
}

/**
 * Extract just the unit string from a CSS length value (for live badge updates while typing).
 */
function extractCSSUnit(value) {
  return splitCSSLength(value).unit;
}

/**
 * Evaluate a simple arithmetic expression string (+, -, *, /, parentheses).
 * Uses a recursive descent parser — no eval or Function constructor (CSP-safe).
 * Returns the numeric result, or null if the expression is invalid.
 */
function _evalArithExpr(exprStr) {
  const e = exprStr.replace(/\s+/g, '');
  if (!e || !/^[\d+\-*/().]+$/.test(e)) return null;
  const s = { i: 0 };

  function addSub() {
    let v = mulDiv();
    while (s.i < e.length && (e[s.i] === '+' || e[s.i] === '-')) {
      const op = e[s.i++];
      v = op === '+' ? v + mulDiv() : v - mulDiv();
    }
    return v;
  }
  function mulDiv() {
    let v = primary();
    while (s.i < e.length && (e[s.i] === '*' || e[s.i] === '/')) {
      const op = e[s.i++];
      const r = primary();
      if (op === '/' && r === 0) throw new Error('div/0');
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }
  function primary() {
    if (e[s.i] === '(') {
      s.i++;
      const v = addSub();
      if (e[s.i++] !== ')') throw new Error('Expected )');
      return v;
    }
    const m = e.slice(s.i).match(/^-?\d+(?:\.\d+)?/);
    if (!m) throw new Error('Expected number');
    s.i += m[0].length;
    return parseFloat(m[0]);
  }

  try {
    const result = addSub();
    return s.i === e.length && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/**
 * Pre-process a CSS length input that may contain arithmetic in the numeric part.
 * e.g. "540/16rem" → "33.75rem", "1440/16px" → "90px", "100-32px" → "68px"
 * Returns the input unchanged if no arithmetic is detected or evaluation fails.
 */
function preprocessCSSInput(raw) {
  if (!raw) return raw;
  // Match: {numeric expression}{unit}
  const match = raw.match(/^([\d\s+\-*/().]+)([a-z%]+)$/i);
  if (!match) return raw;

  const expr = match[1].trim();
  const unit = match[2];

  // Skip plain numbers (no operators/parens) and plain negative numbers
  if (!/[+\-*/()]/.test(expr)) return raw;
  if (/^-?\d+(\.\d+)?$/.test(expr)) return raw;

  const result = _evalArithExpr(expr);
  if (result === null) return raw;
  return parseFloat(result.toFixed(6)) + unit;
}

/**
 * Resolve a CSS length value to pixels.
 * Accepts numbers (returned as-is), bare numeric strings (treated as px),
 * and any valid CSS length string (resolved via DOM).
 */
function resolveCSSLengthToPx(value) {
  if (typeof value === 'number') return value;
  if (!value && value !== 0) return 0;
  const str = String(value).trim();
  if (!str || str === '0') return 0;
  // Bare number (e.g. "16") — treat as px
  const num = parseFloat(str);
  if (!isNaN(num) && /^-?\d+(\.\d+)?$/.test(str)) return num;
  // Use DOM to resolve CSS length (rem, em, vw, calc, clamp, etc.)
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:' + str;
  document.documentElement.appendChild(el);
  const px = el.getBoundingClientRect().width;
  el.remove();
  return isNaN(px) ? 0 : px;
}
