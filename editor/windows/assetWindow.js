class AssetWindow extends EditorWindow {

    /**@type {String} */
    currentPath;
    /**@type {Asset[]} */
    currentAssets;
    /**@type {String[]} */
    currentSubPaths;

    constructor() {
        super("Asset");
        this.setPath("/");
    }

    render(x1, y1, x2, y2, width, height) {
        let tileSize = width / this.currentAssets.length;
        let x = x1;
        for(let i = 0; i < this.currentAssets.length; i++) {
            this.currentAssets[i].render(x, y1, x+tileSize, y2);

            x += tileSize;
        }
    }

    setPath(path) {
        this.currentPath = path;
        this.currentAssets = assets.getAssets(path);
        this.currentSubPaths = assets.getSubPaths(path);
    }
}