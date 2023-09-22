var canvas = document.getElementById("canvas");
/**@type {CanvasRenderingContext2D} */
var ctx = canvas.getContext("2d", {alpha: false});

/**@type {Editor} */
var editor;
/** @type {Engine} */
var engine;

window.onload = Initalize;
function Initalize() {

    editor = new Editor();
    engine = new Engine();

    updateCanvasSize();
    setInterval(() => {
        Tick();
        Render();
    }, 1);
}

function Tick() {
    if(editor) editor.tick();
    engine.tick();
}

function Render() {
    UI_LIBRARY.drawRectCoords(0, 0, canvas.width, canvas.height, 0, new DrawShapeOption("black"));
    if(editor) editor.render(0, 0, canvas.width, canvas.height);
    engine.render(0, 0, canvas.width, canvas.height);
}

///

function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onresize = () => {
    updateCanvasSize();
}