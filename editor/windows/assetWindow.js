class AssetWindow extends EditorWindow {

    /**@type {String} */
    currentPath;
    /**@type {Asset[]} */
    currentAssets;
    /**@type {String[]} */
    currentSubPaths;

    constructor() {
        super("Asset");
        this.setPath("editor");
    }

    render(x1, y1, x2, y2, width, height) {
        const t = this;
        let action = null;
        renderAssets(createFoldersToRender(), {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        });

        // then, do the action. Doing it this way so the path doesn't change half way through drawing (looks ugly)
        if(action == "goBack")
            this.goBackPath();
        else if(action != null)
            this.setPath(action);
        
        function createFoldersToRender() {
            let folders = [];
            if(t.currentPath.length > 1) {
                folders.push({
                    render: function(x1, y1, x2, y2) {
                        if(UI_WIDGET.button("...", x1+5, y1, x2-5, y2)) {
                            action = "goBack";
                        }
                    }
                });
            }

            for(let i = 0; i < t.currentSubPaths.length; i++) {
                folders.push({
                    render: function(x1, y1, x2, y2) {
                        if(UI_WIDGET.button(t.currentSubPaths[i].replace(t.currentPath, ""), x1+5, y1, x2-5, y2)) {
                            action = t.currentSubPaths[i];
                        }
                    }
                });
            }

            return folders;            
        }

        function renderAssets(folderToRender = [], space = {x1, y1, x2, y2}) {
            let toRender = [...folderToRender, ...t.currentAssets];
            let padding = 5;
            let tileSize = 146;


            let x = space.x1+padding;
            for(let i = 0; i < toRender.length; i++) {
                toRender[i].render(x, space.y1+padding, x+tileSize, space.y1+padding+tileSize-padding);
                x += tileSize+padding;
            }
        }
    }

    setPath(path) {
        this.currentPath = path;
        this.currentAssets = assets.getAssets(path);
        this.currentSubPaths = Array.from(assets.getSubPaths(path));
    }

    goBackPath() {
        let path = this.currentPath.split("/");
        path.pop();
        this.setPath(path.join("/"));
    }
}