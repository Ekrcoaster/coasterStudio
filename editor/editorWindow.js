class EditorWindow {
    name;
    /**@type {EditorWindowContainer} */
    container;

    constructor(name) {
        this.name = name;
    }

    initSetContainer(container) {this.container = container;}

    render(x1, y1, x2, y2, width, height) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.windowBackground);
        UI_LIBRARY.drawText("Hello, I am " + this.name, x1, y1, x2, y2, new DrawTextOption(30, "default", this.name, "center", "center"));
    }
}