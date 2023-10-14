class ScriptAsset extends Asset {
    /**@type {String} */
    code;
    codeClassName;
    constructor(code) {
        super();
        this.code = code;
        this.codeClassName = code.split(" ")[2];
        console.log("code", code, this.codeClassName)
    }
}