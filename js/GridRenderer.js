/**
 * Grid Renderer - Draws the grid overlay on canvas
 */

class GridRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Draw grid on canvas
   */
  draw() {
    if (!this.ctx || !appState.gridEnabled || !appState.gridVisible) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const preset = appState.getCurrentPreset();
    if (!preset) return;

    const breakpoint = appState.getViewportMatchingBreakpoint();
    if (!breakpoint) return;

    const viewportWidth = window.innerWidth;

    // Calculate container max width (includes padding)
    const containerMaxWidth = breakpoint.maxWidth > 0 ?
      Math.min(breakpoint.maxWidth, viewportWidth - breakpoint.margin * 2) :
      viewportWidth - breakpoint.margin * 2;

    // Grid width is container minus padding on both sides
    const gridWidth = containerMaxWidth - breakpoint.padding * 2;

    const containerLeft = (viewportWidth - containerMaxWidth) / 2;
    const gridLeft = containerLeft + breakpoint.padding;

    const totalGutterWidth = (breakpoint.columns - 1) * breakpoint.gutter;
    const colWidth = (gridWidth - totalGutterWidth) / breakpoint.columns;

    const startY = 0;
    const endY = this.canvas.height;

    // Draw padding strips if padding exists
    if (breakpoint.padding > 0 && breakpoint.maxWidth > 0) {
      this.ctx.fillStyle = preset.colors.padding;
      this.ctx.globalAlpha = preset.colors.paddingOpacity;

      // Left padding strip
      this.ctx.fillRect(containerLeft, startY, breakpoint.padding, endY - startY);

      // Right padding strip
      this.ctx.fillRect(containerLeft + containerMaxWidth - breakpoint.padding, startY, breakpoint.padding, endY - startY);
    }

    // Draw grid columns
    this.ctx.fillStyle = preset.colors.grid;
    this.ctx.globalAlpha = preset.colors.gridOpacity;

    for (let i = 0; i < breakpoint.columns; i++) {
      const x = gridLeft + i * (colWidth + breakpoint.gutter);
      this.ctx.fillRect(x, startY, colWidth, endY - startY);
    }

    // Draw row gaps
    if (breakpoint.rowGap > 0) {
      this.ctx.globalAlpha = preset.colors.gridOpacity * 0.5;
      for (let y = startY; y < endY; y += breakpoint.rowGap) {
        this.ctx.fillRect(gridLeft, y, gridWidth, 1);
      }
    }
  }

  /**
   * Update canvas dimensions
   */
  updateDimensions(container) {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    container.style.height = docHeight + 'px';
    this.canvas.width = window.innerWidth;
    this.canvas.height = docHeight;

    this.draw();
  }
}
