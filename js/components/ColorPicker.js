/**
 * Color Picker Component with integrated opacity slider
 * Based on the reference design with Tailwind styling
 */

class ColorPickerComponent {
  constructor(config) {
    this.label = config.label;
    this.initialColor = config.color || '#ff0000';
    this.initialOpacity = config.opacity !== undefined ? config.opacity : 1;
    this.onChange = config.onChange || (() => {});
    this.isOpen = false;
    this.currentColor = this.initialColor;
    this.currentOpacity = this.initialOpacity;

    this.element = this.render();
    this.attachEvents();
  }

  render() {
    const container = createElement('div', {
      className: 'go-ext-color-picker-container'
    });

    // Label and preview button
    const button = createElement('button', {
      className: 'go-ext-color-picker-button',
      type: 'button'
    });

    const labelEl = createElement('span', {
      className: 'go-ext-color-picker-label',
      textContent: this.label
    });

    const preview = createElement('div', {
      className: 'go-ext-color-picker-preview'
    });
    preview.style.backgroundColor = this.currentColor;
    preview.style.opacity = this.currentOpacity;

    button.appendChild(labelEl);
    button.appendChild(preview);

    // Dropdown panel
    const dropdown = createElement('div', {
      className: 'go-ext-color-picker-dropdown'
    });
    dropdown.style.display = 'none';

    // Color gradient canvas
    const gradientCanvas = createElement('canvas', {
      className: 'go-ext-color-picker-gradient',
      width: '280',
      height: '160'
    });

    // Hue slider
    const hueSlider = createElement('input', {
      type: 'range',
      className: 'go-ext-color-picker-hue-slider',
      min: '0',
      max: '360',
      value: '0'
    });

    // Opacity slider
    const opacityContainer = createElement('div', {
      className: 'go-ext-color-picker-opacity-container'
    });

    const opacityLabel = createElement('span', {
      className: 'go-ext-color-picker-opacity-label',
      textContent: 'Opacity'
    });

    const opacityValue = createElement('span', {
      className: 'go-ext-color-picker-opacity-value',
      textContent: Math.round(this.currentOpacity * 100) + '%'
    });

    const opacitySlider = createElement('input', {
      type: 'range',
      className: 'go-ext-color-picker-opacity-slider',
      min: '0',
      max: '100',
      value: Math.round(this.currentOpacity * 100).toString()
    });

    opacityContainer.appendChild(opacityLabel);
    opacityContainer.appendChild(opacitySlider);
    opacityContainer.appendChild(opacityValue);

    // Hex input container
    const hexContainer = createElement('div', {
      className: 'go-ext-color-picker-hex-container'
    });

    const hexLabel = createElement('span', {
      className: 'go-ext-color-picker-hex-label',
      textContent: 'Hex'
    });

    const hexInput = createElement('input', {
      type: 'text',
      className: 'go-ext-color-picker-hex-input',
      value: this.currentColor,
      maxlength: '7'
    });

    hexContainer.appendChild(hexLabel);
    hexContainer.appendChild(hexInput);

    dropdown.appendChild(gradientCanvas);
    dropdown.appendChild(hueSlider);
    dropdown.appendChild(opacityContainer);
    dropdown.appendChild(hexContainer);

    container.appendChild(button);
    container.appendChild(dropdown);

    // Store references
    this.button = button;
    this.dropdown = dropdown;
    this.preview = preview;
    this.gradientCanvas = gradientCanvas;
    this.hueSlider = hueSlider;
    this.opacitySlider = opacitySlider;
    this.opacityValue = opacityValue;
    this.hexInput = hexInput;

    return container;
  }

  attachEvents() {
    // Toggle dropdown
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.element.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Hue slider
    this.hueSlider.addEventListener('input', () => {
      this.drawGradient();
    });

    // Gradient canvas click
    this.gradientCanvas.addEventListener('click', (e) => {
      this.selectColorFromGradient(e);
    });

    // Opacity slider
    this.opacitySlider.addEventListener('input', () => {
      this.currentOpacity = parseInt(this.opacitySlider.value) / 100;
      this.opacityValue.textContent = this.opacitySlider.value + '%';
      this.updatePreview();
      this.triggerChange();
    });

    // Hex input
    this.hexInput.addEventListener('input', () => {
      const hex = this.hexInput.value;
      if (/^#[0-9A-F]{6}$/i.test(hex)) {
        this.currentColor = hex;
        this.updatePreview();
        this.triggerChange();
      }
    });
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.isOpen = true;
    this.dropdown.style.display = 'block';
    this.drawGradient();
  }

  closeDropdown() {
    this.isOpen = false;
    this.dropdown.style.display = 'none';
  }

  drawGradient() {
    const ctx = this.gradientCanvas.getContext('2d');
    const width = this.gradientCanvas.width;
    const height = this.gradientCanvas.height;
    const hue = this.hueSlider.value;

    // Draw saturation/brightness gradient
    for (let y = 0; y < height; y++) {
      const brightness = 1 - (y / height);
      for (let x = 0; x < width; x++) {
        const saturation = x / width;
        const color = this.hsbToRgb(hue, saturation, brightness);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  selectColorFromGradient(e) {
    const rect = this.gradientCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const saturation = x / rect.width;
    const brightness = 1 - (y / rect.height);
    const hue = this.hueSlider.value;

    const rgb = this.hsbToRgb(hue, saturation, brightness);
    this.currentColor = rgbToHex(rgb.r, rgb.g, rgb.b);

    this.hexInput.value = this.currentColor;
    this.updatePreview();
    this.triggerChange();
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

  updatePreview() {
    this.preview.style.backgroundColor = this.currentColor;
    this.preview.style.opacity = this.currentOpacity;
  }

  triggerChange() {
    this.onChange({
      color: this.currentColor,
      opacity: this.currentOpacity
    });
  }

  setValue(color, opacity) {
    this.currentColor = color;
    this.currentOpacity = opacity;
    this.hexInput.value = color;
    this.opacitySlider.value = Math.round(opacity * 100);
    this.opacityValue.textContent = Math.round(opacity * 100) + '%';
    this.updatePreview();
  }
}
