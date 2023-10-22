class ScriptAsset extends Asset {

    /**@type {String} */
    code;
    /**@type {String} */
    rawCode;

    codeClassName;

    discoveredCustomTypes = {};

    notifyOnCodeChange = new Set();

    constructor(code) {
        super();
        this.notifyOnCodeChange = new Set();
        this.setCode(code);
    }

    setCode(code) {
        code = code.trim();
        this.rawCode = code;

        // compile the code
        let compiled = this.compileUserCode(code);
        this.discoveredCustomTypes = compiled.types;
        this.code = compiled.code;
        this.codeClassName = compiled.codeClassName;

        this.notifyOnCodeChange.forEach(x => {
            if(x != null) x();
        });
    }

    compileUserCode(code) {
        /**@type {String[]} */
        let lines = code.replace(/\;/gi, "\n").split("\n");
        let codeClassName = code.split(" ")[1];
        let discoveredCustomTypes = {};

        for(let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            // check for the format
            // TYPE varName = or TYPE varName;
            let matches = line.match(/^[a-z0-9$]+[ \t][a-z0-9$]+ *[=;]+/gmi);
            if(matches != null && matches.length == 1) {
                let split = matches[0].split(" ");
                let type = split[0];
                let varName = split[1];
                line = line.replace(type, "");  

                discoveredCustomTypes[varName] = type;
            }

            lines[i] = line;
        }

        return {
            code: lines.join("\n"),
            types: discoveredCustomTypes,
            codeClassName: codeClassName
        }
    }

    addNotifyOnChangeListener(callback) {
        this.notifyOnCodeChange.add(callback)
    }
    removeNotifyOnChangeListener(callback) {
        this.notifyOnCodeChange.delete(callback)
    }

    runAutoFillCode(code, split) {
        // dont run code that'll change values or create new objs
        if(code.indexOf("=") > -1) return [];
        if(code.indexOf("new") > -1) return [];

        let tempScript = new Script(editor.activeScene.header);
        tempScript.setScript(this, true, false);
        return tempScript.runAutoFillCode(code, split);
    }
}