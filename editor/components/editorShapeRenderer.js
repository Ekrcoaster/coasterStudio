class EditorShapeRenderer extends EditorComponent {

    /**@type {UIAutoLayout} */
    layout;

    constructor(target) {
        super(target);
        this.layout = new UIAutoLayout();

        this.layout.assetComponentField("Shape", () => this.target.shape, ShapeAsset, (asset) => {this.target.setShape(asset);});
        this.layout.colorField("Fill Color", () => this.target.fillColor, (color) => {this.target.setFillColor(color);});
        this.layout.colorField("Outline Color", () => this.target.outlineColor, (color) => {this.target.setOutlineColor(color);});
        this.layout.numberField("Outline Width", () => this.target.outlineWidth, new StringFieldOption("numbers_only"), (width) => {this.target.setOutlineWidth(width);});
        this.layout.indent++;
        this.layout.boolField("World Consistent", () => this.target.outlineWorldSpace, (outlineWorldSpace) => {this.target.setOutlineWorldSpace(outlineWorldSpace);});
        this.layout.indent--;
        this.layout.numberField("Border Radius", () => this.target.borderRadius, new StringFieldOption("numbers_only"), (width) => {this.target.setBorderRadius(width);});
    }

    onRender(x1, y1, x2, y2, width, height) {
        this.layout.renderSpace(x1, y1, x2);
    }

    calculateExpandedHeight() {
        return this.layout.calculateHeight();
    }

    /**@param {Transform} transform @param {SceneRendererTools} tools */
    onSceneRender(transform, tools) {
        /**@type {ShapeRenderer} */
        let myself = this.target;
        myself.renderShape(tools);
    }
}