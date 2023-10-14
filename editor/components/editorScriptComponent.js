class EditorScript extends EditorComponent {
    /**@type {UIAutoLayout} */
    layout;

    constructor(target) {
        super(target);
        this.updateLayout();
    }

    updateLayout() {
        /**@type {Script} */
        let t = this.target;

        this.layout = new UIAutoLayout();

        this.layout.assetComponentField("Script", () => t.script, ScriptAsset, (asset) => {t.setScript(asset);});

        for(let i = 0; i < t.instanceFields.length; i++) {
            let key = t.instanceFields[i];
            let type = t.getInstanceFieldType(key);

            if(type == "number") {
                this.layout.numberField(key, () => {return t.instance[key]}, new StringFieldOption("numbers_only"), (num) => {
                    t.instance[key] = num;
                });
            } else {
                this.layout.stringField(key, () => {return t.instance[key] + ""}, new StringFieldOption(), (num) => {
                    t.instance[key] = num;
                });
            }
        }
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