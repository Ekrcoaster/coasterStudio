class ImageAsset extends Asset {
    width;
    height;
    /**@type {HTMLImageElement} */
    image;
    isLoaded;

    constructor() {
        super();
        this.width = 0;
        this.height = 0;
        this.image = null;
        this.isLoaded = false;
    }
}

class LocalImageAsset extends ImageAsset {
    constructor(localFilePath) {
        super();

        this.image = new Image();
        this.image.src = localFilePath;
        this.image.onload = (ev) => {
            this.image.id = "image_" + this.path;
            this.width = this.image.width;
            this.height = this.image.height;
            this.isLoaded = true;
        }
        document.body.append(this.image);
    }
}