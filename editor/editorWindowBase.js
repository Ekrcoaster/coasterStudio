class EditorWindowBase {
    myself = "";
    /**@type {EditorWindowFlex} */
    parent;
    percentWidth = 1;
    percentHeight = 1;

    /**@type {Gizmo[]} */
    gizmos;

    constructor(percentWidth, percentHeight) {
        this.percentWidth = percentWidth;
        this.percentHeight = percentHeight;
        
        this.gizmos = [];
    }

    /**
     * ONLY USED ON STARTUP. DONT EVER CALL THIS!
     */
    setParentInit(parent) {
        this.parent = parent;
    }

    resize(newPercentWidth, newPercentHeight) {
        let oldX = this.percentWidth;
        let oldY = this.percentHeight;
        this.resizeWithoutNotify(newPercentWidth, newPercentHeight);
        if(this.parent)
            this.parent.onResized(this, oldX - newPercentWidth, oldY -newPercentHeight);
    }

    resizeWithoutNotify(newPercentWidth, newPercentHeight) {
        this.percentWidth = newPercentWidth;
        this.percentHeight = newPercentHeight;
    }

    /**
     * Adds a new gizmo to be rendered
     * @param {Gizmo} gizmo 
     * @returns 
     */
    registerGizmo(gizmo) {
        this.gizmos.push(gizmo);
        return gizmo;
    }

    split(splitPercentWidth, splitPercentHeight) {
        let ogWidth = this.percentWidth;
        let ogHeight = this.percentHeight;
        this.resizeWithoutNotify(splitPercentWidth * this.percentWidth, splitPercentHeight * this.percentHeight);

        if(this.parent)
            this.parent.onSplit(this, (1-splitPercentWidth) * ogWidth, (1-splitPercentHeight)* ogHeight);
    }

    render(x1, y1, x2, y2, width, height) {}
    renderGizmos(x1, y1, x2, y2) {
        this.gizmos.forEach(gizmo => {
            gizmo.render(gizmo.x1 + x1, gizmo.y1 + y1, gizmo.x2 + x2, gizmo.y2 + y2, gizmo.x2-gizmo.x1, gizmo.y2-gizmo.y1);
        });
    }
}