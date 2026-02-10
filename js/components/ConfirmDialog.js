/**
 * Confirmation Dialog Component
 * Displays as an overlay within the main panel
 */

class ConfirmDialogComponent {
  constructor(config) {
    this.title = config.title || 'Confirm';
    this.message = config.message || 'Are you sure?';
    this.confirmText = config.confirmText || 'Confirm';
    this.cancelText = config.cancelText || 'Cancel';
    this.onConfirm = config.onConfirm || (() => {});
    this.onCancel = config.onCancel || (() => {});
    this.isDangerous = config.isDangerous || false;

    this.element = this.render();
    this.attachEvents();
  }

  render() {
    const overlay = createElement('div', {
      className: 'go-ext-confirm-dialog-overlay'
    });

    const dialog = createElement('div', {
      className: 'go-ext-confirm-dialog'
    });

    const title = createElement('h3', {
      className: 'go-ext-confirm-dialog-title',
      textContent: this.title
    });

    const message = createElement('p', {
      className: 'go-ext-confirm-dialog-message',
      textContent: this.message
    });

    const actions = createElement('div', {
      className: 'go-ext-confirm-dialog-actions'
    });

    const cancelBtn = createElement('button', {
      className: 'go-ext-confirm-dialog-btn go-ext-confirm-dialog-btn-cancel',
      textContent: this.cancelText
    });

    const confirmBtn = createElement('button', {
      className: `go-ext-confirm-dialog-btn ${this.isDangerous ? 'go-ext-confirm-dialog-btn-danger' : 'go-ext-confirm-dialog-btn-confirm'}`,
      textContent: this.confirmText
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);

    this.overlay = overlay;
    this.cancelBtn = cancelBtn;
    this.confirmBtn = confirmBtn;

    return overlay;
  }

  attachEvents() {
    this.cancelBtn.addEventListener('click', () => {
      this.onCancel();
      this.close();
    });

    this.confirmBtn.addEventListener('click', () => {
      this.onConfirm();
      this.close();
    });

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.onCancel();
        this.close();
      }
    });
  }

  close() {
    this.element.remove();
    appState.hideConfirmDialog();
  }

  show(parent) {
    parent.appendChild(this.element);
  }
}
