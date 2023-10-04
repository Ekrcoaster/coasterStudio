var canvas = document.getElementById("canvas");
/**@type {CanvasRenderingContext2D} */
var ctx = canvas.getContext("2d", {alpha: false});
const CANVAS_SCALE = 2;

const DEGREE_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREE = 180 / Math.PI;

/**@type {Editor} */
var editor;
/** @type {Engine} */
var engine;
/**@type {Mouse} */
var mouse;
/**@type {Keyboard} */
var keyboard;

window.onload = Initalize;
let needsRendering = true;
function Initalize() {

    editor = new Editor();
    engine = new Engine();
    engine.activeScene = new Scene("testingScene");
    editor.setActiveScene(engine.activeScene);

    let obj = new GameObject(engine.activeScene, "test");
    obj.transform.setLocalAngle(45);
    obj.addComponent(new ShapeRenderer());
    let obj3 = new GameObject(engine.activeScene, "test1b").setParent(obj);
    obj3.transform.setLocalPosition(new Vector2(5, 2));
    obj3.addComponent(new ShapeRenderer());
    let t = new GameObject(engine.activeScene, "test1c").setParent(obj3);
    t.transform.setLocalPosition(new Vector2(0, -4));
    t.addComponent(new ShapeRenderer());
    let t2 = new GameObject(engine.activeScene, "test1d").setParent(t);
    t2.transform.setLocalPosition(new Vector2(0, -4));
    t2.transform.setLocalAngle(-45);
    t2.addComponent(new ShapeRenderer());

    editor.setSelected(obj, true);

    mouse = new Mouse();
    keyboard = new Keyboard();

    updateCanvasSize();
    setInterval(() => {
        Tick();
        if(needsRendering)
            Render();
        PostTick();
    }, 1000 / editor.fps);
}

function Tick() {
    if(editor) editor.tick();
    engine.tick();
}

function PostTick() {
    if(mouse.tick())
        needsRendering = true;

    if(keyboard.tick())
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

canvas.addEventListener("wheel", function(evt) {
    mouse.addScroll(evt.deltaY/100);
    needsRendering = true;
});

window.addEventListener('keydown',function(e) {
    keyboard.keyDownQueue.push(e.key);
    needsRendering = true;

    keyboard.isCapsLockDown = e.getModifierState("CapsLock");
},false);

window.addEventListener('keyup',function(e) {
    keyboard.keyUpQueue.push(e.key);
    needsRendering = true;
    keyboard.isCapsLockDown = e.getModifierState("CapsLock");
},false);

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
    sawDoubleClick;

    lastClick = 0;
    doubleClickFirstDown = false;
    
    scroll = 0;
    lastScroll = 0;

    activeTool;
    activeToolInitData;

    /**@type {MouseDrag} */
    mouseDrag;
    
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

    isToolDoubleClick(id) {
        if(this.mouseDrag != null) return false;
        return this.doubleClickFirstDown && (this.activeTool == null || this.activeTool == id);
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
        return UI_UTILITY.getAngleBetweenPoints(mouse.x, mouse.y, x, y);
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

class Keyboard {
    /**@typedef {("A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z"|"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"!"|"@"|"#"|"$"|"%"|"^"|"&"|"*"|"SPACE"|"SHIFT"|"CTRL"|"ALT"|"DELETE"|"ARROWLEFT"|"ARROWRIGHT"|"ARROWUP"|"ARROWDOWN"|"ENTER")} KeyboardKeyType */
    
    /**@type {Set<KeyboardKeyType>} */
    down = new Set();

    /**@type {Set<KeyboardKeyType>} */
    downFirst = new Set();

    /**@type {Set<KeyboardKeyType>} */
    upFirst = new Set();

    isShiftDown;
    isCtrlDown;
    isAltDown;
    isCapsLockDown;

    keyDownQueue = [];
    keyUpQueue = [];
    constructor() {
        this.down = new Set();
        this.downFirst = new Set();
        this.upFirst = new Set();

        this.isShiftDown = false;
        this.isCtrlDown = false;
        this.isAltDown = false;
        this.isCapsLockDown = false;
        
        this.keyDownQueue = [];
        this.keyUpQueue = [];
    }
    

    tick() {
        this.downFirst = new Set();
        this.upFirst = new Set();

        let needsRendering = false;
        // handle all of the waiting down keys
        for(let i = 0; i < this.keyDownQueue.length; i++) {
            this.onKey(this.keyDownQueue[i], true);
            needsRendering = true;
        }
        this.keyDownQueue = [];

        // handle all of the waiting up keys
        for(let i = 0; i < this.keyUpQueue.length; i++) {
            this.onKey(this.keyUpQueue[i], false);
            needsRendering = true;
        }
        this.keyUpQueue = [];


        return needsRendering;
    }

    onKey(key, down) {
        key = this.convertKey(key);

        if(down) this.down.add(key);
        else this.down.delete(key);
        
        if(key == "CTRL") this.isCtrlDown = down;
        if(key == "ALT") this.isAltDown = down;
        if(key == "SHIFT") this.isShiftDown = down;

        if(down) {
            this.downFirst.add(key);
        } else {
            this.upFirst.add(key);
        }
    }

    convertKey(key) {
        key = key.toUpperCase();
        if(key == "META") key = "CONTROL";
        if(key == "CONTROL") key = "CTRL";
        if(key == "BACKSPACE") key = "DELETE";
        if(key == "RETURN") key = "ENTER";
        return key;
    }

    getAlphabeticNumbericSymbolic(key) {
        let allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()_+-=[]\\{}|;':\",./<>? ";
        if(allowed.indexOf(key) == -1) {
            if(key == "SPACE")
                return " ";
            return "";
        }

        if(!this.isShiftDown && !this.isCapsLockDown)
            return key.toLowerCase();
        return key;
    }
}