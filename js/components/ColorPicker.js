/**
 * Color Picker Component - Trigger button for popup color picker
 */

class ColorPickerComponent {
  constructor(config) {
    this.label = config.label;
    this.title = config.title || config.label + ' Color';
    this.type = config.type; // 'grid' or 'padding'
    this.initialColor = config.color || '#ff0000';
    this.initialOpacity = config.opacity !== undefined ? config.opacity : 1;
    this.onChange = config.onChange || (() => {});
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

    container.appendChild(button);

    // Store references
    this.button = button;
    this.preview = preview;

    return container;
  }

  attachEvents() {
    // Open popup on button click
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openPopup();
    });
  }

  openPopup() {
    // Use the global popup system with toggle support
    const shouldOpen = appState.openPopup('color-picker', { type: this.type });
    ViewRouter.renderPopup();
  }

  updatePreview() {
    this.preview.style.backgroundColor = this.currentColor;
    this.preview.style.opacity = this.currentOpacity;
  }

  setValue(color, opacity) {
    this.currentColor = color;
    this.currentOpacity = opacity;
    this.updatePreview();
  }
}
