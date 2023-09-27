var canvas = document.getElementById("canvas");
/**@type {CanvasRenderingContext2D} */
var ctx = canvas.getContext("2d", {alpha: false});
const CANVAS_SCALE = 2;

/**@type {Editor} */
var editor;
/** @type {Engine} */
var engine;
/**@type {Mouse} */
var mouse;

window.onload = Initalize;
let needsRendering = true;
function Initalize() {

    editor = new Editor();
    engine = new Engine();
    mouse = new Mouse();

    updateCanvasSize();
    setInterval(() => {
        Tick();
        if(needsRendering)
            Render();
        PostTick();
    }, 0);
}

function Tick() {
    if(editor) editor.tick();
    engine.tick();
}

function PostTick() {
    if(mouse.tick())
        needsRendering = true;
}

function Render() {
    if(editor) editor.render(0, 0, canvas.width, canvas.height);
    engine.render(0, 0, canvas.width, canvas.height);
    mouse.render();
    needsRendering = false;
}

function NeedsReRendering() {needsRendering = true;}

///

function updateCanvasSize() {
    canvas.width = window.innerWidth*CANVAS_SCALE;
    canvas.height = window.innerHeight*CANVAS_SCALE;
}

window.onresize = () => {
    updateCanvasSize();
}

canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    mouse.updatePosition(mousePos.x, mousePos.y);
    needsRendering = true;

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: (evt.clientX - rect.left) * CANVAS_SCALE,
          y: (evt.clientY - rect.top) * CANVAS_SCALE
        };
      }
}, false);
    
canvas.addEventListener("mousedown", function (evt) {
    if(evt.button == 0) {
        mouse.setMouseDown(true);
    }
    needsRendering = true;
});
canvas.addEventListener("mouseup", function (evt) {
    if(evt.button == 0) {
        mouse.setMouseDown(false);
    }
    needsRendering = true;
});

const UTILITY = {
    generateCode: function(length) {
        let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let temp = "";
        for(let i = 0; i < length; i++)
            temp += letters[Math.floor(Math.random() * letters.length)];
        return temp;
    }
}

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

    activeTool;
    activeToolInitData;

    /**@type {MouseDrag} */
    mouseDrag;

    tick() {
        let reRenderFromMouse = false;

        if(this.clickDown) this.sawClickDown = true;
        if(this.sawClickDown) {
            this.clickDown = false;
            this.sawClickDown = false;
            reRenderFromMouse = true;
        }

        if(this.clickUp) this.sawClickUp = true;
        if(this.sawClickUp) {
            this.clickUp = false;
            this.sawClickUp = false;
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
        
        return reRenderFromMouse;
    }

    render() {
        if(this.mouseDrag != null) this.mouseDrag.onRender(this.x, this.y, this.mouseDrag.data, this.mouseDrag.id);
    }

    updatePosition(x, y) {
        this.lastX = this.x;
        this.lastY = this.y;
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
        return UI_UTILITY.isInside(this.x, this.y, x1, y1, x2, y2, padding);
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

    setActiveTool(id, initData) {
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
        }
    }

    getDownDistance() {
        if(!this.down) return 0;
        return Math.sqrt(((this.y - this.downY) ** 2) + ((this.x - this.downX) ** 2));
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