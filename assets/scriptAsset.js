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
        const matches = code.match(/\[([a-zA-Z0-9_$]+)\][ \t\n]*[a-zA-Z0-9_$]+/igm);
        if(matches) {
            // for each type, use the regex to extract the [Type] & name
            for(let i = 0; i < matches.length; i++) {
                let split = matches[i].replace(/\t/gi, " ").replace(/\n/gi, " ").split(" ");
                let type = split[0].substring(1, split[0].length - 1);
                let name = split[1];
                this.discoveredCustomTypes[name] = type;

                // then remove these tags from the code so it can be executed
                this.code = this.code.replace(split[0], "");
            }
        }
    }
}