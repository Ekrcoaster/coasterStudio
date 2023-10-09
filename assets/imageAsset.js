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

    renderPreview(x1, y1, x2, y2) {
        UI_LIBRARY.drawImage(this, x1, y1, x2, y2, 0, new DrawImageOption());
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

class UploadedImageAsset extends ImageAsset {
    constructor(file) {
        super();
        const t = this;
        let reader = new FileReader();
        reader.onload = function(){
            let dataURL = reader.result;
            t.image = new Image();
            t.image.onload = (ev) => {
                t.width = t.image.clientWidth;
                t.height = t.image.clientHeight;
            }
            t.image.id = "image_" + t.path;
            t.image.src = dataURL;
            t.isLoaded = true;
            document.body.append(t.image);
        };
        reader.readAsDataURL(file);
    }
}