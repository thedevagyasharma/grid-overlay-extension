/**
 * Keyboard Shortcuts Popup - Display keyboard shortcuts
 */

class KeyboardShortcutsPopup {
  constructor() {
    this.popup = null;
  }

  render() {
    const content = createElement('div', {
      className: 'go-ext-shortcuts-content'
    });

    const shortcuts = [
      { label: 'Toggle Grid', keys: 'Ctrl + Shift + G' },
      { label: 'Toggle Indicator', keys: 'Ctrl + Shift + H' }
    ];

    shortcuts.forEach(shortcut => {
      const item = createElement('div', {
        className: 'go-ext-shortcut-item'
      });

      const label = createElement('span', {
        className: 'go-ext-shortcut-label',
        textContent: shortcut.label
      });

      const keys = createElement('kbd', {
        className: 'go-ext-shortcut-keys',
        textContent: shortcut.keys
      });

      item.appendChild(label);
      item.appendChild(keys);

      content.appendChild(item);
    });

    this.popup = new PopupFrameComponent({
      title: 'Shortcuts',
      content: content,
      width: '340px',
      onClose: () => {
        appState.closePopup();
      }
    });

    return this.popup.element;
  }

  show(parent) {
    if (this.popup) {
      this.popup.show(parent);
    }
  }
}
