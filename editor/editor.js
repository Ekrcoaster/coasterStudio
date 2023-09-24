class Editor {

    /**@type {EditorWindowManager} */
    windowManager;

    constructor() {
        this.windowManager = new EditorWindowManager();

        let row1 = this.windowManager.span.registerFlex(new EditorWindowFlex("col", 1, 0.8));
        row1.registerWindow(new EditorWindowContainer(0.2, 1).registerWindow(new EditorWindow("green")).registerWindow(new EditorWindow("yellow")).registerWindow(new EditorWindow("purple")));
        row1.registerWindow(new EditorWindowContainer(0.6, 1).registerWindow(new EditorWindow("red")));
        row1.registerWindow(new EditorWindowContainer(0.2).registerWindow(new EditorWindow("blue")));

        this.windowManager.span.registerWindow(new EditorWindowContainer(1, 0.2).registerWindow(new EditorWindow("cyan")))
    }

    tick() {

    }

    render(x1, y1, x2, y2) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption(COLORS.background));
        this.windowManager.render(x1, y1, x2, y2);
    }
}