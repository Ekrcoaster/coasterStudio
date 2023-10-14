class ScriptAsset extends Asset {

    /**@type {String} */
    code;

    codeClassName;

    discoveredCustomTypes = {};

    constructor(code) {
        super();
        this.code = code;
        this.codeClassName = code.split(" ")[2];

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
    }
}