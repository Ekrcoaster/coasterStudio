class EditorWindowContainer extends EditorWindowBase {

    /**@type {EditorWindow[]} */
    windows = [];

    activeWindowIndex = 0;

    constructor(percentWidth, percentHeight) {
        super(percentWidth, percentHeight);
        this.myself = "window";
        this.windows = [];
        this.activeWindowIndex = 0;
    }

    registerWindow(window) {
        window.initSetContainer(this);
        this.windows.push(window);
        return this;
    }

    render(x1, y1, x2, y2, width, height) {
        let windowSpace = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        }

        let headerHeight = 40;
        windowSpace.y1 += headerHeight;

        let headerPadding = {
            top: 5,
            bottom: 5
        }
        
        let offset = 3;
        for(let i = 0; i < this.windows.length; i++) {

            let result = UI_WIDGET.windowTabLabel("tabLabel " + this.id + i, this.windows[i].name, x1 + offset, y1 + headerPadding.top, y1+headerHeight-headerPadding.bottom, i == this.activeWindowIndex);
            offset += result.myLength + 10;
            if(result.isDown)
                this.activeWindowIndex = i;
        }

        if(this.activeWindowIndex < this.windows.length)
            this.windows[this.activeWindowIndex].render(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2- windowSpace.x1, windowSpace.y2 - windowSpace.y1);
    }

    clone() {
        return new EditorWindowContainer(this.percentWidth, this.percentHeight);
    }
}