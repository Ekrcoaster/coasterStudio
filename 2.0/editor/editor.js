class Editor {

    /**@type {EditorWindowManager} */
    editorWindowManager;

    constructor() {
        this.editorWindowManager = new EditorWindowManager();

        let row1 = this.editorWindowManager.span.registerFlex(new EditorWindowFlex("col", 1, 0.8));
        row1.registerWindow(new EditorWindow("green", 0.2, 1));
        row1.registerWindow(new EditorWindow("red", 0.6, 1));
        row1.registerWindow(new EditorWindow("blue", 0.2));

        this.editorWindowManager.span.registerWindow(new EditorWindow("cyan", 1, 0.2))
    }

    tick() {

    }

    render(x1, y1, x2, y2) {
        this.editorWindowManager.render(x1, y1, x2, y2);
    }
}