/**
 * Breakpoints Screen - Main screen for managing breakpoints
 */

class BreakpointsScreen {
  constructor() {
    this.element = null;
    this.editableHeader = null;
    this.gridColorPicker = null;
    this.paddingColorPicker = null;
  }

  render() {
    const screen = createElement('div', {
      className: 'go-ext-screen go-ext-breakpoints-screen'
    });

    // Header
    const header = createElement('div', {
      className: 'go-ext-screen-header go-ext-breakpoints-header'
    });

    const backBtn = createElement('button', {
      className: 'go-ext-icon-button',
      type: 'button',
      title: 'Back to Presets'
    });
    backBtn.appendChild(Icons.arrowLeft());

    // Editable preset name
    const preset = appState.getCurrentPreset();
    this.editableHeader = new EditableHeaderComponent({
      text: preset ? preset.name : 'Preset',
      placeholder: 'Preset Name',
      onChange: (newName) => {
        if (preset) {
          preset.name = newName;
          StorageManager.savePresets();
        }
      }
    });

    const toggleGridBtn = createElement('button', {
      className: `go-ext-icon-button ${appState.gridVisible ? 'go-ext-icon-button-active' : ''}`,
      type: 'button',
      title: 'Toggle Grid',
      id: 'go-ext-toggle-grid-btn'
    });
    toggleGridBtn.appendChild(appState.gridVisible ? Icons.eye() : Icons.eyeOff());

    const toggleIndicatorBtn = createElement('button', {
      className: `go-ext-icon-button ${appState.indicatorVisible ? 'go-ext-icon-button-active' : ''}`,
      type: 'button',
      title: 'Toggle Viewport Indicator',
      id: 'go-ext-toggle-indicator-btn'
    });
    toggleIndicatorBtn.appendChild(Icons.ruler());

    header.appendChild(backBtn);
    header.appendChild(this.editableHeader.element);
    header.appendChild(toggleIndicatorBtn);
    header.appendChild(toggleGridBtn);

    // Breakpoints Section
    const breakpointsSection = createElement('div', {
      className: 'go-ext-breakpoints-section'
    });

    const sectionLabel = createElement('h2', {
      className: 'go-ext-section-label',
      textContent: 'BREAKPOINTS'
    });

    const breakpointsList = createElement('div', {
      className: 'go-ext-breakpoints-list',
      id: 'go-ext-breakpoints-list'
    });

    const addBreakpointBtn = createElement('button', {
      className: 'go-ext-add-breakpoint-btn',
      type: 'button'
    });
    addBreakpointBtn.appendChild(Icons.plus());
    addBreakpointBtn.appendChild(document.createTextNode(' Add Breakpoint'));

    breakpointsSection.appendChild(sectionLabel);
    breakpointsSection.appendChild(breakpointsList);
    breakpointsSection.appendChild(addBreakpointBtn);

    // Colors Section
    const colorsSection = createElement('div', {
      className: 'go-ext-colors-section'
    });

    const colorsLabel = createElement('h2', {
      className: 'go-ext-section-label',
      textContent: 'COLORS'
    });

    const colorsGrid = createElement('div', {
      className: 'go-ext-colors-grid'
    });

    colorsSection.appendChild(colorsLabel);
    colorsSection.appendChild(colorsGrid);

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
    screen.appendChild(breakpointsSection);
    screen.appendChild(colorsSection);
    screen.appendChild(footer);

    this.element = screen;
    this.backBtn = backBtn;
    this.toggleGridBtn = toggleGridBtn;
    this.toggleIndicatorBtn = toggleIndicatorBtn;
    this.breakpointsList = breakpointsList;
    this.addBreakpointBtn = addBreakpointBtn;
    this.colorsGrid = colorsGrid;
    this.keyboardBtn = keyboardBtn;
    this.privacyLink = privacyLink;

    this.attachEvents();
    this.renderBreakpoints();
    this.renderColorPickers();

    return screen;
  }

