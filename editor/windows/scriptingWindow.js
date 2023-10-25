class ScriptingWindow extends EditorWindow {

    /**@type {ScriptAsset} */
    scriptAsset;

    tempScriptCode;

    reverseReference = {}

    constructor() {
        super("Scripting");
        this.scriptAsset = assets.getAsset("engine/internal/scripts/Rotator");
        this.tempScriptCode = this.scriptAsset.rawCode;
    }

    render(x1, y1, x2, y2, width, height) {
        const t = this;

        let tabHeight = 35;

        renderTab(x1, y2-tabHeight, x2);

        let visualizedCode = this.createReverseReference(this.tempScriptCode);

        let option = new MultilineStringFieldOption("any").setRichText(true);
        let draw = new DrawTextOption(22, "default", "#ffffff", "left", "center");
        option.setOnRender((lineCount, lineIndex, x1, y1, x2, y2) => {
            lineCount = Math.max(10, lineCount);    // start with double digits
            let longest = UI_UTILITY.measureText(lineCount + "", draw);
            let w = longest.width + 10+2;
            UI_LIBRARY.drawRectCoords(x1-1, y1-1, x1+w+3, y2+1, 0, COLORS.windowEvenDarkerBackground().setStrokeWidth(0).setRoundedCorners(0));
            UI_LIBRARY.drawText((lineIndex+1) + "", x1, y1, x1+w, y2, new DrawTextOption(22, "default", "#ffffff6f", "right", "center"));
            return w+5;
        });
        
        let codeRes = UI_WIDGET.multilineEditableText(this.container?.id + "code", visualizedCode, true, x1+5, y1+5, x2-5, y2-tabHeight-5, draw, option);
        if(false && codeRes.applied && codeRes.characterTyped != null) {
            this.tempScriptCode = this.reAssembleWithReversedReference(codeRes.cursorY, codeRes.cursorX, codeRes.characterTyped);

            let autoFill = this.getAutofillOptions(codeRes.cursorX, codeRes.cursorY);
            if(autoFill.options.length > 0) {
                let options = [];
                for(let i = 0; i < autoFill.options.length; i++) {
                    if(autoFill.options[i].startsWith(autoFill.soFar))
                        options.push(new DropdownItem(i, autoFill.options[i], autoFill.options[i]));
                }

                if(options.length > 0) {
                    UI_WIDGET.popUpDropdownList(this.container?.id + "autofill", options, -1, codeRes.cursorXScreenPos, codeRes.cursorYScreenPos, codeRes.cursorXScreenPos+200, codeRes.cursorYScreenPos+codeRes.cursorYScreenHeight, (i) => {
                        autoComplete(options[i].label);
                    });
                }

                function autoComplete(option) {
                    let temp = t.tempScriptCode.split("\n");
                    temp[codeRes.cursorY] += option;
                    t.tempScriptCode = temp.join("\n");
                    widgetCacheData[t.container?.id + "code" + codeRes.cursorY].tempText = null;
                    widgetCacheData[t.container?.id + "code" + codeRes.cursorY].cursor += option.length;
                }
            } else {
                if(editor.activeModal?.id == this.container?.id + "autofill")
                    editor.closeActiveModal();
            }
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

    getAutofillOptions(cursorX, cursorY) {
        let lineSplit = this.tempScriptCode.split("\n");
        if(lineSplit.length == 0 || cursorY == -1) return {
            options: [],
            soFar: ""
        };

        let line = lineSplit[Math.min(lineSplit.length - 1, cursorY)];

        // figure out which part of the code we are working on
        let activeStrips = line.replace(/\t/gi, " ").replace(/\;/gi, " ").split(" ");
        cursorX = getXMinusWhiteSpace(cursorX, line);
        let activeStrip = getActiveStrip(activeStrips, cursorX);

        let split = activeStrip.strip.substring(0, activeStrip.local+1).split(".");
        if(split.length <= 1) return {
            options: [],
            soFar: ""
        };
        let soFar = split.pop();
        let baseLine = split.join(".");
        return {
            options: this.scriptAsset.runAutoFillCode(baseLine, split),
            soFar: soFar
        }

        function getXMinusWhiteSpace(x, line) {
            let sub = 0;
            for(let i = 0; i <= x; i++) {
                if(line[i] == " " || line[i] == "\t" || line[i] == ";")
                    sub++;
            }
            return x - sub;
        }   

        function getActiveStrip(strips, x) {
            for(let i = 0; i < strips.length; i++) {
                if(x - strips[i].length < 0)
                    return {strip: strips[i], local: x};
                x -= strips[i].length;
            }
            return {strip: strips[strips.length - 1], local: Infinity};
        }
    }

    createReverseReference(code) {
        //code = code.replace(/\t/gim, "\t<⌱c=tab m=25><⌱ m=0>");

        this.reverseReference = {}
        let split = code.split("\n");
        for(let i = 0; i < split.length; i++) {
            let temp = [];

            for(let c = 0; c < split[i].length; c++) {
                temp.push({"index": c, "letter": split[i][c]});
            }

            this.reverseReference[i] = temp;
        }

        let newCode = "";

        for(let i in this.reverseReference) {
            for(let c = 0; c < this.reverseReference[i].length; c++) {
                let letter = this.reverseReference[i][c].letter;
                // pre processing
                newCode += preProcess(letter);

                newCode += letter;
            }
            newCode += "\n";
        }

        return newCode;

        function preProcess(ogLetter) {

            if(ogLetter == "\t")
                return "<⌱c=tab m=25><⌱ m=0>";

            return "";
        }
    }

    reAssembleWithReversedReference(changedLine, changedCharacter, newCharacter) {
        let newCode = "";
        for(let i in this.reverseReference) {
            for(let c = 0; c < this.reverseReference[i].length; c++) {
                let letter = this.reverseReference[i][c].letter;
                newCode += letter;

                if(changedLine == i && changedCharacter-2 == c) {
                    newCode += newCharacter;
                }
            }
            newCode += "\n";
        }
        console.log(newCode)
        return newCode;
    }
}