class EditorShapeRenderer extends EditorComponent {
    constructor(target) {
        super(target);
    }

    /**@param {Transform} transform @param {SceneRendererTools} tools */
    onSceneRender(transform, tools) {
        /**@type {ShapeRenderer} */
        let myself = this.target;
        myself.renderShape(tools);
    }
}