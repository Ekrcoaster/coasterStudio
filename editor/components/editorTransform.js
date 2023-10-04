class EditorTransformComponent extends EditorComponent {

    /**@type {UILayout} */
    layout;

    constructor(target) {
        super(target);
        this.layout = new UILayout();

        /**@type {Transform} */
        let transform = this.target;

        this.layout.enabled = !transform.gameObject.isHeader;
        this.layout.vector2Field("Position", () => transform.localPosition, null, (res) => {transform.setLocalPosition(res);});
        this.layout.numberField("Angle", () => transform.localAngle, null, (res) => {transform.setLocalAngle(res);});
        this.layout.vector2Field("Scale", () => transform.localScale, null, (res) => {transform.setLocalScale(res);});
    }

    onRender(x1, y1, x2, y2, width, height) {
        this.layout.renderSpace(x1, y1, x2);
    }

    calculateExpandedHeight() {
        return this.layout.calculateHeight()+10;
    }

    /**
     * @param {Transform} transform 
     * @param {SceneRendererTools} tools
     * */
    onSceneRender(transform, tools) {
        if(transform.gameObject.isHeader) return;
        tools.text(transform.gameObject.name, transform.getWorldPosition().x, transform.getWorldPosition().y, 1, 0, new DrawTextOption(25));
    }

    /**
     * @param {Transform} transform 
     * @param {SceneRendererTools} tools
     * */
    onSelectedSceneRender(transform, tools) {
        if(transform.gameObject.isHeader) return;
        tools.gizmoMove(transform.id, transform.getWorldPosition(), 1);
    }
}