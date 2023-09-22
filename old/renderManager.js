var IS_IN_RENDER_MODE = false;
var lastWindowData = [];
var oldCanvas = {};
var oldSelected = {};
var oldZoom = 0;

var overlayData = {
    "enabled": false,
    "stage": -1,
    "progress": 0
};

function ENTER_RENDER_MODE() {
    if(IS_IN_RENDER_MODE) return;
    IS_IN_RENDER_MODE = true;
    FRAMES.isPlaying = false;

    oldCanvas = {
        "width": INFO_CANVAS.width,
        "height": INFO_CANVAS.height
    }
    canvas.width = CAMERA.width;
    canvas.height = CAMERA.height;
    updateCanvasInfo();

    lastWindowData = [];
    for(var i = 0; i < WINDOWS.length; i++) {
        lastWindowData.push(WINDOWS[i]);
    }
    WINDOWS = [];
    WINDOW_TOOLS.createNewWindow("render_view", "", {"left": 0, "right": 0, "top": 0, "bottom": 0});

    oldSelected = copyJson(SELECTED);
    SELECTED.active = "";
    SELECTED.other = [];
    oldZoom = WINDOW_DATA.scene_view.zoomLevel;
    WINDOW_DATA.scene_view.zoomLevel = 1;
    TICK();
    PROPERTIES.updateFrame();
    RENDER();
}

function EXIT_RENDER_MODE() {
    if(!IS_IN_RENDER_MODE) return;
    IS_IN_RENDER_MODE = false;

    WINDOWS = [];
    for(var i = 0; i < lastWindowData.length; i++) {
        WINDOWS.push(lastWindowData[i]);
    }

    canvas.width = oldCanvas.width;
    canvas.height = oldCanvas.height;
    updateCanvasSize();

    SELECTED.active = oldSelected.active;
    SELECTED.other = oldSelected.other;
    WINDOW_DATA.scene_view.zoomLevel = oldZoom;
}

function renderFrame(noChange = false) {
    if(!noChange) {
    }

    var image = "--";
    try {
        image = canvas.toDataURL();
    } catch {

    }

    if(!noChange) {
        //EXIT_RENDER_MODE();
    }
    return image;
}

function downloadRawData(data, fileType) {
    document.head.innerHTML += `<a href="${data}" id="tempdownload"></a>`
    var a = $("#tempdownload").attr("href", data).attr("download", "Frame " + FRAMES.current + fileType)
    a[0].click();
    a.remove();
    //document.getElementById("tempdownload").click();
    //document.getElementById("tempdownload").outerHTML = "";
    return data;
}

function renderSingleCurrentFrame() {
    ENTER_RENDER_MODE()
    var data = renderFrame()
    EXIT_RENDER_MODE();
    downloadRawData(data, ".png")
}

function renderFullAnimation(callback = function() {}) {
    updateProgressScreen({"enabled": true, "stage": 0});
    setTimeout(function() {
        var startTime = new Date().getTime();
        ENTER_RENDER_MODE();
        updateProgressScreen({"stage": 1});
        FRAMES.current = FRAMES.start;
        var images = [];
        while(FRAMES.current <= FRAMES.end) {
            TICK();
            PROPERTIES.updateFrame();
            RENDER();
            images.push(dataURItoBlob(renderFrame(true)));
            FRAMES.current++;
        }
    
        EXIT_RENDER_MODE();
        setTimeout(function() {
            updateProgressScreen({"stage": 2});
    
            var zip = new JSZip();
            for(var i = 0; i < images.length; i++) {
                zip.file("Frame " + i + ".png", images[i]);
            }
        
            zip.generateAsync({type: "blob"}).then(function(content) {
                saveAs(content, "renderedFrames.zip");
                console.log(new Date().getTime() - startTime)
                updateProgressScreen({"stage": 3});
                callback();
            });
        }, 1000)
        
    }, 1000);
    
}

//https://stackoverflow.com/questions/55385369/jszip-creating-corrupt-jpg-image
function dataURItoBlob( dataURI ) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var bb = new Blob([ab]);
    return bb;
}

function updateProgressScreen(data = {"enabled": false, "stage": 0, "progress": 0}) {
    if(data.enabled != null) overlayData.enabled = data.enabled;
    if(data.stage != null) overlayData.stage = data.stage;
    if(data.progress != null) overlayData.progress = data.progress;

    document.getElementById("overlay").style.display = (overlayData.enabled ? "block" : "none");
    var stageData = [
        {title: "Preparing...", description: "The little hamsters are stretching... They are almost ready."},
        {title: "Rendering...", description: "The little hamsters are drawing each frame... one by one... give them a few seconds..."},
        {title: "Packing...", description: "The little hamsters are now taking their frames and tying them together in a neat little package... Give them time, this proccess is a lot of work."},
        {title: "DONE!", description: "The little hamsters have now sent you the package, it should download, if not. CLICK ME"}
    ]

    document.getElementById("progressLabel").innerHTML = stageData[overlayData.stage].title;
    document.getElementById("progress").innerHTML = stageData[overlayData.stage].description;

    document.getElementById("backButton").style.display = (overlayData.stage == 3 ? "inline-block" : "none");

    $("#progressBar").val((overlayData.progress*100) + "");
}

function hideOverlay() {
    updateProgressScreen({"enabled": false});
}