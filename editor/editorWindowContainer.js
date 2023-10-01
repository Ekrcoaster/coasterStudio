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
        tabSpacing: 15,
        headerInsertWidth: 5,
        headerInsertPadding: 10
    }
    /**@param {Direction} insideDirection */
    constructor(percent, insideDirection) {
        super(percent, insideDirection);
        this.myself = "container";
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

    checkForCollapse() {
        if(this.windows.length == 0)
            this.collapse();
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
        this.activeWindowIndex = Math.max(0, Math.min(this.activeWindowIndex, this.windows.length - 1));

        // calculate the window space
        let windowSpace = calculateWindowSpace(x1, y1, x2, y2);

        // make sure the window won't overlap with the header
        windowSpace.y1 += t.headerHeight;

        let tabWindowDropIndex = -1;
        let tabWindowDropType = this.windowDropPositionType(mouse.x, mouse.y);
        if(tabWindowDropType == "tab") tabWindowDropIndex = this.calculateWindowDropIndex(mouse.x, mouse.y);

        // actions
        let toSelect = this.activeWindowIndex;
        let startDragging = -1;

        // draw the other non active tabs
        drawTabs(false, tabWindowDropIndex);

        // figure out what the active window to draw is
        let windowToDraw = this.activeWindowIndex;
        
        // draw the active window
        if(windowToDraw < this.windows.length && windowToDraw > -1) {
            this.windows[windowToDraw].preRender(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2- windowSpace.x1, windowSpace.y2 - windowSpace.y1);
        }
            
        // draw the ACTIVE tab
        drawTabs(true, tabWindowDropIndex);

        if(windowToDraw < this.windows.length && windowToDraw > -1) {
            UI_LIBRARY.drawRectCoords(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, 0, new DrawShapeOption(COLORS.windowBackground().fillColor).setRoundedCorners(10).makeMask());
            this.windows[windowToDraw].render(windowSpace.x1, windowSpace.y1, windowSpace.x2, windowSpace.y2, windowSpace.x2- windowSpace.x1, windowSpace.y2 - windowSpace.y1);
            this.windows[windowToDraw].postRender();
        }

        if(t.newWindowHoveringOverMe != null)
            drawHoverSplit(tabWindowDropType);

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
            if(t.newWindowHoveringOverMe == null) {
                t.cacheWindowTabPositions = [];
            }

            for(let i = 0; i < t.windows.length; i++) {
                let tabState = "active";
                if(i != t.activeWindowIndex)
                    tabState = "notActive";

                // if there is a window being dragged and it is going to be inserted, then draw the insert
                if(t.newWindowHoveringOverMe != null && i == insertIndex) {
                    offset += t.headerPadding.headerInsertPadding - t.headerPadding.headerInsertWidth/2;
                    UI_LIBRARY.drawRectCoords(x1+offset, y1 + t.headerPadding.top, x1+offset+t.headerPadding.headerInsertWidth, y1+t.headerHeight-t.headerPadding.bottom, 0, COLORS.windowTabInsert);
                    offset += t.headerPadding.headerInsertPadding;
                }

                // if the tab is out of bounds, dont render it
                if(offset >= x2) continue;

                // calculate the tab and add the offset based on the length 
                let result = UI_WIDGET.windowTabLabel("tabLabel " + t.id + i, t.windows[i].name, x1 + offset, y1 + t.headerPadding.top, y1+t.headerHeight-t.headerPadding.bottom, tabState);
                if(t.newWindowHoveringOverMe == null) {
                    t.cacheWindowTabPositions.push({
                        x1: x1+offset, y1: 
                        y1 + t.headerPadding.top,
                        x2: x1+offset+result.myLength,
                        y2: y1+t.headerHeight-t.headerPadding.bottom
                    });
                }
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
                if(insertIndex >= t.windows.length) {
                    offset += t.headerPadding.headerInsertPadding - t.headerPadding.headerInsertWidth/2;
                    UI_LIBRARY.drawRectCoords(x1+offset, y1 + t.headerPadding.top, x1+offset+t.headerPadding.headerInsertWidth, y1+t.headerHeight-t.headerPadding.bottom, 0, COLORS.windowTabInsert);
                }
            }
        }

        function drawHoverSplit(type) {
            if(type == "splitN") {
                draw(x1, y1+t.headerHeight, x2, y1+height/2);
            } else if(type == "splitE") {
                draw(x1+width/2, y1+t.headerHeight, x2, y2);
            } else if(type == "splitS") {
                draw(x1, y1+height/2, x2, y2);
            } else if(type == "splitW") {
                draw(x1, y1+t.headerHeight, x1+width/2, y2);
            }

            function draw(x1, y1, x2, y2) {
                UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.windowTabInsert);
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
                d.window.preRender(tempWindowSpace.x1, tempWindowSpace.y1, tempWindowSpace.x2, tempWindowSpace.y2, tempWindowSpace.x2- tempWindowSpace.x1, tempWindowSpace.y2 - tempWindowSpace.y1);
                d.window.render(tempWindowSpace.x1, tempWindowSpace.y1, tempWindowSpace.x2, tempWindowSpace.y2, tempWindowSpace.x2- tempWindowSpace.x1, tempWindowSpace.y2 - tempWindowSpace.y1);
                d.window.postRender();
                res.render();

                // tell the current hovering window that its being hovered
                let hoverOverWindow = editor.windowManager.getWindowContainerAtScreenPos(x, y);
                if(hoverOverWindow != null) hoverOverWindow.newWindowHoveringOverMe = d.window;
                
            }, (x, y, d) => {
                // when its dropped, figure out the hovering window 
                let hoverOverWindow = editor.windowManager.getWindowContainerAtScreenPos(x, y);
                if(hoverOverWindow == null) return;

                // then swap the tabs
                hoverOverWindow.windowDroppedOnMe(x, y, d.window);
                d.ogContainer.checkForCollapse();
            }, {
                active: index == t.activeWindowIndex,
                window: t.windows[index],
                name: t.windows[index].name,
                height: t.headerHeight-t.headerPadding.bottom,
                index: index,
                ogWindowWidth: windowSpace.x2 - windowSpace.x1,
                ogWindowHeight: windowSpace.y2 - windowSpace.y1,
                ogContainer: t
            }));

            t.unregisterWindow(t.windows[index]);
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
        return new EditorWindowContainer(this.getWidthPercent(), this.getHeightPercent());
    }

    windowDroppedOnMe(x, y, window) {
        this.newWindowHoveringOverMe = null;
        let type = this.windowDropPositionType(x, y);
        if(type == "tab") {
            let droppedIndex = this.calculateWindowDropIndex(x, y, true);
            this.activeWindowIndex = droppedIndex == -1 ? this.windows.length : droppedIndex;
            this.registerWindow(window, droppedIndex);
        } else if(type.startsWith("split")) {

            let parent = new EditorWindowContainer(1, this.insideDirection);
            parent.registerWindow(window);
            
            if(type == "splitN")
                this.split(0.5, "vertical", false, parent);
            else if(type == "splitE")
                this.split(0.5, "horizontal", true, parent);
            else if(type == "splitS")
                    this.split(0.5, "vertical", true, parent);
            else if(type == "splitW")
                this.split(0.5, "horizontal", false, parent);
        }
    }

    /**
     * Figures out how to handle a window drop
     * @returns {("tab"|"splitN"|"splitE"|"splitS"|"splitW")}
     */
    windowDropPositionType(x, y) {
        if(y > this.lastScreenPos.y1 + this.headerHeight + 50) {
            // calculate the best insideDirection to split
            // do this based on which axis the point is closest to
            let centerX = (this.lastScreenPos.x1 + this.lastScreenPos.x2) / 2;
            let centerY = (this.lastScreenPos.y1 + this.lastScreenPos.y2) / 2;
            let differenceX = centerX - x;
            let differenceY = centerY - y;
            if(Math.abs(differenceX) > Math.abs(differenceY)) {
                return differenceX > 0 ? "splitW" : "splitE";
            } else {
                return differenceY > 0 ? "splitN" : "splitS";
            }
        }
        return "tab";
    }

    calculateWindowDropIndex(x, y, force = false) {
        if(this.newWindowHoveringOverMe == null && !force) return -1;

        let highest = -1;
        for(let i = 0; i < this.cacheWindowTabPositions.length; i++) {
            let middle = (this.cacheWindowTabPositions[i].x1+this.cacheWindowTabPositions[i].x2 ) /2;
            if(x >= middle)
                highest = i;
        }
        return highest+1;
    }

    print(depth = 0) {
        let builder = `${super.print(depth)} <`;

        for(let i = 0; i < this.windows.length; i++) {
            builder += this.windows[i].name + ", ";
        }

        builder = builder.substring(0, builder.length - 2);

        builder += ">";

        return builder;
    }

    debugRender(x1, y1, x2, y2, width, height, depth, maxDepth) {
        if(depth >= maxDepth) return;
        UI_LIBRARY.drawRectCoords(x1+50, y1+50, x2-50, y2-50, 0, new DrawShapeOption("#ffffff00", "#ab28281f", 10));
    }
}