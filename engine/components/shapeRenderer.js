class ShapeRenderer extends Component {
    constructor() {
        super("Shape Renderer");
    }

    /**@param {SceneRendererTools} tools */
    renderShape(tools) {
        let points = [
            this.transform.localToWorldSpace(new Vector2(-1, -1)),
            this.transform.localToWorldSpace(new Vector2(1, -1)),
            this.transform.localToWorldSpace(new Vector2(1, 1)),
            this.transform.localToWorldSpace(new Vector2(-1, 1)),
        ]

        tools.polygon(points, new DrawShapeOption("#f40808", "#f08000", 3).setRoundedCorners(20));
    }
}