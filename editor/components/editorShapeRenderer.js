class EditorShapeRenderer extends EditorComponent {

    /**@type {UILayout} */
    layout;

    constructor(target) {
        super(target);
        this.layout = new UILayout();

        this.layout.colorField("Fill Color", () => this.target.fillColor, (color) => {this.target.setFillColor(color);});
        this.layout.colorField("Outline Color", () => this.target.outlineColor, (color) => {this.target.setOutlineColor(color);});
        this.layout.numberField("Outline Width", () => this.target.outlineWidth, new StringFieldOption("numbers_only"), (width) => {this.target.setOutlineWidth(width);});
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