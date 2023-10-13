class EditorSceneController extends EditorComponent {
    /**@type {UIAutoLayout} */
    layout;

    constructor(target) {
        super(target);
        /**@type {SceneController} */
        let sc = target;
        this.layout = new UIAutoLayout();

        this.layout.colorField("Background", () => sc.backgroundColor, null, (res) => {sc.setBackgroundColor(res);});
    }

    onRender(x1, y1, x2, y2, width, height) {
        this.layout.renderSpace(x1, y1, x2);
    }

    calculateExpandedHeight() {
        return this.layout.calculateHeight();
    }
}