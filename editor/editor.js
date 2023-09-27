class Editor {

    /**@type {EditorWindowManager} */
    windowManager;

    constructor() {
        this.windowManager = new EditorWindowManager();

        let row1 = this.windowManager.flex.registerFlex(new EditorWindowFlex(0.8, "horizontal"));
        row1.registerWindow(new EditorWindowContainer(0.2, "vertical")
            .registerWindow(new EditorWindow("green"))
            .registerWindow(new EditorWindow("yellow"))
            //.registerWindow(new EditorWindow("purple"))
            //.registerWindow(new EditorWindow("orange"))
            //.registerWindow(new EditorWindow("pink"))
        );
        row1.registerWindow(new EditorWindowContainer(0.6, "vertical").registerWindow(new EditorWindow("red")));
        row1.registerWindow(new EditorWindowContainer(0.2, "vertical").registerWindow(new EditorWindow("blue")));

        this.windowManager.flex.registerWindow(new EditorWindowContainer(0.2, "horizontal").registerWindow(new EditorWindow("cyan")))

        //let row1 = this.windowManager.flex.registerFlex(new EditorWindowFlex(1, "horizontal"));
        //row1.registerWindow(new EditorWindowContainer(0.5, "vertical").registerWindow(new EditorWindow("red")));
    }

    tick() {

    }

    render(x1, y1, x2, y2) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption(COLORS.background));
        this.windowManager.render(x1, y1, x2, y2);
    }
}