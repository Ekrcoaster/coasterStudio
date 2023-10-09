class ComponentAsset extends Asset {
    
    /**@param {GameObject} gameObject  */
    addComponent(gameObject) {}
    
    scriptName() {}
}

class InternalComponentAsset extends ComponentAsset {
    componentName;

    constructor(componentName) {
        super();
        this.componentName = componentName;
    }

    /**@param {GameObject} gameObject  */
    addComponent(gameObject) {
        let component = null;
        eval(`component = new ${this.componentName}()`);
        component.gameObject = gameObject;
        gameObject.addComponent(component);
    }
    
    scriptName() {
        return this.componentName;
    }
}