class EditorWindowFlex extends EditorWindowBase {

    /**@type {EditorWindowBase[]} */
    windows = [];

    /**@type {Direction} */
    type = "";

    /**@param {Direction} insideDirection */
    constructor(percent, insideDirection) {
        super(percent, insideDirection);
        this.myself = "flex";
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

    onResized(child, change) {
        // first figure out what child we are
        let index = this.windows.indexOf(child);
        if(index == -1) return;

        // then if we are not the last child
        if(index < this.windows.length - 1) {
            let neighbor = this.windows[index+1];
            if(neighbor.percent + change < neighbor.MIN_WINDOW_SIZE) return false;
            neighbor.percent += change;
        }

        return true;
    }

    /**
     * 
     * @param {EditorWindowBase} child 
     * @param {Direction} direction 
     * @param {EditorWindow|EditorWindowBase} newWindow 
     */
    onSplit(child, percent, direction, insertNewWindowAfter, newWindow) {
        // first figure out what child we are
        let index = this.windows.indexOf(child);
        if(index == -1) return;

        // if we are splitting in the same direction as our parent, then just resize and insert into myself!
        if(this.insideDirection == direction) {
            let ogChild = child.percent
            child.percent = child.percent * percent;
            let window = this.registerWindowAtIndex(newWindow, index+(insertNewWindowAfter ? 1 : 0));
            window.percent = (1-percent) * ogChild;
        } else {
            // pluck the child out of the space
            this.windows.splice(index, 1);

            // create the new flex space
            let flex = this.registerFlexAtIndex(new EditorWindowFlex(child.percent, direction), index);
            child.percent = 0.5;
            flex.registerWindow(child);
            newWindow.percent = 0.5;
            flex.registerWindow(newWindow);
        }
    }

    /**
     * @param {EditorWindowBase} child 
     */
    onCollapse(child) {
        // first figure out what child we are
        let index = this.windows.indexOf(child);
        if(index == -1) return;

        let nextChild = index+1;
        // if there was no right sibling, then merge with the left sibling
        if(index+1 >= this.windows.length)
            nextChild = index-1;

        // if there is no left sibling, delete myself too
        if(index < 0 || this.windows[nextChild] == null) {
            // dont allow deleting myself if i have no parent
            if(this.parent == null) return;
            this.parent.onCollapse(this);
        } else {
            // otherwise, add our percentages
            this.windows[nextChild].percent += child.percent;
            this.windows.splice(index, 1);
        }

        editor.windowManager.flex.cleanFlexTree(null);
    }

    cleanFlexTree() {
        if(this.windows.length == 1 && this.windows[0] instanceof EditorWindowFlex) {
            let child = this.windows[0];
            this.percent = 1;
            this.insideDirection = child.insideDirection;
            this.windows = child.windows;
        } else {
            for(let i = 0; i < this.windows.length; i++) {
                if(this.windows[i] instanceof EditorWindowFlex)
                    this.windows[i].cleanFlexTree(this);
            }
        }
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
        if(this.insideDirection == "vertical") {
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
        if(this.insideDirection == "vertical") {
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
                (x2-x1), (y2-y1), window.getWidthPercent(), window.getHeightPercent());

            renderedSpaces.push(windowSpace);

            window.render(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2 - windowSpace.x1, windowSpace.y2 - windowSpace.y1);

            soFar.x += windowSpace.offsetX;
            soFar.y += windowSpace.offsetY;
        }

        // draw the resize handles
        for(let i = 0; i < this.windows.length-1; i++) {
            let space = renderedSpaces[i];

            if(this.insideDirection == "vertical" || this.windows[i].myself == "flex") {
                // handle resizing vertically
                let result = UI_WIDGET.windowResize("windowResizeX" + i + this.id, "x-axis", space.y2, space.x1, space.x2, y1, y2, space.y1);
                if(result.isDown) {
                    this.windows[i].resize(result.newPercent);
                }
            }
            
            if(this.insideDirection == "horizontal" || this.windows[i].myself == "flex") {
                // handle resizing horizntally
                let hresult = UI_WIDGET.windowResize("windowResizeY" + i + this.id, "y-axis", space.x2, space.y1, space.y2, x1, x2, space.x1);
                if(hresult.isDown) {
                    this.windows[i].resize(hresult.newPercent);
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

    print(depth = 0) {
        let builder = `${super.print(depth)} [${this.insideDirection}]\n`;

        for(let i = 0; i < this.windows.length; i++) {
            builder += this.windows[i].print(depth + 1) + "\n";
        }

        return builder;
    }

    debugRender(x1, y1, x2, y2, width, height, depth, maxDepth) {
        if(depth >= maxDepth) return;
        let color = new DrawShapeOption("#00000000","#2863ab42", 10);
        if(mouse.isHoveringOver(x1, y1, x2, y2))
            color = new DrawShapeOption("#2863ab42")
        if(this.insideDirection == "horizontal") {
            let avg = (y2+y1)/2;
            UI_LIBRARY.drawRectCoords(x1, avg-height/3, x2, avg+height/3, 0, color);
            UI_LIBRARY.drawText(this.id, x1, avg-height/3, x2, avg+height/3, new DrawTextOption(25, "default", "black", "center", "center"));
        }
        if(this.insideDirection == "vertical") {
            let avg = (x2+x1)/2;
            UI_LIBRARY.drawRectCoords(avg-width/3, y1, avg+width/3, y2, 0, color);
            UI_LIBRARY.drawText(this.id, x1, avg-height/3, x2, avg+height/3, new DrawTextOption(25, "default", "red", "center", "center"));
        }

        let soFar = { x: x1, y: y1 };
        for(let i = 0; i < this.windows.length; i++) {
            let window = this.windows[i];
            let windowSpace = this.calculatePercentSpace(soFar.x, soFar.y, x2, y2, 
                (x2-x1), (y2-y1), window.getWidthPercent(), window.getHeightPercent());

            window.debugRender(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2 - windowSpace.x1, windowSpace.y2 - windowSpace.y1, depth+1, maxDepth);

            soFar.x += windowSpace.offsetX;
            soFar.y += windowSpace.offsetY;
        }
    }
}