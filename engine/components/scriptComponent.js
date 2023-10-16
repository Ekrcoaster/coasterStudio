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

    setScript(script, cameFromUpdate = false) {
        if(script == this.script && !cameFromUpdate) return;
        const t = this;
        if(this.script != null) {
            if(!cameFromUpdate)
                this.script.removeNotifyOnChangeListener(onUpdate);
        }
        this.script = script;
        if(!cameFromUpdate)
            this.script.addNotifyOnChangeListener(onUpdate);

        this.instance = null;
        try {
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
        } catch (e){
            console.error("Compiler error for script " + this.script.name, e);
        }
        

        function onUpdate() {
            t.setScript(t.script, true);
        }
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
        if(this.instance == null) return;
        this.instance.onWeakStart();
    }

    onStart() {
        if(this.instance == null) return;
        this.instance.onStart();
    }

    onUpdate() {
        if(this.script == null) return;
        if(this.instance == null) return;
        this.instance.onUpdate();
    }

    saveSerialize() {
        let instFields = {};

        for(let i = 0; i < this.instanceFields.length; i++)
            instFields[this.instanceFields[i]] = this.instance[this.instanceFields[i]];

        return {
            ...super.saveSerialize(),
            script: this.script?.path,
            instFields: instFields
        }

        return temp;
    }

    loadSerialize(data) {
        super.loadSerialize(data);
        this.setScript(assets.getAsset(data.script));

        for(let name in data.instFields) {
            this.instance[name] = data.instFields[name];
        }
    }
}