/**@type {CUICanvasSpace} */
var staticUISpace;

class CUICanvasSpace {
    /**@type {HTMLCanvasElement} */
    canvas;
    /**@type {CanvasRenderingContext2D} */
    ctx;
    frame = 0;
    seconds = 0;
    fps = 30;

    /**@type {UILibrary} */
    ui;

    /**@type {UIUtility} */
    utility;
    
    /**@type {Mouse} */
    mouse;

    /**@type {Keyboard} */
    keyboard;

    /**@type {CUIElement[]} */
    raycasts = [];

    /**@type {CUIElement} */
    root;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.frame = 0;
        this.seconds = 0;
        this.fps = 30;
        this.ui = new UILibrary(this.ctx, this.canvas);
        this.utility = new UIUtility(this.ctx, this.canvas);
        staticUISpace = this;
        this.mouse = new Mouse();
        this.keyboard = new Keyboard();
        this.loadEvents();
        this.root = null;
    }

    /**@param {CUIElement} root  */
    setRoot(root) {
        this.root = root;
        return this;
    }
    
    setFPS(fps) {
        this.fps = fps;
        return this;
    }

    getIntervalTick() {
        return 1000/this.fps;
    }

    tick() {
        this.frame++;
        this.seconds += this.getDeltaTime();
        this.mouse.tick();
        this.keyboard.tick();
    }

    clearCanvas() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    getDeltaTime() {
        return 1 / this.fps;
    }
    
    startInterval(callback) {
        const t = this;

        setInterval(() => {
            t.clearCanvas();
            
            this.raycasts = [];
            if(this.root != null) {
                this.root.raycast(this.mouse.x, this.mouse.y, this.raycasts);
                this.root.draw(this);
            }

            callback();
            t.mouse.render();
            t.tick();
        }, this.getIntervalTick());
    }

    loadEvents() {

        const t = this;
        canvas.addEventListener('mousemove', function(evt) {
            var mousePos = getMousePos(t.canvas, evt);
            t.mouse.updatePosition(mousePos.x, mousePos.y);
        }, false);
            
        canvas.addEventListener("mousedown", function (evt) {
            if(evt.button == 0) {
                t.mouse.setMouseDown(true);
            }
        });
        canvas.addEventListener("mouseup", function (evt) {
            if(evt.button == 0) {
                t.mouse.setMouseDown(false);
            }
        });

        canvas.addEventListener("drop", (ev) => {
            ev.preventDefault();
            // editor.onDropEvent(ev);
            t.mouse.fileDropHovering = false;
        });
        canvas.addEventListener("dragover", (ev) => {
            ev.preventDefault();
            // needsRendering = true;
            var mousePos = getMousePos(t.canvas, ev);
            t.mouse.updatePosition(mousePos.x, mousePos.y);
        });
        canvas.addEventListener("dragenter", (ev) => {
            ev.preventDefault();
            t.mouse.fileDropHovering = true;
        });
        canvas.addEventListener("dragleave", (ev) => {
            ev.preventDefault();
            t.mouse.fileDropHovering = false;
        });

        canvas.addEventListener("wheel", function(evt) {
            t.mouse.addScroll(evt.deltaY/100);
        });

        window.addEventListener('keydown',function(e) {
            t.keyboard.keyDownQueue.push(e.key);

            t.keyboard.isCapsLockDown = e.getModifierState("CapsLock");
            e.preventDefault();
        },false);

        window.addEventListener('keyup',function(e) {
            t.keyboard.keyUpQueue.push(e.key);
            t.keyboard.isCapsLockDown = e.getModifierState("CapsLock");
            e.preventDefault();
        },false);
        
        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
              x: (evt.clientX - rect.left) * CANVAS_SCALE,
              y: (evt.clientY - rect.top) * CANVAS_SCALE
            };
          }
        
    }

    inRay(element) {
        return this.raycasts.indexOf(element) > -1;
    }

    isRayTip(element) {
        if(this.raycasts.length == 0) return false;
        return this.raycasts[this.raycasts.length - 1] == element;
    }
}
