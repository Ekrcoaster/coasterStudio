class EditorWindowContainer extends EditorWindowBase {

    /**@type {EditorWindow[]} */
    windows = [];

    activeWindowIndex = 0;

    /**@type {EditorWindow} */
    newWindowHoveringOverMe;

    constructor(percentWidth, percentHeight) {
        super(percentWidth, percentHeight);
        this.myself = "window";
        this.windows = [];
        this.activeWindowIndex = 0;
    }

    /**
     * @param {EditorWindow} window 
     */
    registerWindow(window) {
        window.initSetContainer(this);
        this.windows.push(window);
        return this;
    }

    /**
     * @param {EditorWindow} window 
     * @returns if it worked
     */
    unregisterWindow(window) {
        let index = this.windows.indexOf(window);
        if(index == -1) return false;
        this.windows.splice(index, 1);
        window.initSetContainer(null);
        return true;
    }

    render(x1, y1, x2, y2, width, height) {
        super.render(x1, y1, x2, y2, width, height);
        let windowSpace = calculateWindowSpace(x1, y1, x2, y2);

        if(this.activeWindowIndex >= this.windows.length)
            this.activeWindowIndex = this.windows.length - 1;


        let headerHeight = 40;
        windowSpace.y1 += headerHeight;

        let headerPadding = {
            top: 5,
            bottom: 5
        }

        const t = this;
        let toSelect = this.activeWindowIndex;
        let startDragging = -1;

        // draw the other non active tabs
        drawTabs(false);

        let windowToDraw = this.activeWindowIndex;
        if(mouse.mouseDrag?.id == this.id + windowToDraw) {
            windowToDraw++;
        }
        
        if(windowToDraw < this.windows.length && windowToDraw > -1)
            this.windows[windowToDraw].render(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2- windowSpace.x1, windowSpace.y2 - windowSpace.y1);
        
        drawTabs(true);

        this.activeWindowIndex = toSelect;

        if(startDragging > -1 && mouse.mouseDrag == null)
            createWindowDrag(startDragging);

        this.newWindowHoveringOverMe = null;

        function drawTabs(active) {
            let offset = 3;
            for(let i = 0; i < t.windows.length; i++) {
                if(mouse.mouseDrag?.id == t.id + i) continue;
                let result = UI_WIDGET.windowTabLabel("tabLabel " + t.id + i, t.windows[i].name, x1 + offset, y1 + headerPadding.top, y1+headerHeight-headerPadding.bottom, i == t.activeWindowIndex ? "active" : "notActive");
                offset += result.myLength + 15;
                
                if(active && i != t.activeWindowIndex) continue;
                if(!active && i == t.activeWindowIndex) continue;
                //console.log(mouse.mouseDrag?.data?.id, t.id + i, mouse.mouseDrag?.data?.id == t.id + i)

                result.render();

                if(result.setActive)
                    toSelect = i;
                if(result.downDistance > 5 && result.hover)
                    startDragging = i;
            }

            if(!active && t.newWindowHoveringOverMe != null) {
                let result = UI_WIDGET.windowTabLabel("tabLabel " + t.id + 99999, t.newWindowHoveringOverMe.name, x1 + offset, y1 + headerPadding.top, y1+headerHeight-headerPadding.bottom, "potential");
                result.render();
            }
        }
        
        function calculateWindowSpace(x1, y1, x2, y2) {
            return {
                x1: x1+3,
                y1: y1,
                x2: x2-3,
                y2: y2-3
            }
        }

        function createWindowDrag(index) {
            mouse.startDragging(new MouseDrag(t.id + startDragging, (x, y, d, id) => {
                let res = UI_WIDGET.windowTabLabel("tabLabel " + id, d.name, x, y, y+d.height, "active");

                let windowX2 = x + d.ogWindowWidth;
                if(windowX2 > canvas.width)
                    windowX2 += canvas.width - windowX2;

                let windowY2 = y+headerHeight+d.ogWindowHeight;
                if(windowY2 > canvas.height)
                    windowY2 += canvas.height - windowY2;

                let tempWindowSpace = calculateWindowSpace(x-3, y+headerHeight, windowX2, windowY2);
                t.windows[d.index].render(tempWindowSpace.x1, tempWindowSpace.y1, tempWindowSpace.x2, tempWindowSpace.y2, tempWindowSpace.x2- tempWindowSpace.x1, tempWindowSpace.y2 - tempWindowSpace.y1);
                res.render();

                // tell the current hovering window that its being hovered
                let hoverOverWindow = editor.windowManager.getWindowContainerAtScreenPos(x, y);
                if(hoverOverWindow != null) hoverOverWindow.newWindowHoveringOverMe = t.windows[d.index];
                
            }, (x, y, d) => {
                let hoverOverWindow = editor.windowManager.getWindowContainerAtScreenPos(x, y);
                if(hoverOverWindow == null) return;
                let window = t.windows[d.index];
                t.unregisterWindow(t.windows[d.index]);
                hoverOverWindow.windowDroppedOnMe(x, y, window);
            }, {
                active: index == t.activeWindowIndex,
                name: t.windows[index].name,
                height: headerHeight-headerPadding.bottom,
                index: index,
                ogWindowWidth: windowSpace.x2 - windowSpace.x1,
                ogWindowHeight: windowSpace.y2 - windowSpace.y1
            }));
        }
    }

    /**
     * @returns {EditorWindowContainer}
     */
    getWindowContainerAtScreenPos(x, y) {
        if(this.isInsideLastScreenPos(x, y))
            return this;
        return null;
    }

    clone() {
        return new EditorWindowContainer(this.percentWidth, this.percentHeight);
    }

    windowDroppedOnMe(x, y, window) {
        this.newWindowHoveringOverMe = null;
        this.activeWindowIndex = this.windows.length;
        this.registerWindow(window);
    }
}