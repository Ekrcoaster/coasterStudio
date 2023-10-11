class GameObject {
    id = "";
    name = "";
    isActive;
    activeInHierarchy;

    /**@type {Scene} */
    scene;

    /**@type {GameObject} */
    parent;

    /**@type {GameObject[]} */
    children = [];

    /**@type {Component[]} */
    components = [];

    /**@type {Transform} */
    transform;

    isHeader;

    constructor(scene, name, isHeader = false) {
        this.isHeader = isHeader;
        this.scene = scene;
        this.id = UTILITY.generateCode(14);
        this.name = name;
        this.isActive = true;
        this.activeInHierarchy = true;
        this.parent = null;
        this.children = [];
        this.scene._registerRootGameObject(this);
        this.components = [];

        this.transform = new Transform(this);
        this.addComponent(this.transform);
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

        // calculate if active in hierarchy
        this._updateActiveInHierarchy(this.parent == null ? true : this.parent.activeInHierarchy);

        return this;
    }

    setActive(active) {
        if(active == this.isActive) return;
        this.isActive = active;

        // calculate if active in hierarchy
        this._updateActiveInHierarchy(this.parent == null ? true : this.parent.activeInHierarchy);
    }

    _updateActiveInHierarchy(parentActive) {
        this.activeInHierarchy = parentActive && this.isActive;
        for(let i = 0; i < this.children.length; i++)
            this.children[i]._updateActiveInHierarchy(this.activeInHierarchy);
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

    /**@param {Component} component*/
    addComponent(component) {
        let index = this.components.indexOf(component);
        if(index > -1) return;

        component.gameObject = this;
        component.transform  = this.transform;
        this.components.push(component);

        // one day remove all references to the editor from the engine!
        if(window.editor != null)
            editor.createEditorComponent(component);
    }

    /**@param {Component} component*/
    removeComponent(component) {
        let index = this.components.indexOf(component);
        if(index > -1)
            this.components.splice(index, 1);
        component.gameObject = null;

        // one day remove all references to the editor from the engine!
        if(window.editor != null)
            editor.removeEditorComponent(component);
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

    findByType(type) {
        for(let i = 0; i < this.components.length; i++) {
            if(this.components[i] instanceof type)
                return this.components[i];
        }

        for(let i = 0; i < this.children.length; i++) {
            let res = this.children[i].findByType(type);
            if(res)
                return res;
        }
        return null;
    }
}