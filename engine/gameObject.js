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
        if(parent == this) return;

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

    setSiblingIndex(newIndex) {
        if(this.parent == null)
            this.scene._setRootChildSiblingIndex(this, newIndex);
        else    
            this.parent._setChildSiblingIndex(this, newIndex);
    }

    getSiblingIndex() {
        if(this.parent == null)
            return this.scene.rootGameObjects.indexOf(this)-1;
        else
            return this.parent.children.indexOf(this);
    }

    _registerChild(child) {
        let index = this.children.indexOf(child);
        if(index > -1) return false;
        this.children.push(child);
    }
    _unregisterChild(child) {
        let index = this.children.indexOf(child);
        if(index > -1) this.children.splice(index, 1);
    }

    /**
     * @param {GameObject} child 
     * @param {Number} index 
     */
    _setChildSiblingIndex(child, newIndex) {
        let index = this.children.indexOf(child);
        if(index == -1) return false;

        this.children.splice(index, 1);
        if(newIndex > index)
            newIndex--;

        this.children.splice(newIndex, 0, child);
    }
}