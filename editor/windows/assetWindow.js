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
        let leftWidth = 256;
        renderOutline({
            x1: x1,
            y1: y1,
            x2: x1+leftWidth,
            y2: y2
        });
        renderAssets({
            x1: x1+leftWidth,
            y1: y1,
            x2: x2,
            y2: y2
        });

        
        function renderOutline(space = {x1, y1, x2, y2}) {
            UI_LIBRARY.drawRectCoords(space.x1, space.y1, space.x2, space.y2, 0, COLORS.windowDarkerBackground());

            let action = null;

            let y = space.y1+5;
            if(t.currentPath.length > 1) {
                if(UI_WIDGET.button("...", space.x1+5, y, space.x2-5, space.y1+35)) {
                    action = "goBack";
                }
                y += 40;
            }

            for(let i = 0; i < t.currentSubPaths.length; i++) {
                let height = 35;
                if(UI_WIDGET.button(t.currentSubPaths[i].replace(t.currentPath, ""), space.x1+5, y, space.x2-5, y + height)) {
                    action = t.currentSubPaths[i];
                }

                y += height + 5;
            }

            // then, do the action. Doing it this way so the path doesn't change half way through drawing (looks ugly)
            if(action == "goBack")
                t.goBackPath();
            else if(action != null)
                t.setPath(action);
        }

        function renderAssets(space = {x1, y1, x2, y2}) {
            let padding = 5;
            let tileSize = space.y2-space.y1-padding;
            let x = space.x1+padding;
            for(let i = 0; i < t.currentAssets.length; i++) {
                t.currentAssets[i].render(x, space.y1+padding, x+tileSize, space.y1+padding+tileSize-padding);
    
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