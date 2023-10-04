class ShapeRenderer extends Component {

    /**@type {Color} */
    fillColor;
    /**@type {Color} */
    outlineColor;
    /**@type {Number} */
    outlineWidth;

    constructor() {
        super("Shape Renderer");
        this.fillColor = new Color("#31dba8");
        this.outlineColor = new Color("#ffffff");
        this.outlineWidth = 5;
    }

    /**@param {SceneRendererTools} tools */
    renderShape(tools) {
        let points = [
            this.transform.localToWorldSpace(new Vector2(-1, -1)),
            this.transform.localToWorldSpace(new Vector2(1, -1)),
            this.transform.localToWorldSpace(new Vector2(1, 1)),
            this.transform.localToWorldSpace(new Vector2(-1, 1)),
        ]

        tools.polygon(points, new DrawShapeOption(this.fillColor, this.outlineColor, this.outlineWidth).setRoundedCorners(20));
    }

    /**@param {Color} color */
    setFillColor(color) {this.fillColor = color;}
    /**@param {Color} color */
    setOutlineColor(color) {this.outlineColor = color;}
    setOutlineWidth(width) {this.outlineWidth = width;}
}