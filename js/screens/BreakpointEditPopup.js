/**
 * Breakpoint Edit Popup - Edit breakpoint settings
 */

class BreakpointEditPopup {
  constructor() {
    this.popup = null;
    this.editableHeader = null;
    this.breakpoint = null;
  }

  render() {
    const breakpointId = appState.editingBreakpointId;
    this.breakpoint = appState.getBreakpointById(breakpointId);

    if (!this.breakpoint) {
      console.error('Breakpoint not found');
      return null;
    }

    const content = createElement('div', {
      className: 'go-ext-breakpoint-edit-content'
    });

    // Create form fields
    const fields = [
      { id: 'minWidth', label: 'Min Width', value: this.breakpoint.minWidth, unit: 'px', min: 0, max: 5000 },
      { id: 'maxWidth', label: 'Max Container Width', value: this.breakpoint.maxWidth, unit: 'px', min: 0, max: 3000, help: '0 = no limit' },
      { id: 'columns', label: 'Columns', value: this.breakpoint.columns, unit: '', min: 1, max: 24 },
      { id: 'gutter', label: 'Gutter', value: this.breakpoint.gutter, unit: 'px', min: 0, max: 100 },
      { id: 'rowGap', label: 'Row Gap', value: this.breakpoint.rowGap, unit: 'px', min: 0, max: 100 },
      { id: 'margin', label: 'Margin', value: this.breakpoint.margin, unit: 'px', min: 0, max: 200 },
      { id: 'padding', label: 'Padding', value: this.breakpoint.padding, unit: 'px', min: 0, max: 500 }
    ];

    fields.forEach(field => {
      const formGroup = this.createFormGroup(field);
      content.appendChild(formGroup);
    });

    // Create popup with editable header
    this.editableHeader = new EditableHeaderComponent({
      text: this.breakpoint.name,
      placeholder: 'Breakpoint Name',
      onChange: (newName) => {
        this.breakpoint.name = newName;
        StorageManager.savePresets();
        ViewRouter.updateCurrentScreen();
      }
    });

    this.popup = new PopupFrameComponent({
      title: '', // We'll replace this with editable header
      content: content,
      width: '340px',
      onClose: () => {
        appState.closePopup();
      }
    });

    // Replace title with editable header
    const titleEl = this.popup.element.querySelector('.go-ext-popup-title');
    if (titleEl) {
      titleEl.replaceWith(this.editableHeader.element);
    }

    return this.popup.element;
  }

  createFormGroup(field) {
    const group = createElement('div', {
      className: 'go-ext-form-group'
    });

    const label = createElement('label', {
      className: 'go-ext-form-label',
      textContent: field.label,
      for: `go-ext-edit-${field.id}`
    });

    const inputWrapper = createElement('div', {
      className: 'go-ext-input-wrapper'
    });

    const input = createElement('input', {
      type: 'number',
      id: `go-ext-edit-${field.id}`,
      className: 'go-ext-input',
      value: field.value.toString(),
      min: field.min.toString(),
      max: field.max.toString()
    });

    inputWrapper.appendChild(input);

    if (field.unit) {
      const unit = createElement('span', {
        className: 'go-ext-input-unit',
        textContent: field.unit
      });
      inputWrapper.appendChild(unit);
    }

    group.appendChild(label);
    group.appendChild(inputWrapper);

    if (field.help) {
      const help = createElement('span', {
        className: 'go-ext-form-help',
        textContent: field.help
      });
      group.appendChild(help);
    }

    // Auto-save on input
    const debouncedSave = debounce(() => {
      const value = parseInt(input.value) || 0;
      this.breakpoint[field.id] = value;
      StorageManager.savePresets();
      ViewRouter.updateCurrentScreen();

      // Redraw grid
      if (window.gridRenderer) {
        window.gridRenderer.draw();
      }
    }, 300);

    input.addEventListener('input', debouncedSave);

    return group;
  }

  show(parent) {
    if (this.popup) {
      this.popup.show(parent);
    }
  }
}
