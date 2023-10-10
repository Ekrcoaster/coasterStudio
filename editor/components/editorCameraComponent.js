class EditorCamera extends EditorComponent {
    /**@type {UIAutoLayout} */
    layout;

    constructor(target) {
        super(target);
        /**@type {Camera} */
        let camera = target;
        this.layout = new UIAutoLayout();

        this.layout.numberField("Width", () => camera.width, null, (res) => {camera.setWidth(res);});
        this.layout.numberField("Height", () => camera.height, null, (res) => {camera.setHeight(res);});
    }

    onRender(x1, y1, x2, y2, width, height) {
        this.layout.renderSpace(x1, y1, x2);
    }

    calculateExpandedHeight() {
        return this.layout.calculateHeight();
    }

    /**@param {Transform} transform @param {SceneRendererTools} tools */
    onSceneRender(transform, tools) {
        let center = transform.getWorldPosition();
        let coordSize = {
            width: this.target.width / tools.pixelTileSize,
            height: this.target.height / tools.pixelTileSize
        }
        /**@type {ImageRenderer} */
        tools.polygon([
            {x: center.x - coordSize.width/2, y: center.y - coordSize.height/2},
            {x: center.x + coordSize.width/2, y: center.y - coordSize.height/2},
            {x: center.x + coordSize.width/2, y: center.y + coordSize.height/2},
            {x: center.x - coordSize.width/2, y: center.y + coordSize.height/2}
        ], new DrawShapeOption("transparent", "#ffffff", 5));
        tools.text(transform.gameObject.name, center.x-1, center.y - coordSize.height/2 - 0.2, 2, 0.1, new DrawTextOption(25, "default", "#ffffff", "center", "center"));
    }

    onSelectedSceneRender(transform, tools) {
        //let points = this.target.getWorldPoints(1.2);

        //tools.polygon(points, new DrawShapeOption("red", "#1dacf4", 6).setRoundedCorners(10));
    }
}