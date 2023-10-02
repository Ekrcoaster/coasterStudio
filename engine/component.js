class Component {
    
    /**@type {String} */
    name;

    id;

    /**@type {GameObject} */
    gameObject;

    /**@type {Transform} */
    transform;

    constructor(name) {
        this.id = UTILITY.generateCode(32);
        this.name = name;
    }

    onAwake() {}
    onStart() {}

    onUpdate() {}
}