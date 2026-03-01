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

    const el = createElement('div', {
      className: 'go-ext-editable-header-text',
      textContent: this.text || this.placeholder
    });
    el.contentEditable = 'false';

    container.appendChild(el);
    this.el = el;

    return container;
  }

  attachEvents() {
    this.el.addEventListener('click', () => {
      if (!this.isEditing) this.startEditing();
    });

    this.el.addEventListener('blur', () => {
      this.stopEditing();
    });

    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.el.blur();
      } else if (e.key === 'Escape') {
        this.el.textContent = this.text || this.placeholder;
        this.isEditing = false;
        this.el.blur();
      }
    });

    this.el.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  startEditing() {
    this.isEditing = true;
    this.el.contentEditable = 'true';
    this.el.classList.add('editing');

    const range = document.createRange();
    range.selectNodeContents(this.el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    this.el.focus();
  }

  stopEditing() {
    if (!this.isEditing) return;
    this.isEditing = false;

    const newText = this.el.textContent.trim();
    this.el.contentEditable = 'false';
    this.el.classList.remove('editing');

    if (newText && newText !== this.text) {
      this.text = newText;
      this.onChange(newText);
    }

    this.el.textContent = this.text || this.placeholder;
  }

  setText(text) {
    this.text = text;
    if (!this.isEditing) {
      this.el.textContent = text || this.placeholder;
    }
  }
}
