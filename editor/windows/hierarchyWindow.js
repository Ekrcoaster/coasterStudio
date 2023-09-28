class HierarchyWindow extends EditorWindow {

    constructor() {
        super("Hierarchy");

    }

    render(x1, y1, x2, y2, width, height) {
        let scene = editor.activeScene;
        if(scene == null) {
            UI_LIBRARY.drawText("No scene loaded!", x1, y1, x2, y2, new DrawTextOption(25, "default", "red", "center", "center"));
            return;
        }
        
        let y = 10;
        for(let i = 0; i < scene.rootGameObjects.length; i++) {
            let height = renderGameObject(scene.rootGameObjects[i], 0, y, width-0);
            y += height;
        }

        /**@param {GameObject} obj */
        function renderGameObject(obj, offset, startingY, width) {
            let height = 30;
            UI_LIBRARY.drawRectCoords(x1+offset, y1+startingY, x1+offset+width, y1+startingY+height, 0, new DrawShapeOption("white"));
            UI_LIBRARY.drawText(obj.name, x1+offset, y1+startingY, x1+offset+width, y1+startingY+height, new DrawTextOption(25, "default", "black", "left", "center"));
            return height;
        }
    }
}