  attachEvents() {
    // Back button - close popups and go to presets
    this.backBtn.addEventListener('click', () => {
      // Close any open popups
      if (appState.activePopup) {
        ViewRouter.closePopup();
      }

      appState.navigateTo('presets');
      ViewRouter.render();
    });

    // Toggle grid button
    this.toggleGridBtn.addEventListener('click', () => {
      appState.gridVisible = !appState.gridVisible;
      this.updateToggleButton();
      StorageManager.saveGridVisibility();

      // Update canvas visibility
      const canvas = document.querySelector('.go-ext-canvas');
      if (canvas) {
        canvas.style.display = appState.gridVisible ? 'block' : 'none';
      }
    });

    // Toggle indicator button
    this.toggleIndicatorBtn.addEventListener('click', () => {
      appState.indicatorVisible = !appState.indicatorVisible;
      this.updateIndicatorButton();
      StorageManager.saveIndicatorVisibility();

      // Update indicator visibility
      const indicator = document.querySelector('.go-ext-viewport-indicator');
      if (indicator) {
        indicator.style.display = appState.indicatorVisible ? 'flex' : 'none';
      }
    });

    // Add breakpoint
    this.addBreakpointBtn.addEventListener('click', () => {
      const breakpoint = appState.addBreakpoint();
      if (breakpoint) {
        StorageManager.savePresets();
        this.renderBreakpoints();

        // Redraw grid
        if (window.gridRenderer) {
          window.gridRenderer.draw();
        }
      }
    });

    // Keyboard shortcuts - toggle
    this.keyboardBtn.addEventListener('click', () => {
      const shouldOpen = appState.openPopup('shortcuts');
      ViewRouter.renderPopup();
    });

    // Privacy link opens in new tab (handled by target="_blank" attribute)
  }

  updateToggleButton() {
    this.toggleGridBtn.innerHTML = '';
    this.toggleGridBtn.appendChild(appState.gridVisible ? Icons.eye() : Icons.eyeOff());

    if (appState.gridVisible) {
      this.toggleGridBtn.classList.add('go-ext-icon-button-active');
    } else {
      this.toggleGridBtn.classList.remove('go-ext-icon-button-active');
    }
  }

  updateIndicatorButton() {
    if (appState.indicatorVisible) {
      this.toggleIndicatorBtn.classList.add('go-ext-icon-button-active');
    } else {
      this.toggleIndicatorBtn.classList.remove('go-ext-icon-button-active');
    }
  }

  renderBreakpoints() {
    this.breakpointsList.innerHTML = '';

    const preset = appState.getCurrentPreset();
    if (!preset || preset.breakpoints.length === 0) {
      const emptyState = createElement('p', {
        className: 'go-ext-empty-state',
        textContent: 'No breakpoints yet. Add one to get started!'
      });
      this.breakpointsList.appendChild(emptyState);
      return;
    }

    const viewportBreakpoint = appState.getViewportMatchingBreakpoint();

    preset.breakpoints.forEach(breakpoint => {
      const isActive = viewportBreakpoint && viewportBreakpoint.id === breakpoint.id;
      const item = this.createBreakpointItem(breakpoint, isActive);
      this.breakpointsList.appendChild(item);
    });
  }

  createBreakpointItem(breakpoint, isActive) {
    const item = createElement('div', {
      className: `go-ext-breakpoint-item ${isActive ? 'go-ext-breakpoint-item-active' : ''}`,
      'data-breakpoint-id': breakpoint.id
    });

    // Left section with info
    const leftSection = createElement('div', {
      className: 'go-ext-breakpoint-item-left'
    });

    const info = createElement('div', {
      className: 'go-ext-breakpoint-info'
    });

    const name = createElement('span', {
      className: 'go-ext-breakpoint-name',
      textContent: breakpoint.name
    });

    const maxWidth = this.getBreakpointMaxWidth(breakpoint);
    const rangeText = maxWidth === '∞'
      ? `${breakpoint.minWidth}px+`
      : `${breakpoint.minWidth}-${maxWidth}px`;

    const meta = createElement('span', {
      className: 'go-ext-breakpoint-meta',
      textContent: `${rangeText} • ${breakpoint.columns} COL`
    });

    info.appendChild(name);
    info.appendChild(meta);
    leftSection.appendChild(info);

    // Right section with actions
    const rightSection = createElement('div', {
      className: 'go-ext-breakpoint-item-right'
    });

    const editBtn = createElement('button', {
      className: 'go-ext-icon-button go-ext-icon-button-small',
      type: 'button',
      title: 'Edit Breakpoint'
    });
    editBtn.appendChild(Icons.squarePen());

    const deleteBtn = createElement('button', {
      className: 'go-ext-icon-button go-ext-icon-button-small go-ext-icon-button-danger',
      type: 'button',
      title: 'Delete Breakpoint'
    });
    deleteBtn.appendChild(Icons.circleX());

    rightSection.appendChild(editBtn);
    rightSection.appendChild(deleteBtn);

    item.appendChild(leftSection);
    item.appendChild(rightSection);

    // Event listeners
    editBtn.addEventListener('click', () => {
      const shouldOpen = appState.openPopup('breakpoint-edit', { breakpointId: breakpoint.id });
      ViewRouter.renderPopup();
    });

    deleteBtn.addEventListener('click', () => {
      this.confirmDeleteBreakpoint(breakpoint);
    });

    return item;
  }

