class HierarchyWindow extends EditorWindow {

    objectMetadata = {}

    cacheObjScreenPos = []

    constructor() {
        super("Hierarchy");
        this.objectMetadata = {};
    }

    render(x1, y1, x2, y2, width, height) {
        const t = this;
        let scene = editor.activeScene;
        if(scene == null) {
            staticUISpace.ui.drawText("No scene loaded!", x1, y1, x2, y2, new DrawTextOption(22, "default", "red", "center", "center"));
            return;
        }

        let newCache = [];


        let y = y1+5;
        for(let i = 0; i < scene.rootGameObjects.length; i++) {
            recurseDepth(scene.rootGameObjects[i], 0);
            //issue: update position on root: 71 (null)
        }

        let deselect = staticUISpace.mouse.clickDown && staticUISpace.mouse.isHoveringOver(x1, y, x2, Math.max(y, y2));

        if(deselect)
            editor.handleSelectClick(null);

        this.cacheObjScreenPos = newCache;

        if(UI_WIDGET.button("New Object", x1, y2-45, x2, y2)) {
            let primitives = assets.getAssetsOfType("editor/primitives", ObjectPrimitiveAsset);
            /**@type {DropdownItem[]} */
            let options = [];
            for(let i = 0; i < primitives.length; i++) {
                options.push(new DropdownItem(i, primitives[i].name, primitives[i]));
            }
            UI_WIDGET.popUpDropdownList(this.id + "popupNew", options, -1, x1, y2-45, x2, y2, (index) => {
                let obj = options[index].obj.createObject(editor.activeScene);
                editor.setOnlySelected(obj, true);
            });
        }
        
        /**@param {GameObject} obj */
        function recurseDepth(obj, d = 0) {
            let metaData = t.getMetaData(obj.id);
            let depth = (d * 20);

            let hoveringGameObject = null;
            if(staticUISpace.mouse.mouseDrag?.id == "dragginggameobj")
                hoveringGameObject = t.getHoveringOverGameObject(staticUISpace.mouse.x, staticUISpace.mouse.y);

            let data = UI_WIDGET.hierarchyGameObject("hierarchyWindow " + obj.id, obj, metaData, x1 + depth, y, x2, obj.id == scene.header.id, editor.isSelected(obj), hoveringGameObject);
            if(obj.id != scene.header.id)
                newCache.push({obj: obj, x1: x1, y1: y, x2: x2, y2: y+data.height});
            if(obj.name != data.newName)
                obj.name = data.newName;
            y += data.height;


            if(data.newExpandValue != metaData.drawChildren) {
                if(staticUISpace.keyboard.isAltDown) {
                    t.setChildrenOpen(obj, data.newExpandValue);
                } else {
                    metaData.drawChildren = data.newExpandValue;
                    t.setMetaData(obj.id, metaData);
                }
            }

            if(data.hover && staticUISpace.mouse.getDownDistance() > 5 && obj.id != scene.header.id) {
                startDragging(obj);
            } else if(data.click) {
                editor.handleSelectClick(obj);
            }

            if(metaData.drawChildren) {
                for(let i = 0; i < obj.children.length; i++) {
                    recurseDepth(obj.children[i], d+1);
                }
            }
        }

        function startDragging(obj) {
            staticUISpace.mouse.startDragging(new MouseDrag("dragginggameobj", (x, y, data, id) => {
                UI_WIDGET.hierarchyGameObject("drag" + data.obj.id, data.obj, t.getMetaData(data.obj.id), x, y, data.ogWidth, false, false);
            }, (x, y, data, id) => {
                let result = t.getHoveringOverGameObject(x, y);
                if(result.before == null && result.after == null)
                    data.obj.setParent(result.parent);
                else {
                    if(result.before != null) {
                        data.obj.setParent(result.before.parent);
                        data.obj.setSiblingIndex(result.before.getSiblingIndex());
                    } else if(result.after != null) {
                        data.obj.setParent(result.after.parent);
                        data.obj.setSiblingIndex(result.after.getSiblingIndex()+2);
                    }
                }
            }, {
                obj: obj,
                ogWidth: width
            }));
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

    setChildrenOpen(child, open) {
        let meta = this.getMetaData(child.id);
        meta.drawChildren = open;
        this.setMetaData(child.id, meta);

        for(let i = 0; i < child.children.length; i++)
            this.setChildrenOpen(child.children[i], open);
    }

    getHoveringOverGameObject(x, y) {
        let result = {parent: null, before: null, after: null};
        let highestBar = 0;
        let betweenPadding = 4;
        for(let i = 0; i < this.cacheObjScreenPos.length; i++) {
            if(staticUISpace.utility.isInside(x, y, this.cacheObjScreenPos[i].x1, this.cacheObjScreenPos[i].y1, this.cacheObjScreenPos[i].x2, this.cacheObjScreenPos[i].y2, -betweenPadding)) {
                result.parent = this.cacheObjScreenPos[i].obj; 
                return result;
            }
            if(staticUISpace.utility.isInside(x, y, this.cacheObjScreenPos[i].x1, this.cacheObjScreenPos[i].y1, this.cacheObjScreenPos[i].x2, this.cacheObjScreenPos[i].y2, betweenPadding)) {
                if(y <= (this.cacheObjScreenPos[i].y1+this.cacheObjScreenPos[i].y2)/2) {
                    result.before = this.cacheObjScreenPos[i].obj;
                    return result;
                }
            }
            highestBar = this.cacheObjScreenPos[i].y2;
        }

        // allow placing after last object searched
        if(y < highestBar+15) {
            result.after = this.cacheObjScreenPos[this.cacheObjScreenPos.length - 1].obj;
            return result;
        }

        return result;
    }

    // TODO: add a way to remove this cache when a gameobject is deleted
}

class HierarchyWindowObjectMetadata {
    drawChildren;
    constructor() {
        this.drawChildren = false;
    }
}