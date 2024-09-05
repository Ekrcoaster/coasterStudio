var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d", {alpha: false});

const ABOUT = {
    version: "1.0.0",
    build: "alpha"
};

const DEG_TO_RAD = Math.PI/180;
const RAD_TO_DEG = 180/Math.PI;

var TIME = 0;

var lastMouse = {
    "wasDown": false,
    "wasClicked": false,
    "wasPas": false
}

var framesTemp = 0;
window.onload = function(e) {
    INITIALIZE();
    setInterval(function() {
        TICK();
        RENDER();
        TIME += 0.001;

        if(staticUISpace.mouse.postClick) {
            staticUISpace.mouse.postClick = false;
        }
        if(staticUISpace.mouse.isClick) {
            staticUISpace.mouse.postClick = true;
        }
        
        if(staticUISpace.mouse.isDown && staticUISpace.mouse.isClick) {
            staticUISpace.mouse.isClick = false;
        }
    }, 1);
}

function INITIALIZE() {
    OPENED_PANEL = null;
    updateCanvasSize();
    loadEvents();

    document.getElementById("logo").innerHTML += "v" + ABOUT.version + (ABOUT.build != "public" ? " " + ABOUT.build : "");

    if(ABOUT.build == "public")
        document.getElementById("topButtons").innerHTML += `<button id="dropbtn" onclick="openURL('https://alphacoasterstudio.netlify.app/')">Alpha Version</button>`
    else
        document.getElementById("topButtons").innerHTML += `<button id="dropbtn" onclick="openURL('https://studio.ekrcoaster.net')">Public Version</button>`

    document.getElementById("topButtons").innerHTML += `<button id="dropbtn" onclick="openURL('https://github.com/Ekrcoaster/coasterStudio/')">Source Code</button>`

    WINDOW_TOOLS.createNewWindow("property_view", "root.topRow", {"left": 0, "right": -0.4, "top": 0, "bottom": 0.6});
    WINDOW_TOOLS.createNewWindow("scene_view", "root.topRow", {"left": -0.4, "right": 0.6, "top": 0, "bottom": 0.6});
    WINDOW_TOOLS.createNewWindow("outliner_view", "root.topRow", {"left": 0.6, "right": 0, "top": 0, "bottom": 0.6});
    WINDOW_TOOLS.createNewWindow("timeline_view", "root.bottomRow", {"left": 0, "top": 0.6, "right": 0, "bottom": 0});
    ///WINDOW_TOOLS.createNewWindow("blue", "root.bottomRow");
    //WINDOW_TOOLS.createNewWindow("purple", "root.bottomRow");
    WINDOW_TOOLS.updateAllWindowSizes();

    PROPERTIES.createIntProperty("CAMERA.x", 0);
    PROPERTIES.createIntProperty("CAMERA.y", 0);

    PROPERTIES.createColorProperty("SETTINGS.rendering.skyColor", 0);

    localStorage.setItem("last_version", ABOUT.version);

    //SELECTED.active = OBJECT_TOOLS.createObject(OBJECT_TYPES.image, "testParent", {x: 00, y: 0}, {z: 0}, {width: 256, height: 256}, "", "#b73a3a", "#2c6983", 0).id;
    //OBJECT_TOOLS.createColoredRect("testChild", {x: 200, y: 100, z: 0}, {z: 40}, {width: 128, height: 128}, "#3a49b7", "#ffffff", 0).parent = SELECTED.active;
    //var ob = OBJECT_TOOLS.createColoredRect("testChild2", {x: 200, y: -100, z: 0}, {z: 0}, {width: 128, height: 128}, "#3aa5b7", "#ffffff", 0);
    //ob.parent = SELECTED.active;
    
    
    //OBJECT_TOOLS.createColoredRect("testChild2Child", {x: 500, y: -100, z: 0}, {z: 0}, {width: 128, height: 128}, "#b73aab", "#ffffff", 0).parent = ob.id;
    //OBJECT_TOOLS.createObject(OBJECT_TYPES.colored_elipse, "testObject2", {x: 700, y: 0}, {z: 0}, {width: 480, height: 560}, "", "purple", "blue", 15);
    //OBJECT_TOOLS.createColoredTriangle("triangle", {x:-700, y:0}, {z: 0}, {width: 480, height: 480}, "orange", "red", 15, 0.5);

    //OBJECT_TOOLS.createImage("testImage", {x: 0, y: 750}, {z: 5}, {width:480, height:480}, "icon_menuOutliner")
/*
    FRAMES.current = 20;
    PROPERTY_LISTENERS[2].keyFrame();
    FRAMES.current = 100;
    PROPERTY_LISTENERS[2].setValue(30);

    PROPERTY_LISTENERS[2].keyFrame();
    FRAMES.current = 20;
    PROPERTY_LISTENERS[2].applyKeyframe();
    FRAMES.current = 0;*/

   // ENTER_RENDER_MODE();

}

