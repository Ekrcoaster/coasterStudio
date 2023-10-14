class Component {
    
    /**@type {String} */
    name;

    id;

    /**@type {GameObject} */
    gameObject;

    /**@type {Transform} */
    transform;

    constructor(name, gameObject) {
        this.id = UTILITY.generateCode(32);
        this.name = name;
        this.gameObject = gameObject;
    }

    onCreated() {}

    onWeakStart() {}
    onStart() {}

    onUpdate() {}

    /**@param {SceneRendererTools} tools  */
    onGizmosSelected(tools) {}
}