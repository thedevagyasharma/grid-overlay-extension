/**
 * Color Picker Popup Component
 * Popup-based color picker with gradient, sliders, and hex input
 */

class ColorPickerPopupComponent {
  constructor(config) {
    this.title = config.title || 'Color Picker';
    this.initialColor = config.color || '#ff0000';
    this.initialOpacity = config.opacity !== undefined ? config.opacity : 1;
    this.onChange = config.onChange || (() => {});
    this.onClose = config.onClose || (() => {});

    // Color state
    this.currentColor = this.initialColor;
    this.currentOpacity = this.initialOpacity;
    this.lastValidHex = this.initialColor;

    // HSB values for gradient
    this.hue = 0;
    this.saturation = 1;
    this.brightness = 1;

    // Drag state
    this.isDragging = false;

    // Initialize HSB from hex
    this.updateHSBFromHex(this.currentColor);

    // Create popup frame
    this.popup = new PopupFrameComponent({
      title: this.title,
      content: this.renderContent(),
      width: '260px',
      onClose: () => {
        this.onClose();
      }
    });

    this.element = this.popup.element;
    this.attachEvents();
  }

  renderContent() {
    const content = createElement('div', {
      className: 'go-ext-color-picker-popup'
    });

    // Color gradient canvas
    const gradientCanvas = createElement('canvas', {
      className: 'go-ext-color-picker-popup__gradient',
      width: '228',
      height: '160'
    });

    // Hue slider
    const hueSlider = createElement('input', {
      type: 'range',
      className: 'go-ext-color-picker-popup__hue-slider',
      min: '0',
      max: '360',
      value: this.hue.toString()
    });

    // Inputs row (Hex | Opacity side-by-side)
    const inputsRow = createElement('div', {
      className: 'go-ext-color-picker-popup__inputs-row'
    });

    // Hex input group
    const hexGroup = createElement('div', {
      className: 'go-ext-color-picker-popup__input-group'
    });

    const hexLabel = createElement('label', {
      className: 'go-ext-form-label',
      textContent: 'Hex'
    });

    const hexInputWrapper = createElement('div', {
      className: 'go-ext-input-wrapper'
    });

    const hexInput = createElement('input', {
      type: 'text',
      className: 'go-ext-input',
      value: this.currentColor,
      maxlength: '7'
    });

    hexInputWrapper.appendChild(hexInput);
    hexGroup.appendChild(hexLabel);
    hexGroup.appendChild(hexInputWrapper);

    // Opacity input group
    const opacityGroup = createElement('div', {
      className: 'go-ext-color-picker-popup__input-group'
    });

    const opacityLabel = createElement('label', {
      className: 'go-ext-form-label',
      textContent: 'Opacity'
    });

    const opacityInputWrapper = createElement('div', {
      className: 'go-ext-input-wrapper'
    });

    const opacityInput = createElement('input', {
      type: 'number',
      className: 'go-ext-input',
      min: '0',
      max: '100',
      value: Math.round(this.currentOpacity * 100).toString()
    });

    const opacityUnit = createElement('span', {
      className: 'go-ext-input-unit',
      textContent: '%'
    });

    opacityInputWrapper.appendChild(opacityInput);
    opacityInputWrapper.appendChild(opacityUnit);
    opacityGroup.appendChild(opacityLabel);
    opacityGroup.appendChild(opacityInputWrapper);

    inputsRow.appendChild(hexGroup);
    inputsRow.appendChild(opacityGroup);

    // Assemble content
    content.appendChild(gradientCanvas);
    content.appendChild(hueSlider);
    content.appendChild(inputsRow);

    // Store references
    this.gradientCanvas = gradientCanvas;
    this.hueSlider = hueSlider;
    this.hexInput = hexInput;
    this.hexInputWrapper = hexInputWrapper;
    this.opacityInput = opacityInput;

    return content;
  }

