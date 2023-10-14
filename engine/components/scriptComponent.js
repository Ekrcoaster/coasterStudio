class Script extends Component {

    /**@type {ScriptAsset} */
    script;

    /**@type {Component} */
    instance;

    constructor(gameObject) {
        super("Script", gameObject);
        this.script = null;
    }

    setScript(script) {
        this.script = script;
    }

    onWeakStart() {
        this.instance = null;
        eval(this.script.code + `; this.instance = new ${this.script.codeClassName}();`);
        this.instance.gameObject = this.gameObject;
        this.instance.transform = this.transform;
        this.instance.onWeakStart();
    }

    onStart() {
        this.instance.onStart();
    }

    onUpdate() {
        if(this.script == null) return;
        this.instance.onUpdate();
    }
}