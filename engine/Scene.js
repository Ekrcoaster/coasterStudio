class Scene {
    id = "";
    name = "";

    /**@type {GameObject} */
    header;
    
    /**@type {GameObject[]} */
    rootGameObjects = [];

    constructor(name) {
        this.id = UTILITY.generateCode(14);
        this.name = name;

        this.rootGameObjects = [];

        this.header = new GameObject(this, this.name, true);
        this.header.transform.isHeader = false;
    }
    
    _registerRootGameObject(obj) {
        let index = this.rootGameObjects.indexOf(obj);
        if(index > -1) return false;
        this.rootGameObjects.push(obj);
    }

    _unregisterRootGameObject(obj) {
        let index = this.rootGameObjects.indexOf(obj);
        if(index > -1) this.rootGameObjects.splice(index, 1);
    }
    /**
     * @param {GameObject} child 
     * @param {Number} index 
     */
    _setRootChildSiblingIndex(child, newIndex) {
        let index = this.rootGameObjects.indexOf(child);
        if(index == -1) return false;
        
        this.rootGameObjects.splice(index, 1);
        if(newIndex > index)
            newIndex--;

        this.rootGameObjects.splice(newIndex, 0, child);
    }
}