  getBreakpointMaxWidth(breakpoint) {
    const preset = appState.getCurrentPreset();
    if (!preset) return '∞';

    const index = preset.breakpoints.indexOf(breakpoint);
    const nextBreakpoint = preset.breakpoints[index + 1];

    return nextBreakpoint ? nextBreakpoint.minWidth - 1 : '∞';
  }

  confirmDeleteBreakpoint(breakpoint) {
    const preset = appState.getCurrentPreset();
    if (!preset) return;

    // Don't allow deleting the last breakpoint
    if (preset.breakpoints.length === 1) {
      alert('Cannot delete the last breakpoint. A preset must have at least one breakpoint.');
      return;
    }

    const dialog = new ConfirmDialogComponent({
      title: 'Delete Breakpoint',
      message: `Are you sure you want to delete "${breakpoint.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
      onConfirm: () => {
        appState.deleteBreakpoint(breakpoint.id);
        StorageManager.savePresets();
        this.renderBreakpoints();

        // Redraw grid
        if (window.gridRenderer) {
          window.gridRenderer.draw();
        }
      }
    });

    dialog.show(this.element);
  }

  renderColorPickers() {
    this.colorsGrid.innerHTML = '';

    const preset = appState.getCurrentPreset();
    if (!preset) return;

    // Grid color picker
    this.gridColorPicker = new ColorPickerComponent({
      label: 'Grid',
      title: 'Grid Color',
      type: 'grid',
      color: preset.colors.grid,
      opacity: preset.colors.gridOpacity,
      onChange: ({ color, opacity }) => {
        preset.colors.grid = color;
        preset.colors.gridOpacity = opacity;
        StorageManager.savePresets();

        // Redraw grid
        if (window.gridRenderer) {
          window.gridRenderer.draw();
        }
      }
    });

    // Padding color picker
    this.paddingColorPicker = new ColorPickerComponent({
      label: 'Padding',
      title: 'Padding Color',
      type: 'padding',
      color: preset.colors.padding,
      opacity: preset.colors.paddingOpacity,
      onChange: ({ color, opacity }) => {
        preset.colors.padding = color;
        preset.colors.paddingOpacity = opacity;
        StorageManager.savePresets();

        // Redraw grid
        if (window.gridRenderer) {
          window.gridRenderer.draw();
        }
      }
    });

    this.colorsGrid.appendChild(this.gridColorPicker.element);
    this.colorsGrid.appendChild(this.paddingColorPicker.element);
  }

  update() {
    const preset = appState.getCurrentPreset();
    if (preset && this.editableHeader) {
      this.editableHeader.setText(preset.name);
    }
    this.renderBreakpoints();
    if (this.gridColorPicker && this.paddingColorPicker) {
      if (preset) {
        this.gridColorPicker.setValue(preset.colors.grid, preset.colors.gridOpacity);
        this.paddingColorPicker.setValue(preset.colors.padding, preset.colors.paddingOpacity);
      }
    }
    this.updateToggleButton();
    this.updateIndicatorButton();
  }
}
