class ShapeRenderer extends Component {

    /**@type {Color} */
    fillColor;
    /**@type {Color} */
    outlineColor;
    /**@type {Number} */
    outlineWidth;
    /**@type {Number} */
    borderRadius;
    /**@type {boolean} */
    outlineWorldSpace;

    constructor() {
        super("Shape Renderer");
        this.fillColor = new Color("#31dba8");
        this.outlineColor = new Color("#ffffff");
        this.outlineWidth = 5;
        this.borderRadius = 20;
        this.outlineWorldSpace = true;
    }

    /**@param {SceneRendererTools} tools */
    renderShape(tools) {
        let points = [
            this.transform.localToWorldSpace(new Vector2(-1, -1)),
            this.transform.localToWorldSpace(new Vector2(1, -1)),
            this.transform.localToWorldSpace(new Vector2(1, 1)),
            this.transform.localToWorldSpace(new Vector2(-1, 1)),
        ]

        let outlineWidth = this.outlineWidth;
        if(this.outlineWorldSpace)
            outlineWidth *= tools.sceneWindow.getRealPixelTileSize() / tools.sceneWindow.pixelTileSize;
        tools.polygon(points, 
            new DrawShapeOption(this.fillColor, this.outlineColor, outlineWidth)
            .setRoundedCorners(this.borderRadius));
    }

    /**@param {Color} color */
    setFillColor(color) {this.fillColor = color;}
    /**@param {Color} color */
    setOutlineColor(color) {this.outlineColor = color;}
    setOutlineWidth(width) {this.outlineWidth = width;}
    setBorderRadius(radius) {this.borderRadius = radius;}
    setOutlineWorldSpace(boo) {this.outlineWorldSpace = boo;}
}