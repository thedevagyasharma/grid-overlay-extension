/**
 * Editable Header Component
 * Allows inline editing of text with click-to-edit functionality
 */

class EditableHeaderComponent {
  constructor(config) {
    this.text = config.text || '';
    this.placeholder = config.placeholder || 'Enter name...';
    this.onChange = config.onChange || (() => {});
    this.isEditing = false;

    this.element = this.render();
    this.attachEvents();
  }

  render() {
    const container = createElement('div', {
      className: 'go-ext-editable-header'
    });

    const display = createElement('span', {
      className: 'go-ext-editable-header-display',
      textContent: this.text || this.placeholder
    });

    const input = createElement('input', {
      type: 'text',
      className: 'go-ext-editable-header-input',
      value: this.text
    });
    input.style.display = 'none';

    container.appendChild(display);
    container.appendChild(input);

    this.display = display;
    this.input = input;

    return container;
  }

  attachEvents() {
    // Click to edit
    this.display.addEventListener('click', () => {
      this.startEditing();
    });

    // Save on blur
    this.input.addEventListener('blur', () => {
      this.stopEditing();
    });

    // Save on Enter
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.stopEditing();
      } else if (e.key === 'Escape') {
        this.input.value = this.text;
        this.stopEditing();
      }
    });
  }

  startEditing() {
    this.isEditing = true;
    this.display.style.display = 'none';
    this.input.style.display = 'block';
    this.input.focus();
    this.input.select();
  }

  stopEditing() {
    this.isEditing = false;
    const newText = this.input.value.trim();

    if (newText && newText !== this.text) {
      this.text = newText;
      this.onChange(newText);
    }

    this.display.textContent = this.text || this.placeholder;
    this.input.style.display = 'none';
    this.display.style.display = 'block';
  }

  setText(text) {
    this.text = text;
    this.input.value = text;
    this.display.textContent = text || this.placeholder;
  }
}
