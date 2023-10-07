class EditorTransformComponent extends EditorComponent {

    /**@type {UIAutoLayout} */
    layout;

    constructor(target) {
        super(target);
        this.layout = new UIAutoLayout();

        /**@type {Transform} */
        let transform = this.target;

        this.layout.enabled = !transform.gameObject.isHeader;
        this.layout.vector2Field("Position", () => transform.localPosition, null, (res) => {transform.setLocalPosition(res);});
        this.layout.numberField("Angle", () => transform.localAngle, null, (res) => {transform.setLocalAngle(res);});
        this.layout.vector2Field("Scale", () => transform.localScale, null, (res) => {transform.setLocalScale(res);});
        this.layout.vector2Field("Sheer", () => transform.localSheer, null, (res) => {transform.setLocalSheer(res);});
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
    }

    /**
     * @param {Transform} transform 
     * @param {SceneRendererTools} tools
     * */
    onSelectedSceneRender(transform, tools) {
        if(transform.gameObject.isHeader) return;
        //transform.setWorldPosition(tools.gizmoMove(transform.id, transform.getWorldPosition()));
    }
}