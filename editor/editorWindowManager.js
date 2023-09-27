class EditorWindowManager {

    /**@type {EditorWindowFlex} */
    flex;

    debugRender = false;
    debugRenderMaxDepth = -1;

    constructor() {
        this.flex = new EditorWindowFlex("row", 1, 1);
        this.debugRender = false;
        this.debugRenderMaxDepth = Infinity;
    }

    render(x1, y1, x2, y2) {
        this.flex.render(x1, y1, x2, y2, x2-x1, y2-y1);

        if(this.debugRender)
            this.flex.debugRender(x1, y1, x2, y2, x2-x1, y2-y1, 0, this.debugRenderMaxDepth);
    }

    getWindowContainerAtScreenPos(x, y) {
        return this.flex.getWindowContainerAtScreenPos(x, y);
    }

    print() {
        console.log(this.flex.print(0));
    }
}
