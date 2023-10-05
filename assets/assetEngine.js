class AssetEngine {
    assets = {};

    constructor() {
        this.saveAsset("editor/colorWheel", new LocalImageAsset("./res/editor/colorWheel.png"));
    }

    /**
     * Saves an asset to a path
     * 
     *   engine/------
     *   editor/------
     * 
     * @param {String} path 
     * @param {Asset} asset 
     */
    saveAsset(path, asset) {
        this.assets[path] = asset;
        asset._setPath(path);
        return asset;
    }

    /**
     * gets an asset from the path:
     *    engine/ - -- - - 
     *    editor/ - -- - -
     * @param {String} path 
     * @returns {Asset}
     */
    getAsset(path = "") {
        return this.assets[path];
    }
    /**
     * gets the assets in the path space
     *    engine/ - -- - - 
     *    editor/ - -- - -
     * @param {String} path 
     * @returns {Asset[]}
     */
    getAssets(path = "") {
        let found = [];
        let mySplit = path.split("/");
        for(let p in this.assets) {
            let pSplit = this.assets[p].directory.split("/");

            // check if the directories are the same length (excluding the asset name)
            if(pSplit.length == mySplit.length) {

                // then check if they match
                let directoryMatches = true;
                for(let i = 0; i < mySplit.length; i++) {
                    if(pSplit[i] != mySplit[i])
                        directoryMatches = false;
                }

                found.push(this.assets[p]);
            }
        }
        return found;
    }

    getSubPaths(path = "") {
        if(path == "/") path = "";

        let paths = new Set();
        let mySplit = path.split("/");
        for(let p in this.assets) {
            let pSplit = this.assets[p].directory.split("/");
            
            // check if the directories are the same length (excluding the asset name)
            if(pSplit.length == mySplit.length+1) {

                // then check if they match
                let directoryMatches = true;
                for(let i = 0; i < mySplit.length-1; i++) {
                    if(pSplit[i] != mySplit[i])
                        directoryMatches = false;
                }

                paths.add(this.assets[p].directory);
            }
        }
        return paths;
    }
}

class Asset {
    id;
    name;
    path;
    directory;

    constructor() {
        this.id = UTILITY.generateCode(14);
    }

    _setPath(path) {
        this.path = path;
        let last = path.lastIndexOf("/");
        this.name = path.substring(last+1);
        this.directory = path.substring(0, last+1);
    }

    render(x1, y1, x2, y2) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption("#ff0000"));
    }
}