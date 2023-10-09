class AssetEngine {
    assets = {};

    /**@type {Set<Function>} */
    onAssetLoaded = new Set();

    constructor() {
        this.createFalseDirectory("engine");
        this.createFalseDirectory("engine/images");
        this.createFalseDirectory("engine/audio");
        this.createFalseDirectory("engine/scenes");
        this.createFalseDirectory("editor/icons");

        this.setupDefaultImages();
        this.setupDefaultShapes();
        this.setupDefaultObjectPrimitives();
        this.setupDefaultComponents();
    }

    setupDefaultImages() {
        this.saveAsset("editor/colorWheel", new LocalImageAsset("./res/editor/colorWheel.png"));
        this.saveAsset("engine/images/default", new LocalImageAsset("./res/engine/missing.png"));
    }
    setupDefaultShapes() {
        this.saveAsset("engine/shapes/square", new ShapeAsset([
            {x: -1, y: -1},
            {x: 1, y: -1},
            {x: 1, y: 1},
            {x: -1, y: 1},
        ]));
        this.saveAsset("engine/shapes/triangle", new ShapeAsset([
            {x: 0, y: -1},
            {x: 1, y: 1},
            {x: -1, y: 1},
        ]));
        this.saveAsset("engine/shapes/pentagon", new ShapeAsset([
            {x: 0, y: -1},
            {x: -1, y: -0.2},
            {x: -0.7, y: 1},
            {x: 0.7, y: 1},
            {x: 1, y: -0.2},
        ]));
        this.saveAsset("engine/shapes/hexagon", new ShapeAsset([
            {x: -1, y: 0},
            {x: -0.5, y: 1},
            {x: 0.5, y: 1},
            {x: 1, y: 0},
            {x: 0.5, y: -1},
            {x: -0.5, y: -1},
        ]));
    }
    setupDefaultObjectPrimitives() {
        this.saveAsset("editor/primitives/empty", new ObjectPrimitiveAsset((obj) => {
            obj.name = "New Empty";
        }));

        this.saveAsset("editor/primitives/square", new ObjectPrimitiveAsset((obj) => {
            obj.name = "New Square";
            obj.addComponent(new ShapeRenderer(obj, assets.getAsset("engine/shapes/square")));
        }));

        this.saveAsset("editor/primitives/triangle", new ObjectPrimitiveAsset((obj) => {
            obj.name = "New Triangle";
            obj.addComponent(new ShapeRenderer(obj, assets.getAsset("engine/shapes/triangle")));
        }));

        this.saveAsset("editor/primitives/pentagon", new ObjectPrimitiveAsset((obj) => {
            obj.name = "New Pentagon";
            obj.addComponent(new ShapeRenderer(obj, assets.getAsset("engine/shapes/pentagon")));
        }));

        this.saveAsset("editor/primitives/hexagon", new ObjectPrimitiveAsset((obj) => {
            obj.name = "New Hexagon";
            obj.addComponent(new ShapeRenderer(obj, assets.getAsset("engine/shapes/hexagon")));
        }));

        this.saveAsset("editor/primitives/image", new ObjectPrimitiveAsset((obj) => {
            obj.name = "New Image";
            obj.addComponent(new ImageRenderer(obj, assets.getAsset("engine/images/default")));
        }));
    }
    setupDefaultComponents() {
        this.saveAsset("engine/internal/components/transform", new InternalComponentAsset("Transform"));
        this.saveAsset("engine/internal/components/shapeRenderer", new InternalComponentAsset("ShapeRenderer"));
        this.saveAsset("engine/internal/components/imageRenderer", new InternalComponentAsset("ImageRenderer"));
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
        this.onAssetLoadedCall(asset);
        return asset;
    }

    createFalseDirectory(path) {
        this.assets[path] = null;
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
        if(path == "") return [];
        for(let p in this.assets) {
            if(this.assets[p] == null) continue;
            if(path+"/" == this.assets[p].directory)
                found.push(this.assets[p]);
        }
        return found;
    }

    getAssetsOfType(startingPath = "", type) {
        let assets = [];
        for(let p in this.assets) {
            if(this.assets[p] == null) continue;
            if(p.startsWith(startingPath)) {
                if(this.assets[p] instanceof type)
                    assets.push(this.assets[p]);
            }
        }
        return assets;
    }

    getSubPaths(path = "") {
        let paths = new Set();
        
        for(let p in this.assets) {
            let dir = this._isDirectorySub(path, p);
            if(dir.isMatch)
                paths.add(dir.dir);
        }

        return paths;
    }
    
    _isDirectorySub(firstPath, secondPath) {
        let mySplit = firstPath.split("/");
        if(mySplit[0] == "") mySplit.shift();
        // check if the directory even starts with it
        if(secondPath.startsWith(firstPath)) {
            // if so, split the directories up and see if the sub paths patch
            let split = secondPath.split("/");
            let dir = "";
            for(let i = 0; i <= mySplit.length; i++) {
                if(split[i] != null)
                    dir += split[i] + "/";
            }
            dir = dir.substring(0, dir.length - 1);

            // if the directory is valid and it isn't the same as the current path
            // then check if the directory is an object or a directory
            // directories are either longer OR they point to null
            if(dir.length > 2 && dir != firstPath) {
                if(this.assets[dir] == null)
                    return {isMatch: true, dir: dir}
            }
            return {isMatch: false, dir: ""};
        }
        return {isMatch: false, dir: ""};
    }

    /**@param {File} file */
    uploadFile(file, path) {  
        if(file.type.indexOf("image") > -1) {
            console.log(file, path)
            this.saveAsset(path + "/" + file.name, new UploadedImageAsset(file));
        }
    }

    addAssetLoadedListener(callback = (asset) => {}) {
        this.onAssetLoaded.add(callback);
    }

    onAssetLoadedCall(asset) {
        this.onAssetLoaded.forEach(x => {
            if(x != null)
                x(asset);
        });
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
        let textHeight = 50;
        UI_LIBRARY.drawText(this.name, x1, y2-textHeight, x2, y2, COLORS.assetWindowAssetText);
        this.renderPreview(x1+textHeight/2, y1, x2-textHeight/2, y2-textHeight);
    }

    renderPreview(x1, y1, x2, y2) {}
}