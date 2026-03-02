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
    // minWidth: media-query units only (px, em, rem, absolute units)
    // Other CSS-length fields: any valid CSS length (px, rem, vw, calc, clamp, etc.)
    // columns: plain integer
    const fields = [
      { id: 'minWidth', label: 'Min Width', value: this.breakpoint.minWidth, cssLength: true },
      { id: 'maxWidth', label: 'Max Container Width', value: this.breakpoint.maxWidth, cssLength: true, help: '0 = no limit' },
      { id: 'columns', label: 'Columns', value: this.breakpoint.columns, unit: '', min: 1, max: 24 },
      { id: 'gutter', label: 'Gutter', value: this.breakpoint.gutter, cssLength: true },
      { id: 'rowGap', label: 'Row Gap', value: this.breakpoint.rowGap, cssLength: true },
      { id: 'margin', label: 'Margin', value: this.breakpoint.margin, cssLength: true },
      { id: 'padding', label: 'Padding', value: this.breakpoint.padding, cssLength: true }
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

    group.appendChild(label);
    group.appendChild(inputWrapper);

    if (field.cssLength) {
      // minWidth only accepts units valid in CSS media queries (px, em, rem, absolute).
      // Other fields accept any valid CSS length including vw, calc, clamp, etc.
      const isMinWidth = field.id === 'minWidth';

      const initialSplit = splitCSSLength(field.value);
      const input = createElement('input', {
        type: 'text',
        id: `go-ext-edit-${field.id}`,
        className: 'go-ext-input',
        value: initialSplit.num,
        placeholder: isMinWidth ? '768px, 48em, 48rem' : '16px, 1rem, calc(…)'
      });
      inputWrapper.appendChild(input);

      const unitEl = createElement('span', {
        className: 'go-ext-input-unit',
        textContent: initialSplit.unit
      });
      inputWrapper.appendChild(unitEl);

      if (field.help) {
        group.appendChild(createElement('span', {
          className: 'go-ext-form-help',
          textContent: field.help
        }));
      }

      const errorEl = createElement('span', {
        className: 'go-ext-form-error',
        textContent: 'Invalid CSS value.'
      });
      group.appendChild(errorEl);

      // Duplicate min-width warning (minWidth field only)
      let warningEl = null;
      if (isMinWidth) {
        warningEl = createElement('span', {
          className: 'go-ext-form-warning',
          textContent: 'Another breakpoint uses this min-width. This breakpoint will be unreachable.'
        });
        group.appendChild(warningEl);
      }

      // Media-query-valid units only: px, em, rem, and other absolute units
      const MEDIA_QUERY_RE = /^-?\d+(\.\d+)?(px|em|rem|cm|mm|in|pt|pc|q|ch|ex)$/i;
      const isValidValue = (raw) => {
        if (!raw || raw === '0') return true;
        if (/^-?\d+(\.\d+)?$/.test(raw)) return true; // bare number → px
        if (isMinWidth) return MEDIA_QUERY_RE.test(raw);
        return CSS.supports('width', raw);
      };

      const normalizeDisplay = (raw) => {
        const { num, unit } = splitCSSLength(raw === '' ? '0' : raw);
        input.value = num;
        unitEl.textContent = unit;
      };

      const checkDuplicate = (raw) => {
        if (!warningEl) return;
        const resolvedPx = Math.round(resolveCSSLengthToPx(raw === '' ? 0 : raw));
        const preset = appState.getCurrentPreset();
        const hasDuplicate = preset && preset.breakpoints.some(
          bp => bp.id !== this.breakpoint.id &&
                Math.round(resolveCSSLengthToPx(bp.minWidth)) === resolvedPx
        );
        warningEl.classList.toggle('visible', hasDuplicate);
      };

      // On input: clear error (badge only updates after valid save)
      input.addEventListener('input', () => {
        inputWrapper.classList.remove('invalid');
        errorEl.classList.remove('visible');
        if (isMinWidth) checkDuplicate(input.value.trim());
      });

      // Enter key: commit value (same as blur)
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
      });

      // On blur: evaluate any arithmetic expression, validate, normalize display, save if valid
      input.addEventListener('blur', () => {
        let typed = input.value.trim();
        // Bare number or arithmetic without unit: inherit current badge unit
        // e.g. "1" with badge "rem" → "1rem", "540/16" with badge "rem" → "540/16rem"
        const hasOps = /[+\-*/()]/.test(typed) && !/^-?\d+(\.\d+)?$/.test(typed);
        const isBareNumber = /^-?\d+(\.\d+)?$/.test(typed);
        if ((hasOps || isBareNumber) && !/[a-z%]$/i.test(typed)) {
          const badgeUnit = unitEl.textContent;
          if (badgeUnit && !/^(calc|clamp|min|max)$/.test(badgeUnit)) typed += badgeUnit;
        }
        const raw = preprocessCSSInput(typed);
        if (!isValidValue(raw)) {
          errorEl.textContent = isMinWidth
            ? 'Use px, em, or rem. Viewport units and CSS functions aren\'t valid here.'
            : 'Invalid CSS value.';
          inputWrapper.classList.remove('invalid');
          void inputWrapper.offsetWidth; // replay shake animation
          inputWrapper.classList.add('invalid');
          errorEl.classList.add('visible');
          return;
        }
        inputWrapper.classList.remove('invalid');
        errorEl.classList.remove('visible');
        const value = raw === '' ? 0 : raw;
        normalizeDisplay(raw);
        appState.updateBreakpoint(this.breakpoint.id, { [field.id]: value });
        StorageManager.savePresets();
        ViewRouter.updateCurrentScreen();
        if (window.gridRenderer) window.gridRenderer.draw();
      });

      // Initial duplicate check
      if (isMinWidth) checkDuplicate(field.value.toString());

    } else {
      // Integer field (columns)
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
        inputWrapper.appendChild(createElement('span', {
          className: 'go-ext-input-unit',
          textContent: field.unit
        }));
      }

      if (field.help) {
        group.appendChild(createElement('span', {
          className: 'go-ext-form-help',
          textContent: field.help
        }));
      }

      const debouncedSave = debounce(() => {
        const value = parseInt(input.value) || 0;
        appState.updateBreakpoint(this.breakpoint.id, { [field.id]: value });
        StorageManager.savePresets();
        ViewRouter.updateCurrentScreen();
        if (window.gridRenderer) window.gridRenderer.draw();
      }, 300);

      input.addEventListener('input', debouncedSave);
    }

    return group;
  }

  show(parent) {
    if (this.popup) {
      this.popup.show(parent);
    }
  }
}
