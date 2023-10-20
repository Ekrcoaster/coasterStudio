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

        let visualizedCode = this.visualizeCode(this.tempScriptCode);

        let option = new MultilineStringFieldOption("any");
        let draw = new DrawTextOption(25, "default", "#ffffff", "left", "center");
        option.setOnRender((lineCount, lineIndex, x1, y1, x2, y2) => {
            lineCount = Math.max(10, lineCount);    // start with double digits
            let longest = UI_UTILITY.measureText(lineCount + "", draw);
            let w = longest.width + 10+2;
            UI_LIBRARY.drawRectCoords(x1-1, y1-1, x1+w+3, y2+1, 0, COLORS.windowEvenDarkerBackground().setStrokeWidth(0).setRoundedCorners(0));
            UI_LIBRARY.drawText(lineIndex + "", x1, y1, x1+w, y2, new DrawTextOption(25, "default", "#ffffff6f", "right", "center"));
            return w+5;
        });
        let codeRes = UI_WIDGET.multilineEditableText(this.container?.id + "code", visualizedCode, true, x1+5, y1+5, x2-5, y2-tabHeight-5, draw, option);
        if(codeRes.applied) {
            this.tempScriptCode = this.unVisualizeCode(codeRes.text);
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

    visualizeCode(code) {
        code = code.replace(/\t/gi, "   ");
        return code;
    }

    unVisualizeCode(code) {
        code = code.replace(/   /gi, "\t");
        return code;
    }
}