class EditorWindow extends EditorWindowBase {
    name;

    constructor(name, percentWidth, percentHeight) {
        super(percentWidth, percentHeight);
        this.name = name;
        this.myself = "window";
    }

    render(x1, y1, x2, y2, width, height) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption(this.name, "", 0));
    }

    clone() {
        return new EditorWindow(this.name, this.percentWidth, this.percentHeight);
    }
}