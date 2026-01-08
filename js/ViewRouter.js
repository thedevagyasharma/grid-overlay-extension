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

    // Clear existing content but keep popup if exists
    const existingPopup = this.containerElement.querySelector('.go-ext-popup-frame');
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

    // Re-add popup if it existed
    if (existingPopup) {
      this.containerElement.insertBefore(existingPopup, this.containerElement.firstChild);
    }
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

    // Remove existing popup
    const existingPopup = this.containerElement.querySelector('.go-ext-popup-frame');
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
      default:
        return;
    }

    const popupElement = popup.render();
    if (popupElement) {
      popup.show(this.containerElement);
    }
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
    const existingPopup = this.containerElement.querySelector('.go-ext-popup-frame');
    if (existingPopup) {
      existingPopup.remove();
    }
    appState.closePopup();
  }
}
