class Scene {
    id = "";
    name = "";
    
    /**@type {GameObject[]} */
    rootGameObjects = [];

    constructor(name) {
        this.id = UTILITY.generateCode(14);
        this.name = name;

        this.rootGameObjects = [];
    }
    
    _registerRootGameObject(obj) {
        this.rootGameObjects.push(obj);
    }

    _unregisterRootGameObject(obj) {
        let index = this.rootGameObjects.indexOf(obj);
        if(index > -1) this.rootGameObjects.splice(index, 1);
    }
}