  attachEvents() {
    // Hue slider - real-time updates
    this.hueSlider.addEventListener('input', () => {
      this.hue = parseInt(this.hueSlider.value);
      this.drawGradient();
      this.updateColorFromHSB();
    });

    // Gradient canvas - drag support
    this.gradientCanvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.selectColorFromGradient(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.selectColorFromGradient(e);
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
      }
    });

    // Opacity text input
    this.opacityInput.addEventListener('input', () => {
      let value = parseInt(this.opacityInput.value) || 0;
      value = clamp(value, 0, 100);
      this.currentOpacity = value / 100;
      this.triggerChange();
    });

    this.opacityInput.addEventListener('blur', () => {
      // Ensure value is clamped on blur
      let value = parseInt(this.opacityInput.value) || 0;
      value = clamp(value, 0, 100);
      this.opacityInput.value = value.toString();
    });

    // Hex input - validate on blur
    this.hexInput.addEventListener('blur', (e) => {
      const value = e.target.value.trim();
      const hexRegex = /^#[0-9A-F]{6}$/i;

      if (value !== '' && !hexRegex.test(value)) {
        // Invalid: empty field + show error
        e.target.value = '';
        this.hexInputWrapper.classList.add('invalid');

        // Auto-remove error styling after 500ms
        setTimeout(() => {
          this.hexInputWrapper.classList.remove('invalid');
        }, 500);
      } else if (hexRegex.test(value)) {
        // Valid: update color
        this.lastValidHex = value;
        this.currentColor = value;
        this.updateHSBFromHex(value);
        this.drawGradient();
        this.triggerChange();
      }
    });

    // Draw initial gradient
    setTimeout(() => {
      this.drawGradient();
    }, 10);
  }

  drawGradient() {
    const ctx = this.gradientCanvas.getContext('2d');
    const width = this.gradientCanvas.width;
    const height = this.gradientCanvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw saturation/brightness gradient
    for (let y = 0; y < height; y++) {
      const brightness = 1 - (y / height);
      for (let x = 0; x < width; x++) {
        const saturation = x / width;
        const color = this.hsbToRgb(this.hue, saturation, brightness);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw current color indicator
    this.drawColorIndicator(ctx);
  }

  drawColorIndicator(ctx) {
    const x = this.saturation * this.gradientCanvas.width;
    const y = (1 - this.brightness) * this.gradientCanvas.height;

    // Outer ring (dark)
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner ring (white)
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  selectColorFromGradient(e) {
    const rect = this.gradientCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp to canvas bounds
    x = clamp(x, 0, rect.width);
    y = clamp(y, 0, rect.height);

    this.saturation = x / rect.width;
    this.brightness = 1 - (y / rect.height);

    this.updateColorFromHSB();
    this.drawGradient();
  }

  updateColorFromHSB() {
    const rgb = this.hsbToRgb(this.hue, this.saturation, this.brightness);
    this.currentColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    this.lastValidHex = this.currentColor;
    this.hexInput.value = this.currentColor;
    this.triggerChange();
  }

  updateHSBFromHex(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Brightness
    this.brightness = max;

    // Saturation
    this.saturation = max === 0 ? 0 : delta / max;

    // Hue
    if (delta === 0) {
      this.hue = 0;
    } else if (max === r) {
      this.hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      this.hue = 60 * (((b - r) / delta) + 2);
    } else {
      this.hue = 60 * (((r - g) / delta) + 4);
    }

    if (this.hue < 0) this.hue += 360;

    // Update slider
    if (this.hueSlider) {
      this.hueSlider.value = Math.round(this.hue);
    }
  }


  hsbToRgb(h, s, b) {
    h = h / 360;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = b * (1 - s);
    const q = b * (1 - f * s);
    const t = b * (1 - (1 - f) * s);

    let r, g, blue;
    switch (i % 6) {
      case 0: r = b; g = t; blue = p; break;
      case 1: r = q; g = b; blue = p; break;
      case 2: r = p; g = b; blue = t; break;
      case 3: r = p; g = q; blue = b; break;
      case 4: r = t; g = p; blue = b; break;
      case 5: r = b; g = p; blue = q; break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(blue * 255)
    };
  }

  triggerChange() {
    this.onChange({
      color: this.currentColor,
      opacity: this.currentOpacity
    });
  }

  show(parent) {
    this.popup.show(parent);
  }

  close() {
    this.popup.close();
  }

  setValue(color, opacity) {
    this.currentColor = color;
    this.currentOpacity = opacity;
    this.lastValidHex = color;
    this.hexInput.value = color;
    this.opacityInput.value = Math.round(opacity * 100);
    this.updateHSBFromHex(color);
    this.drawGradient();
  }
}
