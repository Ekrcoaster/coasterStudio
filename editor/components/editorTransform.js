class EditorTransformComponent extends EditorComponent {

    constructor(target) {
        super(target);
    }

    onRender(x1, y1, x2, y2, width, height) {
        let y = y1+10;
        /**@type {Transform} */
        let transform = this.target;

        transform.setLocalPosition(UI_WIDGET.editorGUIVector2(transform.gameObject.id + "pos", "Position", transform.localPosition, true, x1, y, x2, y+this.componentHeight*2));
        y += this.componentHeight*2 + this.componentMargin;

        transform.setLocalAngle(UI_WIDGET.editorGUINumber(transform.gameObject.id + "rot", "Rotation", transform.localAngle, true, x1, y, x2, y+this.componentHeight)?.text);
        y += this.componentHeight + this.componentMargin;

        transform.setLocalScale(UI_WIDGET.editorGUIVector2(transform.gameObject.id + "scale", "Scale", transform.localScale, true, x1, y, x2, y+this.componentHeight*2));
        y += this.componentHeight*2 + this.componentMargin;
    }

    calculateExpandedHeight() {
        return 10+this.calculateComponentHeightForExpandedHeight(3) + (this.componentHeight*2) +10;
    }

    /**
     * @param {Transform} transform 
     * @param {SceneRendererTools} tools
     * */
    onSceneRender(transform, tools) {
        if(transform.gameObject.id == editor.activeScene.header.id) return;
        tools.text(transform.gameObject.name, transform.getWorldPosition().x, transform.getWorldPosition().y, 1, 0, new DrawTextOption(25));
    }
}