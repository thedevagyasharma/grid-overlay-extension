/**
 * View Router - Manages screen transitions and rendering
 */

class ViewRouter {
  static currentScreenInstance = null;
  static containerElement = null;

  /**
   * Initialize router with container element
   */
  static init(container) {
    this.containerElement = container;
  }

  /**
   * Render current view
   */
  static render() {
    if (!this.containerElement) {
      console.error('ViewRouter not initialized');
      return;
    }

    // Clear existing content (popups are in document.body, not containerElement)
    this.containerElement.innerHTML = '';

    // Create and render appropriate screen
    let screen;
    switch (appState.currentView) {
      case 'presets':
        screen = new PresetsScreen();
        // Hide grid when on presets screen
        this.hideGrid();
        break;
      case 'breakpoints':
        screen = new BreakpointsScreen();
        // Show grid when on breakpoints screen (if enabled)
        this.showGrid();
        break;
      default:
        console.error(`Unknown view: ${appState.currentView}`);
        return;
    }

    this.currentScreenInstance = screen;
    const screenElement = screen.render();
    this.containerElement.appendChild(screenElement);
  }

  /**
   * Hide grid canvas and indicator
   */
  static hideGrid() {
    const canvas = document.querySelector('.go-ext-canvas');
    const indicator = document.querySelector('.go-ext-viewport-indicator');
    if (canvas) canvas.style.display = 'none';
    if (indicator) indicator.style.display = 'none';
  }

  /**
   * Show grid canvas and indicator (if enabled)
   */
  static showGrid() {
    const canvas = document.querySelector('.go-ext-canvas');
    const indicator = document.querySelector('.go-ext-viewport-indicator');
    if (canvas && appState.gridVisible) canvas.style.display = 'block';
    if (indicator && appState.indicatorVisible) indicator.style.display = 'flex';
  }

  /**
   * Render popup
   */
  static renderPopup() {
    if (!this.containerElement) {
      console.error('ViewRouter not initialized');
      return;
    }

    // Popups are appended to document.body, not containerElement
    const existingPopup = document.body.querySelector('.go-ext-popup-frame');

    // If no active popup, close existing with animation
    if (!appState.activePopup) {
      if (existingPopup) {
        existingPopup.classList.add('go-ext-popup-closing');
        setTimeout(() => {
          existingPopup.remove();
        }, 200);
      }
      return;
    }

    // If popup is being replaced, remove old one and render new one
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create and render appropriate popup
    let popup;
    switch (appState.activePopup) {
      case 'breakpoint-edit':
        popup = new BreakpointEditPopup();
        break;
      case 'shortcuts':
        popup = new KeyboardShortcutsPopup();
        break;
      case 'color-picker':
        popup = this._createColorPickerPopup();
        break;
      default:
        console.warn(`Unknown popup type: ${appState.activePopup}`);
        return;
    }

    const popupElement = popup.render();
    if (popupElement) {
      popup.show(this.containerElement);
    }
  }

  /**
   * Create color picker popup based on type
   */
  static _createColorPickerPopup() {
    const preset = appState.getCurrentPreset();
    if (!preset) return null;

    const isGridPicker = appState.colorPickerType === 'grid';
    const title = isGridPicker ? 'Grid Color' : 'Padding Color';
    const color = isGridPicker ? preset.colors.grid : preset.colors.padding;
    const opacity = isGridPicker ? preset.colors.gridOpacity : preset.colors.paddingOpacity;

    return new ColorPickerPopupComponent({
      title,
      color,
      opacity,
      onChange: ({ color: newColor, opacity: newOpacity }) => {
        if (isGridPicker) {
          preset.colors.grid = newColor;
          preset.colors.gridOpacity = newOpacity;
        } else {
          preset.colors.padding = newColor;
          preset.colors.paddingOpacity = newOpacity;
        }
        StorageManager.savePresets();

        // Redraw grid
        if (window.gridRenderer) {
          window.gridRenderer.draw();
        }

        // Update the color picker component display
        if (this.currentScreenInstance && this.currentScreenInstance.update) {
          this.currentScreenInstance.update();
        }
      },
      onClose: () => {
        appState.closePopup();
      }
    });
  }

  /**
   * Update current screen without full re-render
   */
  static updateCurrentScreen() {
    if (this.currentScreenInstance && typeof this.currentScreenInstance.update === 'function') {
      this.currentScreenInstance.update();
    }
  }

  /**
   * Close popup
   */
  static closePopup() {
    // Popups are appended to document.body, not containerElement
    const existingPopup = document.body.querySelector('.go-ext-popup-frame');
    if (existingPopup) {
      existingPopup.classList.add('go-ext-popup-closing');
      setTimeout(() => {
        existingPopup.remove();
      }, 200);
    }
    appState.closePopup();
  }
}
