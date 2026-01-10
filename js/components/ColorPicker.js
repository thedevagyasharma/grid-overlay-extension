/**
 * Color Picker Component - Trigger button for popup color picker
 */

class ColorPickerComponent {
  constructor(config) {
    this.label = config.label;
    this.title = config.title || config.label + ' Color';
    this.initialColor = config.color || '#ff0000';
    this.initialOpacity = config.opacity !== undefined ? config.opacity : 1;
    this.onChange = config.onChange || (() => {});
    this.currentColor = this.initialColor;
    this.currentOpacity = this.initialOpacity;
    this.popup = null;

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
    // Close existing popup if any
    if (this.popup) {
      this.popup.close();
    }

    // Create new popup
    this.popup = new ColorPickerPopupComponent({
      title: this.title,
      color: this.currentColor,
      opacity: this.currentOpacity,
      onChange: ({ color, opacity }) => {
        this.currentColor = color;
        this.currentOpacity = opacity;
        this.updatePreview();
        this.onChange({ color, opacity });
      },
      onClose: () => {
        this.popup = null;
      }
    });

    // Show popup to the left of the container
    const parent = this.element.parentElement;
    this.popup.show(parent);
  }

  updatePreview() {
    this.preview.style.backgroundColor = this.currentColor;
    this.preview.style.opacity = this.currentOpacity;
  }

  setValue(color, opacity) {
    this.currentColor = color;
    this.currentOpacity = opacity;
    this.updatePreview();

    // Update popup if it's open
    if (this.popup) {
      this.popup.setValue(color, opacity);
    }
  }
}