var lastFrameData = {};
function TICK() {
    staticUISpace.mouse.vel.x = staticUISpace.mouse.pos.x - staticUISpace.mouse.last.x;
    staticUISpace.mouse.vel.y = staticUISpace.mouse.pos.y - staticUISpace.mouse.last.y;
    staticUISpace.mouse.last = staticUISpace.mouse.pos;

    if(staticUISpace.mouse.isDown) {
        staticUISpace.mouse.holdingTime += 1;
    } else {
        ACTIVE_TOOL = "";
        STORED_TOOL_SETTINGS = {};
        staticUISpace.mouse.lastFree = staticUISpace.mouse.pos;
        UI_ClearDown();
        staticUISpace.mouse.holdingTime = 0;

    }
    staticUISpace.mouse.downDistance.x = staticUISpace.mouse.pos.x - staticUISpace.mouse.lastFree.x;
    staticUISpace.mouse.downDistance.y = staticUISpace.mouse.pos.y - staticUISpace.mouse.lastFree.y;

    staticUISpace.mouse.scroll.velocity = staticUISpace.mouse.scroll.level - staticUISpace.mouse.scroll.last;
    staticUISpace.mouse.scroll.last = staticUISpace.mouse.scroll.level;

    staticUISpace.mouse.isHolding = staticUISpace.mouse.holdingTime > 30;

    if(lastFrameData.isPlaying != FRAMES.isPlaying || lastFrameData.frameRate != FRAMES.frameRate) {
        lastFrameData = copyJson(FRAMES);
        FRAMES.updateTimer();
    }

    //WINDOW_DATA.scene_view.zoomLevel = Math.sin(TIME*10)+1.1;
}

function RENDER() {
    UI_LOW_LEVEL.drawRectAbsolute(0, 0, INFO_CANVAS.width, INFO_CANVAS.height, 0, "black");
    if(OPENED_PANEL != null) {
        lastMouse = {
            "wasDown": staticUISpace.mouse.isDown,
            "wasClicked": staticUISpace.mouse.isClick,
            "wasPas": staticUISpace.mouse.postClick
        }

        staticUISpace.mouse.isDown = false;
        staticUISpace.mouse.isClick = false;
        staticUISpace.mouse.postClick = false;
    }

    for(var i = 0; i < WINDOWS.length; i++) {
        WINDOWS[i].onRender();
    }

    for(var i = 0; i < WINDOWS.length; i++) {
        WINDOWS[i].onRender(true);
    }

    if(OPENED_PANEL != null) {
        staticUISpace.mouse.isDown = lastMouse.wasDown;
        staticUISpace.mouse.isClick = lastMouse.wasClicked;
        staticUISpace.mouse.postClick = lastMouse.wasPas;
        ON_DETAILED_PANEL_RENDER();
    }

    lateUIRenderer();
}

function FPS_TICK() {
}

/////////////////

function loadEvents() {
    $(window).resize(function() {
        //updateCanvasSize();
    });
    
    window.onresize = function(e) {
        updateCanvasSize();
    }
    
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        staticUISpace.mouse.pos = mousePos;
        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top
            };
          }
    }, false);
    
    canvas.addEventListener("mousedown", function (evt) {
        if(evt.button == 0) {
            staticUISpace.mouse.isDown = true;
            KEYS_DOWN_UNTIL_CLICK = []
            staticUISpace.mouse.isClick = true;
        } else if(evt.button == 2) {
            DETAILED_PANEL_TOOLS.onRightClick();
        }
    });
    canvas.addEventListener("mouseup", function (evt) {
        if(evt.button == 0) {
            staticUISpace.mouse.isDown = false;
            staticUISpace.mouse.isClick = false;
        }
    });
    
    canvas.addEventListener("wheel", function(evt) {
        staticUISpace.mouse.scroll.level += evt.deltaY/100;
        on_scroll(evt.deltaY);
    });
    
    window.addEventListener('keydown',function(e) {
        on_key_down(e.keyCode, e.key);
    },false);
    
    window.addEventListener('keyup',function(e) {

        on_key_up(e.keyCode, e.key);
    },false);

    if (document.addEventListener) {
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
        }, false);
      } else {
        document.attachEvent('oncontextmenu', function() {
          window.event.returnValue = false;
        });
      }

      window.onbeforeunload = function(){
          if(!isSceneEmpty()) {
            return 'Are you sure you want to leave?';
          }
      };
}

