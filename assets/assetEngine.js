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
        for(let p in this.assets) {
            if(p.startsWith(path))
                found.push(this.assets[p]);
        }
        return found;
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
}