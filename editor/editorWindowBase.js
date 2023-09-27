/**@typedef {("horizontal"|"vertical")} Direction */

class EditorWindowBase {
    myself = "";
    /**@type {EditorWindowFlex} */
    parent;
    percent = 1;
    /**@type {Direction} */
    insideDirection = "horizontal";

    MIN_WINDOW_SIZE = 0.1;

    id;

    lastScreenPos = {x1: 0, y1: 0, x2: 0, y2: 0}

    /**@param {Direction} insideDirection */
    constructor(percent, insideDirection) {
        this.percent = percent;
        this.insideDirection = insideDirection;
        this.id = UTILITY.generateCode(14);
    }

    /**
     * ONLY USED ON STARTUP. DONT EVER CALL THIS!
     */
    setParentInit(parent) {
        this.parent = parent;
    }

    resize(newPercent) {
        if(newPercent < this.MIN_WINDOW_SIZE) return false;

        let old = this.percent;
        this.percent = newPercent;
        
        // now, tell the parent we resized so we can adjust our siblings
        let allowed = true;
        if(this.parent)
            allowed = this.parent.onResized(this, old - this.percent);

        // if that failed, cancel
        if(!allowed) {
            this.percent = old;
            return false;
        }
        
        return true;
    }
    
    isInsideLastScreenPos(x, y) {
        return UI_UTILITY.isInside(x, y, this.lastScreenPos.x1, this.lastScreenPos.y1, this.lastScreenPos.x2, this.lastScreenPos.y2);
    }
    
    /**
     * @returns {EditorWindowContainer}
     */
    getWindowContainerAtScreenPos(x, y) {}

    /**@param {Direction} direction */
    split(percent, direction, insertWindowAfter, window) {
        this.parent.onSplit(this, percent, direction, insertWindowAfter, window);
    }

    collapse() {
        this.parent.onCollapse(this);
    }

    render(x1, y1, x2, y2, width, height) {
        this.lastScreenPos = {x1: x1, y1: y1, x2: x2, y2: y2};
    }

    print(depth = 0) {
        return `${space(depth)}${this.myself}: ${this.id} (${this.getWidthPercent()}  ${this.getHeightPercent()})`;

        function space(dep) {
            let b = "";
            for(let i = 0; i < dep; i++)
                b += "     ";
            return b;
        }
    }

    debugRender(x1, y1, x2, y2, width, height, depth, maxDepth) {}

    getWidthPercent() {
        if(this.getParentDirection() == "horizontal")
            return this.percent;
        return 1;
    }
    getHeightPercent() {
        if(this.getParentDirection() == "vertical")
            return this.percent;
        return 1;
    }
    /**@returns {Direction} */
    getParentDirection() {
        if(this.parent == null) return "vertical";
        return this.parent.insideDirection;
    }
}