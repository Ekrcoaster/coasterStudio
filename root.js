var canvas = document.getElementById("canvas");
const CANVAS_SCALE = 2;
var drawInfo = new CUICanvasSpace(canvas);
drawInfo.setFPS(60);
drawInfo.setRoot(null);

const DEGREE_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREE = 180 / Math.PI;

/**@type {Editor} */
var editor;
/** @type {Engine} */
var engine;

/**@type {AssetEngine} */
var assets;

window.onload = Initalize;
let needsRendering = true;
async function Initalize() {
    assets = new AssetEngine();
    engine = new Engine(drawInfo.fps);
    editor = new Editor(drawInfo.fps);

    engine.activeScene = new Scene("testingScene");
    editor.setActiveScene(engine.activeScene);

    const font = new FontFace("Nato Sans Moto", "url(./res/NotoSansMono-VariableFont_wdth\,wght.ttf)", {});
    await font.load();
    document.fonts.add(font);

    updateCanvasSize();
    drawInfo.startInterval(() => {
        Tick();
        Render();
        PostTick();
    });
}

function Tick() {
    if(editor) editor.tick();
    engine.tick();
}

function PostTick() {
}

function Render() {
    needsRendering = false;
    if(editor) editor.render(0, 0, canvas.width, canvas.height);
}

function NeedsReRendering() {needsRendering = true;}

///

function updateCanvasSize() {
    canvas.width = window.innerWidth*CANVAS_SCALE;
    canvas.height = window.innerHeight*CANVAS_SCALE;
}

window.onresize = () => {
    updateCanvasSize();
    needsRendering = true;
}

const UTILITY = {
    generateCode: function(length) {
        let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let temp = "";
        for(let i = 0; i < length; i++)
            temp += letters[Math.floor(Math.random() * letters.length)];
        return temp;
    }
}