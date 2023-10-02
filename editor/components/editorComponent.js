class EditorComponent {
    /**@type {Component} */
    target;
    isExpanded = true;

    componentHeight = 30;
    componentMargin = 15;

    constructor(target) {
        this.target = target;
        this.isExpanded = true;
        this.componentHeight = 30;
        this.componentMargin = 15;
    }

    onRender(x1, y1, x2, y2, width, height) {}

    /**
     * @param {Transform} transform 
     * @param {SceneRendererTools} tools
     * */
    onSceneRender(transform, tools) {}

    /**
     * @param {Transform} transform 
     * @param {SceneRendererTools} tools
     * */
    onSelectedSceneRender(transform, tools) {}
    
    calculateExpandedHeight() {
        return 0;
    }

    calculateComponentHeightForExpandedHeight(numOfComponents) {
        return numOfComponents * this.componentHeight + (numOfComponents * this.componentMargin);
    }
}