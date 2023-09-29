class HierarchyWindow extends EditorWindow {

    objectMetadata = {}

    constructor() {
        super("Hierarchy");
        this.objectMetadata = {};
    }

    render(x1, y1, x2, y2, width, height) {
        const t = this;
        let scene = editor.activeScene;
        if(scene == null) {
            UI_LIBRARY.drawText("No scene loaded!", x1, y1, x2, y2, new DrawTextOption(25, "default", "red", "center", "center"));
            return;
        }
        
        let y = y1+5;
        for(let i = 0; i < scene.rootGameObjects.length; i++) {
            recurseDepth(scene.rootGameObjects[i], 0);
            //issue: update position on root: 71 (null)
        }

        /**@param {GameObject} obj */
        function recurseDepth(obj, d = 0) {
            let metaData = t.getMetaData(obj.id);
            let depth = (d * 20);

            let data = UI_WIDGET.hierarchyGameObject("hierarchyWindow " + obj.id, obj, metaData, x1 + depth, y, x2, obj.id == scene.header.id, editor.isSelected(obj));
            y += data.height;

            if(data.newExpandValue != metaData.drawChildren) {
                metaData.drawChildren = data.newExpandValue;
                t.setMetaData(obj.id, metaData);
            }

            if(data.click) {
                editor.setOnlySelected(obj, !editor.isSelected(obj));
            }

            if(metaData.drawChildren) {
                for(let i = 0; i < obj.children.length; i++) {
                    recurseDepth(obj.children[i], d+1);
                }
            }
        }
    }

    /**@returns {HierarchyWindowObjectMetadata} */
    getMetaData(id) {
        return this.objectMetadata[id] || new HierarchyWindowObjectMetadata();
    }

    /**
     * @param {String} id 
     * @param {HierarchyWindowObjectMetadata} data 
     */
    setMetaData(id, data) {
        this.objectMetadata[id] = data;
    }

    // TODO: add a way to remove this cache when a gameobject is deleted
}

class HierarchyWindowObjectMetadata {
    drawChildren;
    constructor() {
        this.drawChildren = false;
    }
}