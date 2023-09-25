class EditorWindowManager {

    /**@type {EditorWindowFlex} */
    span;

    constructor() {
        this.span = new EditorWindowFlex("row");
    }

    render(x1, y1, x2, y2) {
        this.span.render(x1, y1, x2, y2);
    }

    getWindowContainerAtScreenPos(x, y) {
        return this.span.getWindowContainerAtScreenPos(x, y);
    }
}

class EditorWindowFlex extends EditorWindowBase {

    /**@type {EditorWindowBase[]} */
    windows = [];

    /**@type {("row"|"col")} */
    type = "";

    /**@param {("row"|"col")} type */
    constructor(type, percentWidth, percentHeight) {
        super(percentWidth, percentHeight);
        this.myself = "flex";
        this.type = type;
        this.windows = [];
    }

    /**
     * @param {EditorWindowContainer} window 
     * @returns EditorWindowContainer
     */
    registerWindow(window) {
        return this.registerWindowAtIndex(window, this.windows.length);
    }

    /**
     * @param {EditorWindowContainer} window 
     * @returns EditorWindowContainer
     */
    registerWindowAtIndex(window, index) {
        window.setParentInit(this);
        if(index == this.windows.length)
            this.windows.push(window);
        else
            this.windows.splice(index, 0, window);
        return window;
    }

    /**
     * @param {EditorWindowFlex} flex 
     * @returns EditorWindowFlex
     */
    registerFlex(flex) {
        return this.registerFlexAtIndex(flex, this.windows.length);
    }
    /**
     * @param {EditorWindowFlex} flex 
     * @returns EditorWindowFlex
     */
    registerFlexAtIndex(flex, index) {
        flex.setParentInit(this);
        if(index == this.windows.length)
            this.windows.push(flex);
        else
            this.windows.splice(index, 0, flex);
        return flex;
    }

    onResized(child, changeX, changeY) {
        // first figure out what child we are
        let index = this.windows.indexOf(child);
        if(index == -1) return;

        // then if we are not the last child
        if(index < this.windows.length - 1) {
            let neighbor = this.windows[index+1];
            if((this.type == "col" && neighbor.percentWidth + changeX < neighbor.MIN_WINDOW_SIZE) || (this.type == "row" && neighbor.percentHeight + changeY < neighbor.MIN_WINDOW_SIZE)) return false;
            neighbor.resizeWithoutNotify(neighbor.percentWidth + changeX, neighbor.percentHeight + changeY);

            if(this.type == "col") {

                // if the y was changed, we gotta resize the parent!
                if(changeY != 0)
                    this.resize(0, changeY);
            } 
            else if(this.type == "row") {

                // if the y was changed, we gotta resize the parent!
                if(changeX != 0)
                    this.resize(changeX, 0);
            }
        }
        return true;
    }

    onSplit(child, splitX, splitY) {
        // first figure out what child we are
        let index = this.windows.indexOf(child);
        if(index == -1) return;

        console.log(this.type, splitX, splitY);
        if((this.type == "col" && splitY == 0) || (this.type == "row" && splitX == 0)) {
            let window = this.registerWindowAtIndex(this.windows[index].clone(), index+1);
            window.percentWidth = splitX;
            window.percentHeight = splitY;
        } else {
            let myWindow = this.windows[index];
            this.windows.splice(index, 1);
            let flex = this.registerFlexAtIndex(new EditorWindowFlex(this.type == "row" ? "col" : "row", child.percentWidth, child.percentHeight), index);
            flex.registerWindow(myWindow);
            flex.registerWindow(myWindow.clone());
        }


        this.windows
    }

    calculateFlexSpace(ax1, ay1, ax2, ay2, individualSpaceX, individualSpaceY) {
        let space = {
            x1: ax1,
            y1: ay1,
            x2: ax1 + individualSpaceX,
            y2: ay2,
            offsetX: individualSpaceX,
            offsetY: 0
        }

        // modify if row
        if(this.type == "row") {
            space.x2 = ax2;
            space.y2 = ay1 + individualSpaceY;
            space.offsetX = 0;
            space.offsetY = individualSpaceY;
        }

        return space;
    }
    calculatePercentSpace(ax1, ay1, ax2, ay2, totalWidth, totalHeight, windowPercentWidth, windowPercentHeight) {
        let space = {
            x1: ax1,
            y1: ay1,
            x2: ax1 + totalWidth * windowPercentWidth,
            y2: ay2,
            offsetX: totalWidth * windowPercentWidth,
            offsetY: 0
        }

        // modify if row
        if(this.type == "row") {
            space.x2 = ax2;
            space.y2 = ay1 + totalHeight * windowPercentHeight;
            space.offsetX = 0;
            space.offsetY = totalHeight * windowPercentHeight;
        }

        return space;
    }

    render(x1, y1, x2, y2, width, height) {
        super.render(x1, y1, x2, y2, width, height);
        let soFar = { x: x1, y: y1 };

        let renderedSpaces = [];
        for (let i = 0; i < this.windows.length; i++) {
            let window = this.windows[i];

            let windowSpace = this.calculatePercentSpace(soFar.x, soFar.y, x2, y2, 
                (x2-x1), (y2-y1), window.percentWidth, window.percentHeight);

            renderedSpaces.push(windowSpace);

            window.render(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2 - windowSpace.x1, windowSpace.y2 - windowSpace.x1);

            soFar.x += windowSpace.offsetX;
            soFar.y += windowSpace.offsetY;
        }

        for(let i = 0; i < this.windows.length-1; i++) {
            let space = renderedSpaces[i];

            if(this.type == "row" || this.windows[i].myself == "flex") {
                // handle resizing vertically
                let result = UI_WIDGET.windowResize("windowResizeX" + i + this.id, "x-axis", space.y2, space.x1, space.x2, y1, y2, space.y1);
                if(result.isDown) {
                    this.windows[i].resize(1, result.newPercent);
                }
            }
            
            if(this.type == "col" || this.windows[i].myself == "flex") {
                // handle resizing horizntally
                let hresult = UI_WIDGET.windowResize("windowResizeY" + i + this.id, "y-axis", space.x2, space.y1, space.y2, x1, x2, space.x1);
                if(hresult.isDown) {
                    this.windows[i].resize(hresult.newPercent, 1);
                }
            }
        }
    }

    /**
     * @returns {EditorWindowContainer}
     */
    getWindowContainerAtScreenPos(x, y) {
        if(!this.isInsideLastScreenPos(x, y))
            return null;
        let result = null;
        for(let i = 0; i < this.windows.length; i++) {
            let r = this.windows[i].getWindowContainerAtScreenPos(x, y);
            if(r != null)
                result = r;
        }
        return result;
    }
}