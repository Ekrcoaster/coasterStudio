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
        this.codeClassName = code.split(" ")[1];

        // read custom types
        this.discoveredCustomTypes = {};
        /**@type {String[]} */
        let lines = code.replace(/\;/gi, "\n").split("\n");

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

                this.discoveredCustomTypes[varName] = type;
            }

            lines[i] = line;
        }
        
        this.code = lines.join("\n");
        this.notifyOnCodeChange.forEach(x => {
            if(x != null) x();
        });
    }

    addNotifyOnChangeListener(callback) {
        this.notifyOnCodeChange.add(callback)
    }
    removeNotifyOnChangeListener(callback) {
        this.notifyOnCodeChange.delete(callback)
    }
}