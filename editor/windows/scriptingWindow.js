class ScriptingWindow extends EditorWindow {

    /**@type {ScriptAsset} */
    scriptAsset;

    tempScriptCode;

    constructor() {
        super("Scripting");
        this.scriptAsset = assets.getAsset("engine/internal/scripts/Rotator");
        this.tempScriptCode = this.scriptAsset.rawCode;
    }

    render(x1, y1, x2, y2, width, height) {
        const t = this;

        let tabHeight = 35;

        renderTab(x1, y2-tabHeight, x2);

        let codeRes = UI_WIDGET.multilineEditableText(this.container?.id + "code", this.tempScriptCode, true, x1+5, y1+5, x2-5, y2-tabHeight-5, new DrawTextOption(25, "default", "#ffffff", "left", "center"));
        if(codeRes.applied) {
            this.tempScriptCode = codeRes.text;
        }

        function renderTab(x1, y, x2) {
            UI_LIBRARY.drawRectCoords(x1, y, x2, y+tabHeight, 0, COLORS.windowDarkerBackground());

            let padding = 5;
            x1+= padding;
            let y1 = y+padding;
            x2 -= padding;
            let y2 = y+tabHeight - padding;

            let half = (x1+x2)/2

            let res = UI_WIDGET.editorGUIAssetComponent(t.container?.id + "assetC", "", t.scriptAsset, ScriptAsset, true, x1, y1, half-3, y2);
            if(res.applied) {
                t.scriptAsset = res.selected.obj;
                t.tempScriptCode = t.scriptAsset.rawCode;
            }

            if(UI_WIDGET.button("Save", half+3, y1, x2, y2))
                t.scriptAsset.setCode(t.tempScriptCode);
        }
    }
}