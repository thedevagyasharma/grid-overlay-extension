/**
 * Popup Frame Component
 * Side popup that opens next to the main panel
 */

class PopupFrameComponent {
  constructor(config) {
    this.title = config.title || '';
    this.content = config.content || '';
    this.onClose = config.onClose || (() => {});
    this.width = config.width || '260px';

    this.element = this.render();
    this.attachEvents();
  }

  render() {
    const popup = createElement('div', {
      className: 'go-ext-popup-frame'
    });
    popup.style.width = this.width;

    const header = createElement('div', {
      className: 'go-ext-popup-header'
    });

    const titleEl = createElement('h2', {
      className: 'go-ext-popup-title',
      textContent: this.title
    });

    const closeBtn = createElement('button', {
      className: 'go-ext-popup-close',
      type: 'button',
      'aria-label': 'Close'
    });
    closeBtn.appendChild(Icons.x());

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const contentDiv = createElement('div', {
      className: 'go-ext-popup-content'
    });

    if (typeof this.content === 'string') {
      contentDiv.innerHTML = this.content;
    } else {
      contentDiv.appendChild(this.content);
    }

    popup.appendChild(header);
    popup.appendChild(contentDiv);

    this.popup = popup;
    this.closeBtn = closeBtn;
    this.titleEl = titleEl;
    this.contentDiv = contentDiv;

    return popup;
  }

  attachEvents() {
    this.closeBtn.addEventListener('click', () => {
      this.close();
    });
  }

  close() {
    this.element.classList.add('go-ext-popup-closing');
    setTimeout(() => {
      this.element.remove();
      this.onClose();
      appState.closePopup();
    }, 200);
  }

  setTitle(title) {
    this.titleEl.textContent = title;
  }

  setContent(content) {
    this.contentDiv.innerHTML = '';
    if (typeof content === 'string') {
      this.contentDiv.innerHTML = content;
    } else {
      this.contentDiv.appendChild(content);
    }
  }

  show(parent) {
    parent.insertBefore(this.element, parent.firstChild);
    // Trigger animation
    setTimeout(() => {
      this.element.classList.add('go-ext-popup-open');
    }, 10);
  }
}
