class EditorImageRenderer extends EditorComponent {

    /**@type {UIAutoLayout} */
    layout;

    constructor(target) {
        super(target);
        /**@type {ImageRenderer} */
        let img = target;
        this.layout = new UIAutoLayout();

        this.layout.assetComponentField("Image", () => img.imageAsset, ImageAsset, (asset) => {img.setImage(asset);});
        this.layout.vector2Field("TL UV", () => img.topLeftUV, null, (res) => {img.setTopLeftUV(res);});
        this.layout.vector2Field("BR UV", () => img.bottomRightUV, null, (res) => {img.setBottomRightUV(res);});
    }

    onRender(x1, y1, x2, y2, width, height) {
        this.layout.renderSpace(x1, y1, x2);
    }

    calculateExpandedHeight() {
        return this.layout.calculateHeight();
    }

    /**@param {Transform} transform @param {SceneRendererTools} tools */
    onSceneRender(transform, tools) {
        /**@type {ImageRenderer} */
        let myself = this.target;
        myself.render(tools);
    }

    onSelectedSceneRender(transform, tools) {
        //let points = this.target.getWorldPoints(1.2);

        //tools.polygon(points, new DrawShapeOption("red", "#1dacf4", 6).setRoundedCorners(10));
    }
}
