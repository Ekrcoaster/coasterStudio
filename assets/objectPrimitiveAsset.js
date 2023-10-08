class ObjectPrimitiveAsset extends Asset {
    /**
     * @callback ObjectPrimitiveAssetCreateCallback
     * @param {GameObject} obj
     */

    /**@type {ObjectPrimitiveAssetCreateCallback}*/
    onCreate;

    /**@param {ObjectPrimitiveAssetCreateCallback} onCreate */
    constructor(onCreate) {
        super();
        this.onCreate = onCreate;
    }

    /**@type {Scene} */
    createObject(scene) {
        let obj = new GameObject(scene, "New Object", false);
        this.onCreate(obj);
        return obj;
    }
}