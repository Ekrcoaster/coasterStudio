
class Mouse {
    x = 0;
    y = 0;
    lastX = 0;
    lastY = 0;

    down = false;
    downX = 0;
    downY = 0;
    timeDown = 0;
    clickDown = false;
    clickUp = false;
    sawClickDown;
    sawClickUp;
    sawDoubleClick;

    lastClick = 0;
    doubleClickFirstDown = false;
    
    scroll = 0;
    lastScroll = 0;

    activeTool;
    activeToolInitData;

    /**@type {MouseDrag} */
    mouseDrag;

    fileDropHovering = false;
    
    tick() {
        let reRenderFromMouse = false;

        // click down
        if(this.clickDown) this.sawClickDown = true;
        if(this.sawClickDown) {
            this.clickDown = false;
            this.sawClickDown = false;
            reRenderFromMouse = true;
        }

        // click up
        if(this.clickUp) this.sawClickUp = true;
        if(this.sawClickUp) {
            this.clickUp = false;
            this.sawClickUp = false;
            reRenderFromMouse = true;
        }

        // handle double clicks
        if(this.doubleClickFirstDown) this.sawDoubleClick = true;
        if(this.sawDoubleClick) {
            this.doubleClickFirstDown = false;
            this.sawDoubleClick = false;
            reRenderFromMouse = true;
        }

        // mouse drag release
        if(this.mouseDrag != null && !this.down) {
            this.mouseDrag.onPlace(this.x, this.y, this.mouseDrag.data, this.mouseDrag.id);
            this.removeActiveTool(this.mouseDrag.id);
            this.mouseDrag = null;
            reRenderFromMouse = true;
        }
        
        if(this.down)
            this.timeDown++;
        else
            this.timeDown = 0;
        
        this.lastScroll = this.scroll;
        this.lastX = this.x;
        this.lastY = this.y;
        return reRenderFromMouse;
    }

    render() {
        if(this.mouseDrag != null) this.mouseDrag.onRender(this.x, this.y, this.mouseDrag.data, this.mouseDrag.id);
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /** This will check if the mouse is over a certian part of the screen
     * @param {String} optionalToolID when given the tool id, it'll automatically handle the active tool leaving + others not hovering
     * @returns 
     */
    isHoveringOver(x1, y1, x2, y2, padding = 0, optionalToolID) {
        if(optionalToolID != null) {
            if(this.activeTool == optionalToolID) return true;
            else if(this.activeTool != null) return false;
        }
        return staticUISpace.utility.isInside(this.x, this.y, x1, y1, x2, y2, padding);
    }

    /** When given a tool ID, check if the tool is being used or it is free to start being used
     * @param {String} id 
     * @returns 
     */
    isToolDown(id) {
        if(this.mouseDrag != null) return false;
        if(this.down == false) return false;
        if(id == this.activeTool) return true;
        else if(this.activeTool == null) return this.down;
        return false;
    }

    /** When given a tool ID, check if the tool is being used or it is free to start being used
     * @param {String} id 
     * @returns 
     */
    isToolFirstUp(id) {
        if(this.mouseDrag != null) return false;
        return this.clickUp && (this.activeTool == null || this.activeTool == id);
    }

    isToolDoubleClick(id) {
        if(this.mouseDrag != null) return false;
        return this.doubleClickFirstDown && (this.activeTool == null || this.activeTool == id);
    }

    setActiveTool(id, initData = {}) {
        if(id == this.activeTool) return;
        this.activeTool = id;
        this.activeToolInitData = initData;
    }

    removeActiveTool(id) {
        if(this.activeTool == id) {
            this.activeTool = null;
            this.activeToolInitData = {};
        }
    }

    setMouseDown(down) {
        this.down = down;
        this.clickDown = down;
        this.clickUp = !down;
        if(down) {
            this.downX = this.x;
            this.downY = this.y;
            if(Date.now() - this.lastClick < 300)
                this.doubleClickFirstDown = true;
            this.lastClick = Date.now();
        }
    }

    addScroll(amt) {
        this.scroll += amt;
    }

    getDownDistance() {
        if(!this.down) return 0;
        return this.distanceTo(this.downX, this.downY);
    }

    /**
     * 
     * @param {MouseDrag} mouseDrag 
     */
    startDragging(mouseDrag) {
        if(this.mouseDrag != null) return false;
        this.mouseDrag = mouseDrag;
        this.activeTool = mouseDrag.id;
        return true;
    }

    getVelocity() {
        return {
            x: this.x - this.lastX,
            y: this.y - this.lastY
        }
    }

    getScrollVelocity() {
        return this.scroll - this.lastScroll;
    }

    getDownDistanceSeperate() {
        return {
            x: this.x - this.downX,
            y: this.y - this.downY
        }
    }

    angleTo(x, y) {
        return staticUISpace.utility.getAngleBetweenPoints(this.x, this.y, x, y);
    }

    distanceTo(x, y) {
        return staticUISpace.utility.distance(this.x, this.y, x, y);
    }
}

class MouseDrag {
    /**
     * @callback OnMouseDragRender
     * @param {Number} x
     * @param {Number} y
     * @param {Object} data
     * @param {String} id
     */
    /**
     * @callback OnMousePlace
     * @param {Number} x
     * @param {Number} y
     * @param {Object} data
     * @param {String} id
     */

    id;
    /**@type {OnMouseDragRender} */
    onRender;
    /**@type {OnMousePlace} */
    onPlace;
    data;

    /**
     * @param {OnMouseDragRender} onRender
     * @param {OnMousePlace} onPlace
     * */
    constructor(id, onRender, onPlace, data) {
        this.id = id;
        this.onRender = onRender;
        this.onPlace = onPlace;
        this.data = data;
    }
}
