/**
 * Presets Screen - Starting screen showing all saved presets
 */

class PresetsScreen {
  constructor() {
    this.element = null;
  }

  render() {
    const screen = createElement('div', {
      className: 'go-ext-screen go-ext-presets-screen'
    });

    // Header
    const header = createElement('div', {
      className: 'go-ext-screen-header'
    });

    const title = createElement('h1', {
      className: 'go-ext-screen-title',
      textContent: 'Grid Overlay Pro'
    });

    header.appendChild(title);

    // Presets Section
    const presetsSection = createElement('div', {
      className: 'go-ext-presets-section'
    });

    const sectionLabel = createElement('h2', {
      className: 'go-ext-section-label',
      textContent: 'PRESETS'
    });

    const presetsList = createElement('div', {
      className: 'go-ext-presets-list',
      id: 'go-ext-presets-list'
    });

    presetsSection.appendChild(sectionLabel);
    presetsSection.appendChild(presetsList);

    // Footer
    const footer = createElement('div', {
      className: 'go-ext-screen-footer'
    });

    const privacyLink = createElement('a', {
      href: 'https://gop.devagyasharma.com',
      target: '_blank',
      className: 'go-ext-privacy-link',
      textContent: 'Privacy Policy'
    });

    const keyboardBtn = createElement('button', {
      className: 'go-ext-icon-button',
      type: 'button',
      title: 'Keyboard Shortcuts'
    });
    keyboardBtn.appendChild(Icons.keyboard());

    footer.appendChild(privacyLink);
    footer.appendChild(keyboardBtn);

    screen.appendChild(header);
    screen.appendChild(presetsSection);
    screen.appendChild(footer);

    this.element = screen;
    this.presetsList = presetsList;
    this.keyboardBtn = keyboardBtn;
    this.privacyLink = privacyLink;

    this.attachEvents();
    this.renderPresets();

    return screen;
  }

  attachEvents() {
    // Keyboard shortcuts button - toggle
    this.keyboardBtn.addEventListener('click', () => {
      const shouldOpen = appState.openPopup('shortcuts');
      ViewRouter.renderPopup();
    });

    // Privacy link opens in new tab (handled by target="_blank" attribute)
  }

  renderPresets() {
    this.presetsList.innerHTML = '';

    // Render existing presets
    appState.presets.forEach(preset => {
      const presetCard = this.createPresetCard(preset);
      this.presetsList.appendChild(presetCard);
    });

    // New preset button
    const newPresetBtn = createElement('button', {
      className: 'go-ext-preset-card go-ext-preset-card-new',
      type: 'button'
    });

    const icon = createElement('span', {
      className: 'go-ext-preset-card-icon'
    });
    icon.appendChild(Icons.plus());

    const label = createElement('span', {
      className: 'go-ext-preset-card-label',
      textContent: 'New Preset'
    });

    newPresetBtn.appendChild(icon);
    newPresetBtn.appendChild(label);

    newPresetBtn.addEventListener('click', () => {
      const preset = appState.createPreset();
      appState.currentPresetId = preset.id;
      StorageManager.savePresets();
      appState.navigateTo('breakpoints');
      ViewRouter.render();
    });

    this.presetsList.appendChild(newPresetBtn);
  }

  createPresetCard(preset) {
    const card = createElement('button', {
      className: 'go-ext-preset-card',
      type: 'button',
      'data-preset-id': preset.id
    });

    const name = createElement('span', {
      className: 'go-ext-preset-card-name',
      textContent: preset.name
    });

    const breakpointCount = createElement('span', {
      className: 'go-ext-preset-card-count',
      textContent: `${preset.breakpoints.length} BREAKPOINT${preset.breakpoints.length !== 1 ? 'S' : ''}`
    });

    card.appendChild(name);
    card.appendChild(breakpointCount);

    // Only add delete button if more than 1 preset exists
    if (appState.presets.length > 1) {
      const deleteBtn = createElement('button', {
        className: 'go-ext-preset-card-delete',
        type: 'button',
        title: `Delete ${preset.name}`,
        'aria-label': `Delete ${preset.name}`
      });
      deleteBtn.appendChild(Icons.trash());

      // Stop propagation to prevent card click
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDeletePreset(preset);
      });

      card.appendChild(deleteBtn);
    }

    card.addEventListener('click', () => {
      appState.currentPresetId = preset.id;
      StorageManager.savePresets(); // Save the active preset
      appState.navigateTo('breakpoints');
      ViewRouter.render();
    });

    return card;
  }

  update() {
    this.renderPresets();
  }

  handleDeletePreset(preset) {
    appState.showConfirmDialog({
      title: 'Delete Preset?',
      message: `Delete "${preset.name}"? This will remove all ${preset.breakpoints.length} breakpoint${preset.breakpoints.length !== 1 ? 's' : ''}.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
      onConfirm: () => {
        appState.deletePreset(preset.id);
        StorageManager.savePresets();
        this.renderPresets();
      }
    });

    // Render the confirmation dialog
    const dialog = new ConfirmDialogComponent(appState.confirmDialog);
    dialog.show(this.element);
  }
}
