class ImageRenderer extends RenderingComponent {
    /**@type {ImageAsset} */
    imageAsset;

    /**@type {Vector2} */
    topLeftUV;

    /**@type {Vector2} */
    bottomRightUV;

    /**@param {ImageAsset} imageAsset  */
    constructor(gameObject, imageAsset) {
        super("ImageRenderer", gameObject);
        this.imageAsset = imageAsset;
        this.topLeftUV = new Vector2();
        this.bottomRightUV = new Vector2(1, 1);
    }  

    setImage(imageAsset) {
        this.imageAsset = imageAsset;
    }

    setTopLeftUV(v) {
        this.topLeftUV = v;
    }
    setBottomRightUV(v) {
        this.bottomRightUV = v;
    }

    getWorldPoints(scale = 1) {
        let points = [{x: -1, y: -1}, {x: 1, y: 1}];
        for(let i = 0; i < points.length; i++) {
            let local = {x: points[i].x, y: points[i].y};
            local.x *= scale;
            local.y *= scale;
            points[i] = this.gameObject.transform.localToWorldSpace(local);
        }  
        return points;
    }

    /**@param {SceneRendererTools} tools */
    render(tools) {
        if(this.imageAsset == null) return;

        let center = this.transform.localToWorldSpace(new Vector2());
        let scale = this.transform.getWorldScale();
        let rotation = this.transform.getWorldRotation();

        tools.image(this.imageAsset, center.x-scale.x, center.y-scale.y, center.x+scale.x, center.y+scale.y, rotation, 
            new DrawImageOption().setTopLeftUV(this.topLeftUV.x, this.topLeftUV.y).setBottomRightUV(this.bottomRightUV.x, this.bottomRightUV.y));
    }

    getBounds() {
        return new Bounds().addPoints(this.getWorldPoints(1));
    }

    saveSerialize() {
        return {
            ...super.saveSerialize(),
            imageAsset: this.imageAsset?.path,
            topLeftUV: this.topLeftUV,
            bottomRightUV: this.bottomRightUV
        }
    }

    loadSerialize(data) {
        super.loadSerialize(data);
        this.setImage(assets.getAsset(data.imageAsset));
        this.setTopLeftUV(assets.topLeftUV);
        this.setBottomRightUV(assets.bottomRightUV);
    }
}