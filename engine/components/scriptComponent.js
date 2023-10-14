class Script extends Component {

    /**@type {ScriptAsset} */
    script;

    /**@type {Component} */
    instance;

    instanceFields = [];

    constructor(gameObject) {
        super("Script", gameObject);
        this.script = null;
    }

    setScript(script) {
        if(script == this.script) return;
        this.script = script;

        this.instance = null;
        eval(this.script.code + `; this.instance = new ${this.script.codeClassName}();`);
        this.instance.gameObject = this.gameObject;
        this.instance.transform = this.transform;

        let normalFields = Object.keys(new Component());
        this.instanceFields = Object.keys(this.instance);

        for(let i = 0; i < normalFields.length; i++) {
            this.instanceFields.splice(this.instanceFields.indexOf(normalFields[i]), 1);
        }

        if(window.editor != null)
            editor.allComponentsCache[this.id].updateLayout();
    }

    /**@return {("number"|"string")} */
    getInstanceFieldType(label) {
        let val = this.instance[label];

        let custom = this.script.discoveredCustomTypes[label];
        if(custom == "Number") return "number";
        if(custom == "String") return "string";

        switch(typeof(val)) {
            case "number":
                return "number";
        }

        return "string";
    } 

    onWeakStart() {
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