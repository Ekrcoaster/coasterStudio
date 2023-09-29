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

        this.header = new GameObject(this, this.name);
    }
    
    _registerRootGameObject(obj) {
        this.rootGameObjects.push(obj);
    }

    _unregisterRootGameObject(obj) {
        let index = this.rootGameObjects.indexOf(obj);
        if(index > -1) this.rootGameObjects.splice(index, 1);
    }
}