/**@typedef {("horizontal"|"vertical")} Direction */

class EditorWindowBase {
    myself = "";
    /**@type {EditorWindowFlex} */
    parent;
    percentWidth = 1;
    percentHeight = 1;

    MIN_WINDOW_SIZE = 0.1;

    id;

    lastScreenPos = {x1: 0, y1: 0, x2: 0, y2: 0}

    constructor(percentWidth, percentHeight) {
        this.percentWidth = percentWidth;
        this.percentHeight = percentHeight;
        this.id = UTILITY.generateCode(14);
    }

    /**
     * ONLY USED ON STARTUP. DONT EVER CALL THIS!
     */
    setParentInit(parent) {
        this.parent = parent;
    }

    resize(newPercentWidth, newPercentHeight) {
        if(newPercentWidth < this.MIN_WINDOW_SIZE || newPercentHeight < this.MIN_WINDOW_SIZE)
            return false;

        let oldX = this.percentWidth;
        let oldY = this.percentHeight;
        this.resizeWithoutNotify(newPercentWidth, newPercentHeight);
        let allowed = true;
        if(this.parent)
            allowed = this.parent.onResized(this, oldX - newPercentWidth, oldY -newPercentHeight);

        if(!allowed) {
            this.percentWidth = oldX;
            this.percentHeight = oldY;
            return false;
        }
        return true;
    }

    resizeWithoutNotify(newPercentWidth, newPercentHeight) {
        this.percentWidth = newPercentWidth;
        this.percentHeight = newPercentHeight;
    }

    isInsideLastScreenPos(x, y) {
        return UI_UTILITY.isInside(x, y, this.lastScreenPos.x1, this.lastScreenPos.y1, this.lastScreenPos.x2, this.lastScreenPos.y2);
    }
    
    /**
     * @returns {EditorWindowContainer}
     */
    getWindowContainerAtScreenPos(x, y) {}

    split(splitPercentWidth, splitPercentHeight, after, window) {
        console.log("desired split", splitPercentWidth, splitPercentHeight);
        console.log("current space size",this.percentWidth, this.percentHeight, this.id);
        let ogWidth = this.percentWidth;
        let ogHeight = this.percentHeight;
        console.log("new og size", splitPercentWidth * this.percentWidth, splitPercentHeight * this.percentHeight, this.id);
        this.resizeWithoutNotify(splitPercentWidth * this.percentWidth, splitPercentHeight * this.percentHeight);
        console.log("newWindowSize", ogWidth - (splitPercentWidth * this.percentWidth), ogHeight - (splitPercentHeight * this.percentHeight), window)
        if(this.parent)
            this.parent.onSplit(this, ogWidth - (this.percentWidth), ogHeight - (this.percentHeight), ogWidth, ogHeight, after, window);
    }

    collapse() {
        this.parent.onCollapse(this);
    }

    render(x1, y1, x2, y2, width, height) {
        this.lastScreenPos = {x1: x1, y1: y1, x2: x2, y2: y2};
    }

    print(depth = 0) {
        return `${space(depth)}${this.myself}: ${this.id} (${this.percentWidth}  ${this.percentHeight})`;

        function space(dep) {
            let b = "";
            for(let i = 0; i < dep; i++)
                b += "     ";
            return b;
        }
    }

    debugRender(x1, y1, x2, y2, width, height, depth, maxDepth) {}
}