class Scene {
    id = "";
    name = "";

    /**@type {GameObject} */
    header;
    
    /**@type {GameObject[]} */
    rootGameObjects = [];

    /**@type {Camera} */
    activeCamera;

    /**@type {SceneController} */
    controller;

    /**@type {Component[]} */
    allComponentsRuntime;

    constructor(name) {
        this.id = UTILITY.generateCode(14);
        this.name = name;

        this.rootGameObjects = [];

        this.header = new GameObject(this, this.name, true);
        this.header.transform.isHeader = false;
        this.controller = this.header.addComponent(new SceneController(this.header));

        this.setupDefaultObjects();
        this.updateActiveCamera();
    }

    init() {
        this.allComponentsRuntime = [];
        const t = this;

        for(let i = 0; i < this.rootGameObjects.length; i++)
            addCompoments(this.rootGameObjects[i]);

        
        for(let i = 0; i < this.allComponentsRuntime.length; i++)
            this.allComponentsRuntime[i].onStart();

        /** go through and add all components
         * @param {GameObject} obj  */
        function addCompoments(obj) {
            // add my components
            for(let i = 0; i < obj.components.length; i++) {
                t.allComponentsRuntime.push(obj.components[i]);
                obj.components[i].onWeakStart();
            }

            // now recurse deeper
            for(let i = 0; i < obj.children.length; i++)
                addCompoments(obj.children[i]);
        }
    }

    onUpdate() {
        for(let i = 0; i < this.allComponentsRuntime.length; i++) {
            if(this.allComponentsRuntime[i].gameObject.activeInHierarchy)
                this.allComponentsRuntime[i].onUpdate();
        }
    }

    setupDefaultObjects() {
        let obj = new GameObject(this, "Object 1");
        obj.transform.setLocalAngle(45);
        obj.addComponent(new ShapeRenderer(obj));
        let obj3 = new GameObject(this, "Object 2").setParent(obj);
        obj3.transform.setLocalPosition(new Vector2(5, 2));
        obj3.addComponent(new ShapeRenderer(obj));
        let t = new GameObject(this, "Object 3").setParent(obj3);
        t.transform.setLocalPosition(new Vector2(0, -4));
        t.addComponent(new ShapeRenderer(obj));
        let t2 = new GameObject(this, "Object 4").setParent(t);
        t2.transform.setLocalPosition(new Vector2(0, -4));
        t2.transform.setLocalAngle(-45);
        t2.addComponent(new ShapeRenderer(obj));
    
        editor.setSelected(obj, true);
        
        let camera = new GameObject(this, "Camera");
        camera.addComponent(new Camera(camera));
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

    findGameObjectByType(type) {
       return this.findGameObjectComponentByType(type)?.gameObject;
    }

    findGameObjectComponentByType(type) {
        for(let i = 0; i < this.rootGameObjects.length; i++) {
            let res = this.rootGameObjects[i].findByType(type);
            if(res)
                return res;
        }
        return null;
    }

    updateActiveCamera() {
        this.activeCamera = this.findGameObjectComponentByType(Camera);
    }
}