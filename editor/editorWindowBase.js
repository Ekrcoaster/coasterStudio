class EditorWindowBase {
    myself = "";
    /**@type {EditorWindowFlex} */
    parent;
    percentWidth = 1;
    percentHeight = 1;

    MIN_WINDOW_SIZE = 0.1;

    id;

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

    split(splitPercentWidth, splitPercentHeight) {
        let ogWidth = this.percentWidth;
        let ogHeight = this.percentHeight;
        this.resizeWithoutNotify(splitPercentWidth * this.percentWidth, splitPercentHeight * this.percentHeight);

        if(this.parent)
            this.parent.onSplit(this, (1-splitPercentWidth) * ogWidth, (1-splitPercentHeight)* ogHeight);
    }

    render(x1, y1, x2, y2, width, height) {}
}