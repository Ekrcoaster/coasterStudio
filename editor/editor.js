class Editor {

    /**@type {EditorWindowManager} */
    windowManager;

    fps = 0;

    /**@type {Scene} */
    activeScene;

    /**@type {Set<GameObject>} */
    selectedGameObjects = new Set();

    constructor() {
        this.windowManager = new EditorWindowManager();
        this.fps = 60;

        let row1 = this.windowManager.flex.registerFlex(new EditorWindowFlex(0.8, "horizontal"));
        row1.registerWindow(new EditorWindowContainer(0.1, "vertical")
            .registerWindow(new HierarchyWindow())
            .registerWindow(new EditorWindow("yellow"))
            //.registerWindow(new EditorWindow("purple"))
            //.registerWindow(new EditorWindow("orange"))
            //.registerWindow(new EditorWindow("pink"))
        );
        row1.registerWindow(new EditorWindowContainer(0.7, "vertical").registerWindow(new EditorWindow("red")));
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

    /**
     * sets a gameobject as selected
     * @param {GameObject} obj 
     * @param {Boolean} selected 
     */
    setSelected(obj, selected) {
        if(selected)
            this.selectedGameObjects.add(obj);
        else
            this.selectedGameObjects.delete(obj);
    }

    /**
     * sets a gameobject as selected
     * @param {GameObject} obj 
     * @param {Boolean} selected 
     */
    setOnlySelected(obj, selected) {
        this.selectedGameObjects = new Set();
        if(selected)
            this.selectedGameObjects.add(obj);
    }

    /**
     * 
     * @param {GameObject} obj 
     * @returns 
     */
    isSelected(obj) {
        return this.selectedGameObjects.has(obj);
    }
}