function dropHandler(ev) {
    console.log('File(s) dropped');
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                if(file.type.indexOf("image") > -1) {
                    onImageUpload(file);
                } else if(file.name.indexOf(".cObj") > -1) {
                    onObjectFileLoaded(file)
                } else if(file.name.indexOf(".cScene") > -1) {
                    onSceneFileLoaded(file)
                }
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        }
    }
}

function dragOverHandler(ev) {
    ev.preventDefault();
}

function askForFile() {
    document.getElementById("master_file").click();
}

function onFileChosen(event) {
    if(event.target.files != null) {
        for(var i = 0; i < event.target.files.length; i++) {
            onImageUpload(event.target.files[i]);
        }
    }
}

/////////////////

function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateCanvasInfo();
}

function updateCanvasInfo() {
    INFO_CANVAS.width = canvas.width;
    INFO_CANVAS.height = canvas.height;
}

//https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
function lerpColor(a, b, amount) { 
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function getJsonCategories(json) {
    var t = [];
    for(var x in json) t.push(x);
    return t;
}

function createID(length) {
    var t = "";
    for(var i = 0; i < length; i++) {
        var letters = "abcdefghijklmnopqrstuvwxyz"
        t += letters[Math.floor(Math.random()*letters.length)];
    }
    return t;
}

function copyJson(originalJson) {
    if(originalJson != null && originalJson.length != null) return originalJson;
    var categories = getJsonCategories(originalJson);
    var newJson = {};
    for(var i = 0; i < categories.length; i++) {
        if(typeof(originalJson[categories[i]]) == "object") {
            newJson[categories[i]] = copyJson(originalJson[categories[i]])
        } else {
            newJson[categories[i]] = originalJson[categories[i]];
        }
    }
    return newJson;
}


function brightenColor(hex, amount = 0.1) {
    var rgb = hexToRgb(hex);
    if(rgb == null) return hex;
    rgb.r+=amount;
    rgb.g += amount;
    rgb.b += amount;
    return rgbToHex(rgb)
}

function setAlpha(hex, amount = 1) {
    var rgb = hexToRgb(hex);
    if(rgb == null) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${amount})`
}

//THANKS SO MUCH https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
function rgbToHex(rgb = {r: 0, g: 0, b: 0}) {
    return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

function hexToHSL(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        "h": h,
        "s": s,
        "v": l
    }
}

//https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

///


function arcToMine(angle) {
    angle += 90;
    if(angle >= 360) angle-=360;
    return angle;
}

function atanToMine(angle) {
    return 180 - angle;
}

function mineToArc(angle) {
    angle -= 90;
    if(angle < 0) angle+=360;
    return angle;
}

function mineToAtan(angle) {
    return 180 - angle;
}

function unitCircleToMine(angle) {
    angle = 0-(angle-90);
    while(angle < 0) angle += 360;
    return angle;
}

function mineToUnitCircle(angle) {
    angle = 0-angle;
    angle += 90;
    while(angle < 0) angle += 360;
    return angle;
}

function smooth0To1(value) {
    return 1-((Math.cos(value*180*DEG_TO_RAD)+1)/2)
}

function map(input, minGuide, maxGuide, minScale, maxScale) {
    return (input - minGuide) * ((maxScale - minScale) / (maxGuide - minGuide)) + minScale;
}

function mapClamp(input, minGuide, maxGuide, minScale, maxScale) {
    return map(clamp(input, minGuide, maxGuide), minGuide, maxGuide, minScale, maxScale);
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function fromCamelCase(camelCase, spaceChar = " ") {
    // no side-effects
    var result = camelCase.replace( /([A-Z])/g, spaceChar + "$1" );
    var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
}

function titleCase(string) {
    if(typeof(string) != "string") return string;
    var splitStr = string.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}

function professionalCamelCase(string) {
    return titleCase(fromCamelCase(string));
}

function removeLetterAtIndex(string,index) {
    return string.slice(0, index) + string.slice(index + 1);
}

function openURL(url) {
    window.open(url);
}