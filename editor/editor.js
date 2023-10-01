class Editor {

    /**@type {EditorWindowManager} */
    windowManager;

    fps = 0;

    /**@type {Scene} */
    activeScene;

    /**@type {GameObject[]} */
    selectedGameObjects = [];

    constructor() {
        this.windowManager = new EditorWindowManager();
        this.fps = 60;

        let row1 = this.windowManager.flex.registerFlex(new EditorWindowFlex(0.8, "horizontal"));
        row1.registerWindow(new EditorWindowContainer(0.1, "vertical")
            .registerWindow(new HierarchyWindow())
            //.registerWindow(new EditorWindow("purple"))
            //.registerWindow(new EditorWindow("orange"))
            //.registerWindow(new EditorWindow("pink"))
        );
        row1.registerWindow(new EditorWindowContainer(0.7, "vertical").registerWindow(new EditorWindow("red")));
        row1.registerWindow(new EditorWindowContainer(0.2, "vertical").registerWindow(new InspectorWindow()));

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
        if(selected) {
            if(this.selectedGameObjects.indexOf(obj) == -1)
                this.selectedGameObjects.push(obj);
        }
        else {
            let index = this.selectedGameObjects.indexOf(obj);
            if(index > -1)
                this.selectedGameObjects.splice(index, 1);
        }
    }

    /**
     * sets a gameobject as selected
     * @param {GameObject} obj 
     * @param {Boolean} selected 
     */
    setOnlySelected(obj, selected) {
        this.selectedGameObjects = [];
        if(selected && obj != null)
            this.selectedGameObjects.push(obj);
    }

    /**
     * 
     * @param {GameObject} obj 
     * @returns 
     */
    isSelected(obj) {
        return this.selectedGameObjects.indexOf(obj) > -1;
    }
}