class Editor {

    /**@type {EditorWindowManager} */
    windowManager;

    fps = 0;

    /**@type {Scene} */
    activeScene;

    constructor() {
        this.windowManager = new EditorWindowManager();
        this.fps = 60;

        let row1 = this.windowManager.flex.registerFlex(new EditorWindowFlex(0.8, "horizontal"));
        row1.registerWindow(new EditorWindowContainer(0.2, "vertical")
            .registerWindow(new HierarchyWindow())
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

    /**@type {Scene} */
    setActiveScene(scene) {
        this.activeScene = scene;
    }

    tick() {

    }

    render(x1, y1, x2, y2) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption(COLORS.background));
        this.windowManager.render(x1, y1, x2, y2);
    }
}