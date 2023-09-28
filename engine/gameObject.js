class GameObject {
    id = "";
    name = "";

    /**@type {Scene} */
    scene;

    /**@type {GameObject} */
    parent;

    /**@type {GameObject[]} */
    children = [];

    constructor(scene, name) {
        this.scene = scene;
        this.id = UTILITY.generateCode(14);
        this.name = name;
        this.parent = null;
        this.children = [];
        this.scene._registerRootGameObject(this);
    }

    /**
     * 
     * @param {GameObject} parent 
     */
    setParent(parent) {
        if(parent != this.parent) {
            if(this.parent == null)
                this.scene._unregisterRootGameObject(this);
            else
                this.parent._unregisterChild(this);
        }
        
        this.parent = parent;
        if(parent == null)
            this.scene._registerRootGameObject(this);
        else
            this.parent._registerChild(this);
        return this;
    }

    _registerChild(child) {
        this.children.push(child);
    }
    _unregisterChild(child) {
        let index = this.children.indexOf(child);
        if(index > -1) this.children.splice(index, 1);
    }
}