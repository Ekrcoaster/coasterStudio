class EditorWindowContainer extends EditorWindowBase {

    /**@type {EditorWindow[]} */
    windows = [];

    activeWindowIndex = 0;

    /**@type {EditorWindow} */
    newWindowHoveringOverMe;

    /**@type {{x1: 0, y1: 0, x2: 0, y2: 0}[]} */
    cacheWindowTabPositions = [];

    headerHeight = 40;
    headerPadding = {
        top: 5,
        bottom: 5,
        tabStartingOffset: 3,
        tabSpacing: 15
    }

    constructor(percentWidth, percentHeight) {
        super(percentWidth, percentHeight);
        this.myself = "window";
        this.windows = [];
        this.activeWindowIndex = 0;
    }

    /**
     * @param {EditorWindow} window 
     */
    registerWindow(window, index = -1) {
        window.initSetContainer(this);
        if(index == -1)
            this.windows.push(window);
        else
            this.windows.splice(index, 0, window);
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

    /**
     *  This will render the container and the active window inside of it.
     * 
     *  It will ALSO render the hovering window if it was created from myself
     */
    render(x1, y1, x2, y2, width, height) {
        super.render(x1, y1, x2, y2, width, height);
        // storing this so future functions can use myself
        const t = this;

        // ensure we don't draw any windows outside of the range
        if(this.activeWindowIndex >= this.windows.length)
            this.activeWindowIndex = this.windows.length - 1;

        // calculate the window space
        let windowSpace = calculateWindowSpace(x1, y1, x2, y2);

        // make sure the window won't overlap with the header
        windowSpace.y1 += t.headerHeight;

        // actions
        let toSelect = this.activeWindowIndex;
        let startDragging = -1;

        // draw the other non active tabs
        drawTabs(false, this.calculateWindowDropIndex(mouse.x || 0));

        // figure out what the active window to draw is
        let windowToDraw = this.activeWindowIndex;
        // if the active window happens to be the window that I'm dragging, then draw the next window
        if(mouse.mouseDrag?.id == this.id + windowToDraw) {
            windowToDraw++;
        }
        
        // draw the active window
        if(windowToDraw < this.windows.length && windowToDraw > -1)
            this.windows[windowToDraw].render(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2- windowSpace.x1, windowSpace.y2 - windowSpace.y1);
        
        // draw the ACTIVE tab
        drawTabs(true);

        // set the selected tab
        this.activeWindowIndex = toSelect;

        // create the drawing
        if(startDragging > -1 && mouse.mouseDrag == null)
            createWindowDrag(startDragging);

        // reset any hovering windows
        this.newWindowHoveringOverMe = null;

        /**
         * This will calculate the spacing for the tabs on the header, then provides a method to draw the tab.
         * It is done this way because we don't know the size of the window, (its based on the length of text), we can't draw tabs individually
         * So, go through all of the windows inside myself and draw them
         * 
         * @param {boolean} active should i only draw the active tabs or the non active tabs?
         */
        function drawTabs(active, insertIndex = -1) {
            let offset = t.headerPadding.tabStartingOffset;
            t.cacheWindowTabPositions = [];
            for(let i = 0; i < t.windows.length; i++) {

                let tabState = "active";
                if(i != t.activeWindowIndex)
                    tabState = "notActive";

                if(mouse.mouseDrag?.id == t.id + i)
                    tabState = "moving";
                

                // if there is a window being dragged and it is going to be inserted, then draw the insert
                if(!active && t.newWindowHoveringOverMe != null && i-1 == insertIndex) {
                    offset += 5;
                    UI_LIBRARY.drawRectCoords(offset, y1 + t.headerPadding.top, offset+5, y1+t.headerHeight-t.headerPadding.bottom, 0, COLORS.windowTabInsert);
                    offset += 15;
                }

                // calculate the tab and add the offset based on the length 
                let result = UI_WIDGET.windowTabLabel("tabLabel " + t.id + i, t.windows[i].name, x1 + offset, y1 + t.headerPadding.top, y1+t.headerHeight-t.headerPadding.bottom, tabState);
                t.cacheWindowTabPositions.push({
                    x1: offset, y1: 
                    y1 + t.headerPadding.top,
                    x2: offset+result.myLength,
                    y2: y1+t.headerHeight-t.headerPadding.bottom
                });
                offset += result.myLength + t.headerPadding.tabSpacing;

                
                // then, only draw the tabs that we wanna draw
                if(active && i != t.activeWindowIndex) continue;
                if(!active && i == t.activeWindowIndex) continue;

                result.render();

                // then hook up the actions
                if(result.setActive)
                    toSelect = i;
                if(result.downDistance > 5 && result.hover)
                    startDragging = i;
            }

            // finally, if we are not drawing active tabs (drawing in the background) and theres a window hovering over me, draw the hovering tab
            if(!active && t.newWindowHoveringOverMe != null) {
                if(insertIndex >= t.windows.length - 1) {
                    let result = UI_WIDGET.windowTabLabel("tabLabel " + t.id + 99999, t.newWindowHoveringOverMe.name, x1 + offset, y1 + t.headerPadding.top, y1+t.headerHeight-t.headerPadding.bottom, "potential");
                    result.render();
                }
            }
        }
        
        /**
         * This will calculate the space for the window (just puts in padding around the edges)
         */
        function calculateWindowSpace(x1, y1, x2, y2) {
            return {
                x1: x1+3,
                y1: y1,
                x2: x2-3,
                y2: y2-3
            }
        }

        /**
         * This is responsible for creating the window drag and rendering it
         */
        function createWindowDrag(index) {
            mouse.startDragging(new MouseDrag(t.id + startDragging, (x, y, d, id) => {
                // draw the tab
                let res = UI_WIDGET.windowTabLabel("tabLabel " + id, d.name, x, y, y+d.height, "active");
                
                // calculate the window size, it should be based on the og size of the window, but don't overflow the edges
                let windowX2 = x + d.ogWindowWidth;
                if(windowX2 > canvas.width)
                    windowX2 += canvas.width - windowX2;

                let windowY2 = y+t.headerHeight+d.ogWindowHeight;
                if(windowY2 > canvas.height)
                    windowY2 += canvas.height - windowY2;

                // render the active window, then the header
                let tempWindowSpace = calculateWindowSpace(x-3, y+t.headerHeight, windowX2, windowY2);
                t.windows[d.index].render(tempWindowSpace.x1, tempWindowSpace.y1, tempWindowSpace.x2, tempWindowSpace.y2, tempWindowSpace.x2- tempWindowSpace.x1, tempWindowSpace.y2 - tempWindowSpace.y1);
                res.render();

                // tell the current hovering window that its being hovered
                let hoverOverWindow = editor.windowManager.getWindowContainerAtScreenPos(x, y);
                if(hoverOverWindow != null) hoverOverWindow.newWindowHoveringOverMe = t.windows[d.index];
                
            }, (x, y, d) => {
                // when its dropped, figure out the hovering window 
                let hoverOverWindow = editor.windowManager.getWindowContainerAtScreenPos(x, y);
                if(hoverOverWindow == null) return;

                // then swap the tabs
                let window = t.windows[d.index];
                t.unregisterWindow(t.windows[d.index]);
                hoverOverWindow.windowDroppedOnMe(x, y, window);
            }, {
                active: index == t.activeWindowIndex,
                name: t.windows[index].name,
                height: t.headerHeight-t.headerPadding.bottom,
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
        let droppedIndex = this.calculateWindowDropIndex(x, true);
        this.activeWindowIndex = droppedIndex == -1 ? this.windows.length : droppedIndex;
        this.registerWindow(window, droppedIndex);
    }

    calculateWindowDropIndex(x, force = false) {
        if(this.newWindowHoveringOverMe == null && !force) return -1;

        let highest = 0;
        for(let i = 0; i < this.cacheWindowTabPositions.length; i++) {
            if(x >= this.cacheWindowTabPositions[i].x1)
                highest = i;
            if(x >= this.cacheWindowTabPositions[i].x2)
                highest = i+1;
        }
        return highest;
    }
}