class EditorScript extends EditorComponent {
    /**@type {UIAutoLayout} */
    layout;

    constructor(target) {
        super(target);
        /**@type {Script} */
        let t = target;
        this.layout = new UIAutoLayout();

        this.layout.assetComponentField("Script", () => t.script, ScriptAsset, (asset) => {t.setScript(asset);});
    }

    onRender(x1, y1, x2, y2, width, height) {
        this.layout.renderSpace(x1, y1, x2);
    }

    calculateExpandedHeight() {
        return this.layout.calculateHeight();
    }

    /**@param {Transform} transform @param {SceneRendererTools} tools */
    onSceneRender(transform, tools) {
    }

    onSelectedSceneRender(transform, tools) {
    }
}