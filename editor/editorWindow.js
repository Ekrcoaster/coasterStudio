class EditorWindow {
    name;
    /**@type {EditorWindowContainer} */
    container;

    constructor(name) {
        this.name = name;
    }

    initSetContainer(container) {this.container = container;}

    render(x1, y1, x2, y2, width, height) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption(this.name, "", 0));
    }
}