class ShapeRenderer extends RenderingComponent {

    /**@type {ShapeAsset} */
    shape;
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

    constructor(gameObject, shape) {
        super("Shape Renderer", gameObject);
        if(shape == null)
            this.setShape(assets.getAsset("engine/shapes/square"));
        else
            this.setShape(shape);
        this.fillColor = new Color("#31dba8");
        this.outlineColor = new Color("#ffffff");
        this.outlineWidth = 5;
        this.borderRadius = 20;
        this.outlineWorldSpace = true;
    }

    /**@param {SceneRendererTools} tools */
    render(tools) {
        let points = this.getWorldPoints();

        let outlineWidth = this.outlineWidth;
        if(this.outlineWorldSpace)
            outlineWidth *= tools.getRealPixelTileSize() / tools.pixelTileSize;
        tools.polygon(points, 
            new DrawShapeOption(this.fillColor, this.outlineColor, outlineWidth)
            .setRoundedCorners(this.borderRadius));
    }

    getWorldPoints(scale = 1) {
        let points = []
        if(this.gameObject == null) return points;
        for(let i = 0; i < this.shape.points.length; i++) {
            let local = {x: this.shape.points[i].x, y: this.shape.points[i].y};
            local.x *= scale;
            local.y *= scale;
            points.push(this.gameObject.transform.localToWorldSpace(local));
        }  
        return points;
    }

    /**@param {Color} color */
    setFillColor(color) {this.fillColor = color;}
    /**@param {Color} color */
    setOutlineColor(color) {this.outlineColor = color;}
    setOutlineWidth(width) {this.outlineWidth = width;}
    setBorderRadius(radius) {this.borderRadius = radius;}
    setOutlineWorldSpace(boo) {this.outlineWorldSpace = boo;}
    setShape(shape) { 
        this.shape = shape;

        let points = this.getWorldPoints();
        this.bounds = new Bounds(points);
    }

    getBounds() {
        let points = this.getWorldPoints();
        this.bounds = new Bounds(points);
        return this.bounds;
    }
}