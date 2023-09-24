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
    }, 0);
}

function Tick() {
    if(editor) editor.tick();
    engine.tick();
    mouse.tick();
}

function Render() {
    if(editor) editor.render(0, 0, canvas.width, canvas.height);
    engine.render(0, 0, canvas.width, canvas.height);

    needsRendering = false;
}

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
    timeDown = 0;
    clickDown = false;
    clickUp = false;

    activeTool;
    activeToolInitData;

    tick() {
        if(this.clickDown)
            this.clickDown = false;

        if(this.clickUp)
            this.clickUp = false;
        
        if(this.down)
            this.timeDown++;
        else
            this.timeDown = 0;
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
        if(this.down == false) return false;
        if(id == this.activeTool) return true;
        else if(this.activeTool == null) return this.down;
        return false;
    }

    setActiveTool(id, initData) {
        if(id == this.activeTool) return;
        this.activeTool = id;
        this.activeToolInitData = initData;
        console.log(this.activeTool)
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
    }
}