var wasToolInactive = true;

var activeMenuBars = {
    
}

var firstWindows = {

};


var gizmoLast = {

}

var average = {

}

var displacements = {};

var lastAverage = {x: 0, y: 0}


/////////////////////////

function ON_WINDOW_RENDER(windowName = "", windowID = "", x1 = 0, y1 = 0, x2 = 0, y2 = 0, windowObject = WINDOW_TOOLS.windowTemplate) {
    var originalX = x1;
    var originalY = y1;
    x1 = x1+3;
    y1 = y1+3;
    x2 = x2-3;
    y2 = y2-3;
    //console.log(windowName, x1, y1, x2, y2, windowObject)
    var centerX = (x1+x2)/2;
    var centerY = (y1+y2)/2;

    if(originalX > 0 && UI_TOOLS.rectAbsolute(x1-6, y1+5, x1+5, y2-5, "rgba(0,0,0,0)", COLORS.normalTextColor, windowName + "_window_resize_horizontal")) {
        if(wasToolInactive) {
            wasToolInactive = false;
            STORED_TOOL_SETTINGS = {
                "og": windowObject.weights.left
            };
        }

        var leftWindow = WINDOW_TOOLS.getLeftWindow(windowObject);
        WINDOW_TOOLS.setWeights(leftWindow, {"right": STORED_TOOL_SETTINGS.og-MOUSE.downDistance.x*(-3/INFO_CANVAS.width)});
        WINDOW_TOOLS.setWeights(windowObject, {"left":STORED_TOOL_SETTINGS.og-MOUSE.downDistance.x*(-3/INFO_CANVAS.width)});
    }
    if(originalY > 0 && UI_TOOLS.rectAbsolute(x1+5, y1-5, x2-5, y1+5, "rgba(0,0,0,0)", COLORS.normalTextColor, windowName + "_window_resize_vertical")) {
        if(wasToolInactive) {
            wasToolInactive = false;
            STORED_TOOL_SETTINGS = {
                "og": windowObject.weights.top
            };
        }

        WINDOW_TOOLS.setColumnHeights(windowObject, STORED_TOOL_SETTINGS.og-MOUSE.downDistance.y*(-2/INFO_CANVAS.height));
    }
    
    ctx.save();
    var region = new Path2D();
    region.rect(x1, y1, x2-x1, y2-y1);
    ctx.clip(region);
    /*ctx.font = "30px Arial";
    ctx.fillStyle = "black"
    ctx.fillText(windowObject.weights.left + "", x1+50, (y2+y1)/2);
    ctx.fillText(windowObject.weights.right + "", x2-80, (y2+y1)/2);


    ctx.fillText(windowObject.weights.bottom + "", (x1+x2)/2, y2-50);
    ctx.fillText(windowObject.weights.top + "", (x1+x2)/2, y1+70);
*/
    

    if(ACTIVE_TOOL == "") wasToolInactive = true;

    var isMouseIn =  UI_LOW_LEVEL.isMouseIn(x1+10, y1+10, x2-10, y2-10, 0);
    if(isMouseIn) MOUSE.hoveringWindow = windowName;

    switch(windowName) {
        case "scene_view":
            SCENE_VIEW(x1, y1, x2, y2, windowObject, isMouseIn, false);
        break;
        case "outliner_view":
            OUTLINER_VIEW(x1, y1, x2, y2, windowObject, isMouseIn);
        break;
        case "timeline_view":
            TIMELINE_VIEW(x1, y1, x2, y2, windowObject, isMouseIn);
        break;
        case "property_view":
            PROPERTY_VIEW(x1, y1, x2, y2, windowObject, isMouseIn);
        break;
        case "render_view":
            RENDER_VIEW(x1, y1, x2, y2, windowObject, isMouseIn);
        break;
        default:
            UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, "#313235");
            UI_LOW_LEVEL.drawText("temp " + windowName, (x2+x1)/2, (y2+y1)/2, 25, COLORS.normalTextColor, "center")
        break;
    }

    if(activeMenuBars[windowID] == null) activeMenuBars[windowID] = false;
    if(firstWindows[windowID] == null) firstWindows[windowID] = false;

    
    var iconSlot = y2-50;
    if(windowName == "timeline_view") iconSlot = y1+5;

    if(activeMenuBars[windowID]) {
        if(firstWindows[windowID]) {
            firstWindows[windowID] = false;
            activeMenuBars = {};
            activeMenuBars[windowID] = true;
        }
        var menuIcons = [IMAGES.ICONS.scene, IMAGES.ICONS.properties, IMAGES.ICONS.outliner, IMAGES.ICONS.timeline];
        var windows = {
            "id_scene": "scene_view",
            "id_outliner": "outliner_view",
            "id_properties": "property_view",
            "id_timeline": "timeline_view"
        }

        for(var i = 0; i < menuIcons.length; i++) {
            if(UI_TOOLS.buttonImage(menuIcons[i], x1 + 55 + (i*35), iconSlot+4, 32, 32)) {
                activeMenuBars[windowID] = false;
                WINDOWS[WINDOWS.indexOf(windowObject)].name = windows[menuIcons[i]];
            }
        }
    } else {
        firstWindows[windowID] = true;
    }


    if(windowName != "render_view")
    activeMenuBars[windowID] = UI_TOOLS.toggleImage(IMAGES.ICONS.menuIcon, x1+10, iconSlot, 40, 40, activeMenuBars[windowID]);
    ctx.restore();

}
 
function ON_WINDOW_POST_RENDER(windowName = "", windowID = "", x1 = 0, y1 = 0, x2 = 0, y2 = 0, windowObject = WINDOW_TOOLS.windowTemplate) {
    
    ctx.save();
    var region = new Path2D();
    region.rect(x1, y1, x2-x1, y2-y1);
    ctx.clip(region);

    var isMouseIn =  UI_LOW_LEVEL.isMouseIn(x1+10, y1+10, x2-10, y2-10, 0);
    switch(windowName) {
        case "scene_view":
            SCENE_VIEW(x1, y1, x2, y2, windowObject, isMouseIn, true);
        break;
    }
    ctx.restore();
}

function SCENE_VIEW(x1 = 0, y1 = 0, x2 = 0, y2 = 0, windowObject = WINDOW_TOOLS.windowTemplate, isMouseIn = false, post = false) {
    
    var sceneLocal0x0 = {
        x: windowObject.init.center.x + WINDOW_DATA.scene_view.position.x,
        y: windowObject.init.center.y + WINDOW_DATA.scene_view.position.y
    };

    var sceneOffset = {"pos": sceneLocal0x0, "scale": WINDOW_DATA.scene_view.zoomLevel};
    if(post) {
        drawSceneUI();
        drawCameraBounds();
        return;
    }
    UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, SETTINGS.scene_view.showSkyColor ? SETTINGS.rendering.skyColor : COLORS.backgroundGray);


    if(Math.abs(MOUSE.scroll.velocity) > 0 && isMouseIn) {
        var oldZoom = WINDOW_DATA.scene_view.zoomLevel;
        var localMouse = {
            x: windowObject.init.center.x - MOUSE.pos.x,
            y: windowObject.init.center.y - MOUSE.pos.y
        }

        WINDOW_DATA.scene_view.position.x += localMouse.x;
        WINDOW_DATA.scene_view.position.y += localMouse.y;

        var porportion = {
            x: WINDOW_DATA.scene_view.position.x / oldZoom,
            y: WINDOW_DATA.scene_view.position.y / oldZoom
        }

        WINDOW_DATA.scene_view.zoomLevel += (MOUSE.scroll.velocity > 0 ? -0.1 : 0.1);
        if(WINDOW_DATA.scene_view.zoomLevel < 0.1) WINDOW_DATA.scene_view.zoomLevel = 0.1;

        WINDOW_DATA.scene_view.position.x = porportion.x * WINDOW_DATA.scene_view.zoomLevel;
        WINDOW_DATA.scene_view.position.y = porportion.y * WINDOW_DATA.scene_view.zoomLevel;

        WINDOW_DATA.scene_view.position.x -= localMouse.x;
        WINDOW_DATA.scene_view.position.y -= localMouse.y;
    }

    if(SETTINGS.scene_view.showGrid)
    drawGrid(WINDOW_DATA.scene_view.position.x, WINDOW_DATA.scene_view.position.y, WINDOW_DATA.scene_view.zoomLevel);

    OBJECTS.sort(ZSort);

    for(var i = 0; i < OBJECTS.length; i++) {
        OBJECTS[i].pos.x = Math.round(OBJECTS[i].pos.x*10)/10;
        OBJECTS[i].pos.y = Math.round(OBJECTS[i].pos.y*10)/10;
        ON_OBJECT_PRE_RENDER(OBJECTS[i], sceneOffset, {x1: x1, y1: y1, x2: x2, y2: y2}, isMouseIn, worldTransform);
    }

    var worldTransform = OBJECT_TOOLS.caculateAllWordTransforms();
    
    for(var i = 0; i < OBJECTS.length; i++) {
        OBJECTS[i].pos.x = Math.round(OBJECTS[i].pos.x*10)/10;
        OBJECTS[i].pos.y = Math.round(OBJECTS[i].pos.y*10)/10;
        ON_OBJECT_RENDER(OBJECTS[i], sceneOffset, {x1: x1, y1: y1, x2: x2, y2: y2}, isMouseIn, worldTransform);
    }

    var gizmoMove = [];
    if(SELECTED.active != "") {
        gizmoMove.push(OBJECT_TOOLS.getObject(SELECTED.active));
    }
    for(var i = 0; i < SELECTED.other.length; i++) {
        gizmoMove.push(OBJECT_TOOLS.getObject(SELECTED.other[i]));
    }

    
    for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.startListening(`OBJECTS.${gizmoMove[i].id}.pos.x`);
    for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.startListening(`OBJECTS.${gizmoMove[i].id}.pos.y`);
    for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.startListening(`OBJECTS.${gizmoMove[i].id}.rotation.z`);
    for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.startListening(`OBJECTS.${gizmoMove[i].id}.scale.x`);
    for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.startListening(`OBJECTS.${gizmoMove[i].id}.scale.y`);


    if(gizmoMove.length > 0) {
        var gizmoSettings = {
            "rotateGlobally": false
        };
        average = {
            position: {
                x: 0,
                y: 0
            },
            rotation: {
                z: gizmoMove[0].rotation.z
            }
        }

        for(var i = 0; i < gizmoMove.length; i++) {
            var calculatedSpace = gizmoMove[i].getWorldTransform(worldTransform);
            
            average.position.x += calculatedSpace.pos.x;
            average.position.y += calculatedSpace.pos.y;
        }
        average.position.x /= gizmoMove.length;
        average.position.y /= gizmoMove.length;


        for(var i = 0; i < gizmoMove.length; i++) {
            displacements[gizmoMove[i].id] = {
                "pos": {
                    x: average.position.x - gizmoMove[i].pos.x,
                    y: average.position.y - gizmoMove[i].pos.y,
                },
                "rotation": {
                    z: average.rotation.z - gizmoMove[i].rotation.z,
                    "angleToAverage": gizmoLast[gizmoMove[i].id]
                }
            }
        }

        var gizmoData = {
            "position": {
                x: average.position.x,
                y: average.position.y,
                "active": {
                    x: gizmoMove[0].getWorldTransform(worldTransform).pos.x,
                    y: gizmoMove[0].getWorldTransform(worldTransform).pos.y
                }
            },
            "rotation": {
                z: gizmoMove[0].rotation.z
            },
            "scale": {
                x: gizmoMove[0].scale.x,
                y: gizmoMove[0].scale.y
            },
            "dimensions": {
                width: gizmoMove[0].dimensions.width,
                height: gizmoMove[0].dimensions.height
            }
        }

        var newData = ON_GIZMO_RENDER(gizmoData, sceneOffset, gizmoSettings, gizmoMove, isMouseIn);
        var newAveragePosition = newData.position;

        for(var i = 0; i < gizmoMove.length; i++) {
            var myDisplacement = copyJson(displacements[gizmoMove[i].id]);
            gizmoMove[i].pos.x = newAveragePosition.x - myDisplacement.pos.x;
            gizmoMove[i].pos.y = newAveragePosition.y - myDisplacement.pos.y;

            gizmoMove[i].scale.x = newData.scale.x;
            gizmoMove[i].scale.y = newData.scale.y;

            //UI_LOW_LEVEL.drawCircle(newAveragePosition.x*sceneOffset.scale+sceneOffset.pos.x, newAveragePosition.y*sceneOffset.scale+sceneOffset.pos.y, 4, "black")

            gizmoMove[i].rotation.z = (newData.rotation.z - myDisplacement.rotation.z);
            if(gizmoSettings.rotateGlobally) {

                ///if(i == 0) myDisplacement.rotation.angleToAverage = 90;
                //if(i == 1) myDisplacement.rotation.angleToAverage = 270;
                //console.log(myDisplacement.rotation.angleToAverage)
                var newPos = UI_LOW_LEVEL.rotateAroundPoint(newAveragePosition.x, newAveragePosition.y, gizmoMove[i].pos.x, gizmoMove[i].pos.y, mineToArc(newData.rotation.z+ myDisplacement.rotation.angleToAverage))
                UI_LOW_LEVEL.drawCircle(newPos.x*sceneOffset.scale+sceneOffset.pos.x, newPos.y*sceneOffset.scale+sceneOffset.pos.y, 4, "black");
                if(!isNaN(newPos.x)) {

                    gizmoMove[i].pos.x = newPos.x;
                    gizmoMove[i].pos.y = newPos.y;
                }

                /*
                var myObjectCopy = copyJson(gizmoMove[i]);
                var newPos = UI_LOW_LEVEL.rotateAroundPoint(
                    0*sceneOffset.scale+sceneOffset.pos.x, 
                    0*sceneOffset.scale+sceneOffset.pos.y, 
                    
                    (myObjectCopy.pos.x*sceneOffset.scale+sceneOffset.pos.x), 
                    myObjectCopy.pos.y*sceneOffset.scale+sceneOffset.pos.y,
                    mineToUnitCircle(mineToUnitCircle(newData.rotation.z - myDisplacement.rotation.z)));
                UI_LOW_LEVEL.drawCircle(newPos.x, newPos.y, 4, "cyan")
                gizmoMove[i].pos.x = (newPos.x-sceneOffset.pos.x)/sceneOffset.scale;
                gizmoMove[i].pos.y = (newPos.y-sceneOffset.pos.y)/sceneOffset.scale;*/
            }
        }

        
        for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.finishListening(`OBJECTS.${gizmoMove[i].id}.pos.x`);
        for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.finishListening(`OBJECTS.${gizmoMove[i].id}.pos.y`);
        for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.finishListening(`OBJECTS.${gizmoMove[i].id}.rotation.z`);
        for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.finishListening(`OBJECTS.${gizmoMove[i].id}.scale.x`);
        for(var i = 0; i < gizmoMove.length; i++) UNDO_TOOLS.finishListening(`OBJECTS.${gizmoMove[i].id}.scale.y`);
    }



    if(MOUSE.isDown && isMouseIn) {
        if(ACTIVE_TOOL == "" || ACTIVE_TOOL == "scene_move") {
            WINDOW_DATA.scene_view.position.x += MOUSE.vel.x;
            WINDOW_DATA.scene_view.position.y += MOUSE.vel.y;
            if(Math.abs(MOUSE.vel.x) > 1 || Math.abs(MOUSE.vel.y) > 1) ACTIVE_TOOL = "scene_move"
        }
    }

    function drawGrid(offsetX, offsetY, scale) {
        var thickness = 3*scale;
        var defPixelSkip = 100;

        var guidelinesThickness = 4*scale;

        offsetX-=7;
        offsetY+=16;

        var middle = sceneLocal0x0;

        var xx = middle.x;
        for(var x = middle.x; x < middle.x + 10000; x += defPixelSkip*scale) {
            xx -= defPixelSkip*scale;
            if(x >= x1 && x <= x2)
            UI_LOW_LEVEL.drawRectAbsolute(x-(thickness/2), y1, x+thickness, y2, 0, "#4a4a4a");
            if(xx >= x1 && xx <= x2)
            UI_LOW_LEVEL.drawRectAbsolute(xx-(thickness/2), y1, xx+thickness, y2, 0, "#4a4a4a");
        }

        var yy = middle.y;
        for(var y = middle.y; y < middle.y + 10000; y += defPixelSkip*scale) {
            yy -= defPixelSkip*scale;
            if(y >= y1 && y <= y2)
            UI_LOW_LEVEL.drawRectAbsolute(x1, y-(thickness/2), x2, y+thickness, "#4a4a4a");
            if(yy >= y1 && yy <= y2)
            UI_LOW_LEVEL.drawRectAbsolute(x1, yy-(thickness/2), x2, yy+thickness, "#4a4a4a");
        }

        if(middle.y >= y1 && middle.y <= y2)
            UI_LOW_LEVEL.drawRectAbsolute(x1, middle.y-guidelinesThickness, x2, middle.y+guidelinesThickness, 0, "#a66f6f");
        if(middle.x >= x1 && middle.x <= x2)
            UI_LOW_LEVEL.drawRectAbsolute(middle.x-guidelinesThickness, y1, middle.x+guidelinesThickness, y2, 0, "#6f7ba6")

        if(middle.y >= y1 && middle.y <= y2 && middle.x >= x1 && middle.x <= x2)
        UI_LOW_LEVEL.drawCircle(middle.x, middle.y, 15*scale, "#151515", "#303030", 3);
    }

    function drawSceneUI() {
        ctx.font = "20px Arial";
        ctx.fillStyle = COLORS.normalTextColor;

        var stats = [
            `X: ${-WINDOW_DATA.scene_view.position.x}  Y: ${WINDOW_DATA.scene_view.position.y}`,
            `Zoom: ${Math.round(WINDOW_DATA.scene_view.zoomLevel*100)}%`,
            `Objects: ${SELECTED.active == "" ? 0 : 1 + SELECTED.other.length} / ${OBJECTS.length}`,
            `Active: "${SELECTED.active == "" ? "Nothing" : OBJECT_TOOLS.getObject(SELECTED.active).name}"`
        ];

        if(SETTINGS.scene_view.showStats) {
            for(var i = 0; i < stats.length; i += 1) {
                UI_LOW_LEVEL.drawText(stats[i], x1+15, y1+(i*25)+25, 18, COLORS.normalTextColor);
            }
        }
        
        var buttons = ["showGrid", "showCamera", "showSkyColor", "showStats"];
        var icons = [IMAGES.ICONS.toggleGridVisibility, IMAGES.ICONS.toggleCameraVisiblity, IMAGES.ICONS.toggleSkyVisiblity, IMAGES.ICONS.toggleStatsVisibility]

        var buttonX = x2-50;


        for(var i = 0; i < buttons.length; i++) {
            SETTINGS.scene_view[buttons[i]] = UI_TOOLS.toggleImage(icons[i], buttonX, y1+10, 40, 40, SETTINGS.scene_view[buttons[i]])
            buttonX -= 45;

        }

        buttonX = x2-50;
        
        if(UI_TOOLS.buttonImage(IMAGES.ICONS.goToCenter, buttonX, y1+60, 40, 40)) {
            WINDOW_DATA.scene_view.position.x = 0;
            WINDOW_DATA.scene_view.position.y = 0;

            WINDOW_DATA.scene_view.zoomLevel = 1;
        }

        

    }

    function drawCameraBounds() {
        if(!SETTINGS.scene_view.showCamera) return;
        var old = copyJson(CAMERA);
        CAMERA.x -= CAMERA.width / 2;
        CAMERA.y -= CAMERA.height / 2;
        var translatedCamPos = {
            x1: CAMERA.x * sceneOffset.scale + sceneOffset.pos.x,
            y1: CAMERA.y * sceneOffset.scale + sceneOffset.pos.y,

            x2: (CAMERA.x + CAMERA.width) * sceneOffset.scale + sceneOffset.pos.x,
            y2: (CAMERA.y + CAMERA.height) * sceneOffset.scale + sceneOffset.pos.y,
        }

        UI_LOW_LEVEL.drawRectAbsolute(translatedCamPos.x1, translatedCamPos.y1, translatedCamPos.x2, translatedCamPos.y2, 0, "rgba(0,0,0,0)", "white", 4);

        UI_LOW_LEVEL.drawLine(translatedCamPos.x1, translatedCamPos.y1, translatedCamPos.x2, translatedCamPos.y2, "rgba(255,255,255,0.5)", 1)
        UI_LOW_LEVEL.drawLine(translatedCamPos.x1, translatedCamPos.y2, translatedCamPos.x2, translatedCamPos.y1, "rgba(255,255,255,0.5)", 1)

        CAMERA = copyJson(old)
    }

    function ZSort(a, b) {

        if (a.pos.z < b.pos.z) return -1;
        if (a.pos.z > b.pos.z) return 1;
       
        return 0;
    }
}

function ON_GIZMO_RENDER(input = {"position": {x: 0, y: 0, "active": {x: 0, y: 0}}, "rotation": {z: 0}, "scale": {x:1, y:1}, "dimensions": {width: 0, height:0 }}, sceneOffset = {"pos": {x: 0, y: 0}, "scale": 1}, gizmoSettings = {}, objectsInQuestion = [], isMouseIn) {
    input.position.x = Math.round(input.position.x);
    input.position.y = Math.round(input.position.y);
    var position = {
        x: input.position.x * sceneOffset.scale + sceneOffset.pos.x,
        y: input.position.y * sceneOffset.scale + sceneOffset.pos.y,
        "active": {
            x: input.position.active.x * sceneOffset.scale + sceneOffset.pos.x,
            y: input.position.active.y * sceneOffset.scale + sceneOffset.pos.y
        }
    }

    var rotation = {
        z: input.rotation.z
    }

    var scale = {
        x: input.scale.x,
        y: input.scale.y
    }

    //position.x -= offset;
    //position.y -= offset;
    //var width = object.dimensions.width * sceneOffset.scale;
    ///var height = object.dimensions.height * sceneOffset.scale;
    drawMoveGizmo();
    drawRotateGizmo();
    drawScaleGizmo();
    function drawMoveGizmo() {
        var middleSize = 16 + sceneOffset.scale;
        //console.log(position.x)
        //UI_LOW_LEVEL.drawRectLocal(position.x, position.y, 100, 100, 0, "red", "gggg")
        //UI_LOW_LEVEL.drawRectLocal(position.x + 100, position.y, 100, 100, 0, "blue");
        var moveXY = KEYS_DOWN_UNTIL_CLICK.indexOf("g") > -1 && isMouseIn;
        var moveX = moveXY && KEYS_DOWN_UNTIL_CLICK.indexOf("x") > -1 && isMouseIn;
        var moveY = moveXY && KEYS_DOWN_UNTIL_CLICK.indexOf("y") > -1 && isMouseIn;

        if(moveX || moveY) moveXY = false;

        UI_LOW_LEVEL.drawRectAbsolute(position.x-middleSize, position.y-middleSize, position.x+middleSize, position.y+middleSize, 0, "red", "red", 0, [{name: "drop-shadow", value: "0px 0px 10px black"}])
        if(UI_TOOLS.rectAbsolute(position.x-middleSize, position.y-middleSize, position.x+middleSize, position.y+middleSize, "lightgrey", "white", "MOVE_XY") || moveXY) {
            position.x += MOUSE.vel.x;
            position.y += MOUSE.vel.y;
            ACTIVE_TOOL = "MOVE_XY"

            if(SETTINGS.animation.autoKeyframe) {
                for(var i = 0; i < objectsInQuestion.length; i++) {
                    PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${objectsInQuestion[i].id}.pos.x`);
                    PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${objectsInQuestion[i].id}.pos.y`);
                }
            }
        }

        var arrowThickness = 0.4;
        var arrowLength = 4;
        var arrowTipSize = .75;

        UI_LOW_LEVEL.drawRectAbsolute(position.x+middleSize, position.y-(middleSize*arrowThickness), position.x + (middleSize*arrowLength), position.y+(middleSize*arrowThickness), 0, "red", "red", 0, [{name: "drop-shadow", value: "0px 0px 15px black"}])
        var xArrow = UI_TOOLS.rectAbsolute(position.x+middleSize, position.y-(middleSize*arrowThickness), position.x + (middleSize*arrowLength), position.y+(middleSize*arrowThickness), "red", "pink", "MOVE_X", 5, {
            x1: 0, y1: 0, x2:arrowLength*middleSize*0.5, y2: 0
        });
        if(xArrow || moveX) {
            position.x += MOUSE.vel.x;
            ACTIVE_TOOL = "MOVE_X"
            
            if(SETTINGS.animation.autoKeyframe) {
                for(var i = 0; i < objectsInQuestion.length; i++) {
                    PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${objectsInQuestion[i].id}.pos.x`);
                }
            }
        }
        UI_LOW_LEVEL.drawTriangle(position.x + (middleSize*arrowLength)-2, position.y-(middleSize*arrowTipSize), middleSize*2*arrowTipSize, middleSize*2*arrowTipSize, 90, "red", "", 0, 0.5, [{name: "drop-shadow", value: "0px 0px 10px black"}])
        UI_LOW_LEVEL.drawTriangle(position.x + (middleSize*arrowLength)-2, position.y-(middleSize*arrowTipSize), middleSize*2*arrowTipSize, middleSize*2*arrowTipSize, 90, xArrow ? "pink" : "red")


        UI_LOW_LEVEL.drawRectAbsolute(position.x-(middleSize*arrowThickness),position.y - (middleSize*arrowLength), position.x+(middleSize*arrowThickness),  position.y-middleSize, 0, "red", "red", 0, [{name: "drop-shadow", value: "0px 0px 15px black"}])
        var yArrow = UI_TOOLS.rectAbsolute(position.x-(middleSize*arrowThickness),position.y - (middleSize*arrowLength), position.x+(middleSize*arrowThickness),  position.y-middleSize, "blue", "cyan", "MOVE_Y", 5, {
            x1: 0, y1: -arrowLength*middleSize*0.6, x2:0, y2: 0
        });
        if(yArrow || moveY) {
            position.y += MOUSE.vel.y;
            ACTIVE_TOOL = "MOVE_Y"

            if(SETTINGS.animation.autoKeyframe) {
                for(var i = 0; i < objectsInQuestion.length; i++) {
                    PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${objectsInQuestion[i].id}.pos.y`);
                }
            }
        }
        UI_LOW_LEVEL.drawTriangle(position.x-(middleSize*arrowTipSize), position.y - (middleSize*arrowLength*1.34)-2, middleSize*2*arrowTipSize, middleSize*2*arrowTipSize, 0, "red", "", 0, 0.5, [{name: "drop-shadow", value: "0px 0px 10px black"}])
        UI_LOW_LEVEL.drawTriangle(position.x-(middleSize*arrowTipSize), position.y - (middleSize*arrowLength*1.34)-2, middleSize*2*arrowTipSize, middleSize*2*arrowTipSize, 0, yArrow ? "cyan" : "blue")

        /*if(UI_TOOLS.rectAbsolute(position.x - centerMoveSize, position.y - centerMoveSize, position.x + centerMoveSize, position.y + centerMoveSize, "white", "gray", "MOVE_XY")) {
            position.x += MOUSE.vel.x;
            position.y += MOUSE.vel.y;
        }

        if(UI_TOOLS.rectAbsolute(position.x+125*fixedScalar, position.y - centerMoveSize*1.5, position.x + 175*fixedScalar, position.y + centerMoveSize*1.5, "red", "pink", "MOVE_X")) {
            position.x += MOUSE.vel.x;
            UI_LOW_LEVEL.drawLine(-100, position.y, 10000, (position.y), "pink", 3)
        }

        */
    }

    function drawRotateGizmo() {
        var radius = 155;

        var posToUse = copyJson(position);
        if(!gizmoSettings.rotateGlobally) {
            posToUse = copyJson(position.active);
        }

        var old = rotation.z;
        rotation.z = UI_TOOLS.rotateArc(posToUse.x, posToUse.y, radius, rotation.z, 15, "ROTATE_Z", 45, "", "yellow", 10, [{name: "drop-shadow", value: "0px 0px 10px black"}], "r", isMouseIn);
        if(old != rotation.z) {
            if(SETTINGS.animation.autoKeyframe) {
                for(var i = 0; i < objectsInQuestion.length; i++) {
                    PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${objectsInQuestion[i].id}.rotation.z`);
                }
            }
        }
        /*var angle = rotation.z;
        angle = (90 - angle);
        UI_LOW_LEVEL.drawArc(position.x, position.y, radius, angle-10, angle+10, "", "yellow", 8);
        if((UI_LOW_LEVEL.isMouseInRadius(position.x, position.y, radius+20, radius-20, angle-10, angle+10, 0) && MOUSE.isDown && ACTIVE_TOOL == "") || ACTIVE_TOOL == "ROTATE_Z") {
            rotation.z = 0-(UI_LOW_LEVEL.getMouseAngle(position.x, position.y)-180);
            ACTIVE_TOOL = "ROTATE_Z"
            MOUSE.isClick = false;
        }*/

        //UI_LOW_LEVEL.drawLine(position.x, position.y, MOUSE.pos.x, MOUSE.pos.y, tt ? "red" : "blue", 5);
    }

    function drawScaleGizmo() {
        var distance = (input.dimensions.width + input.dimensions.height) / 8;

        var pos = {
            x: position.x+(distance*scale.x*2)*sceneOffset.scale,
            y: position.y+(distance*scale.y*2)*sceneOffset.scale
        }
        UI_LOW_LEVEL.drawRectAbsolute(pos.x, pos.y, pos.x+40*sceneOffset.scale, pos.y+40*sceneOffset.scale, 0, "red", "red", 0, [{name: "drop-shadow", value: "0px 0px 10px black"}])
        if(UI_TOOLS.rectAbsolute(pos.x, pos.y, pos.x+40*sceneOffset.scale, pos.y+40*sceneOffset.scale, "lightgrey", "white", "SCALE_XY", 0) || KEYS_DOWN_UNTIL_CLICK.indexOf("s") > -1) {
            scale.x += MOUSE.vel.x/150;
            scale.y += MOUSE.vel.y/150;

            if(SETTINGS.animation.autoKeyframe) {
                for(var i = 0; i < objectsInQuestion.length; i++) {
                    PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${objectsInQuestion[i].id}.scale.x`);
                    PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${objectsInQuestion[i].id}.scale.y`);
                }
            }

            if(KEYS_DOWN.indexOf("CTRL") > -1 && isMouseIn) {
                var ogPor = 1;
                scale.y = scale.x;
            }
           // position.x -= MOUSE.vel.x/1.25;
        }

    }

    //position.x += offset;
    //position.y += offset;
    input.position.x = (position.x-sceneOffset.pos.x)/sceneOffset.scale;
    input.position.y = (position.y-sceneOffset.pos.y)/sceneOffset.scale;

    input.rotation.z = rotation.z;

    input.scale.x = scale.x;
    input.scale.y = scale.y;
    return input;
}


function OUTLINER_VIEW(x1 = 0, y1 = 0, x2 = 0, y2 = 0, windowObject = WINDOW_TOOLS.windowTemplate, isMouseIn = false) {
    UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, COLORS.backgroundGray);

    header();
    body(y1 + 45, y2-30);
    footer();

    function header() {
        UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, 45, 0, COLORS.hylightGray, COLORS.hylightOutline, 10);
        UI_LOW_LEVEL.drawText("Scene View", (x1+x2)/2, y1+30, 30, COLORS.normalTextColor, "center")
    }
 
    function body(topY, bottomY) {
        //UI_LOW_LEVEL.drawRectAbsolute(x1, topY, x2, bottomY, 0, "green");

        var spacing = 30;

        UI_LOW_LEVEL.drawLine(x1+10, topY, x1+10, topY + (OBJECTS.length*spacing)-8, "#6f6f6f", 5)

        for(var i = 0; i < OBJECTS.length; i++) {
            var y = topY + (i*spacing)+25;

            var startXOffset = OBJECTS[i].getParentCount()*20;

            var isMouseIn = UI_LOW_LEVEL.isMouseIn(x1+44+startXOffset, y-15, x2, y+5, 0);
            var options = [
                
            ];
            if(SELECTED.other.length == 0) {
                options = [
                    {
                        "name": "Delete",
                        "callback": function(id) {
                            OBJECT_TOOLS.deleteObject(id);
                        },
                        "args": [OBJECTS[i].id]
                    },
                    {
                        "name": "Duplicate",
                        "callback": function(id) {
                            OBJECT_TOOLS.duplicateObject(id);
                        },
                        "args": [OBJECTS[i].id]
                    }
                ]
            } else {
                options = [
                    {
                        "name": "Delete This",
                        "callback": function(id) {
                            OBJECT_TOOLS.deleteObject(id);
                        },
                        "args": [OBJECTS[i].id]
                    },
                    {
                        "name": "Duplicate This",
                        "callback": function(id) {
                            OBJECT_TOOLS.duplicateObject(id);
                        },
                        "args": [OBJECTS[i].id]
                    },
                    {
                        "name": "Delete All",
                        "callback": function() {
                            for(var i = 0; i < SELECTED.other.length; i++) {
                                OBJECT_TOOLS.deleteObject(SELECTED.other[i]);
                            }
                            OBJECT_TOOLS.deleteObject(SELECTED.active);
                        }
                    },
                    {
                        "name": "Duplicate All",
                        "callback": function() {
                            for(var i = 0; i < SELECTED.other.length; i++) {
                                OBJECT_TOOLS.duplicateObject(SELECTED.other[i]);
                            }
                            OBJECT_TOOLS.duplicateObject(SELECTED.active);
                        }
                    }
                ]
            }
            DETAILED_PANEL_TOOLS.registerRegion("outliner_" + i, {x1: x1+44, y1: y-15, x2: x2, y2: y+5}, options);
            if(isMouseIn && MOUSE.postClick) {
                calcualteSelection(OBJECTS[i].id, active_ui.typing.id == OBJECTS[i].id);
            }

            UI_LOW_LEVEL.drawLine(x1+10, y-5, x1+20+startXOffset, y-5, "#6f6f6f", 4);

            var color = COLORS.normalTextColor;
            if(isMouseIn) color = COLORS.hylightedTextColor;

            if(SELECTED.active == OBJECTS[i].id) color = COLORS.selectionActive;
            if(SELECTED.other.indexOf(OBJECTS[i].id) > -1) color = COLORS.selectionBackground;

            if(!OBJECTS[i].isEnabled) color = COLORS.greyedOutTextColor;

            UI_LOW_LEVEL.drawText(OBJECTS[i].name, x1+45+startXOffset, y, 20, color, "left");
            OBJECTS[i].isEnabled = UI_TOOLS.toggleBox(x1+22+startXOffset, y-15, 18, OBJECTS[i].isEnabled);

            //var text = UI_TOOLS.typeTextInvisible(x1+25, y, OBJECTS[i].name, 20, color, "text", "left", OBJECTS[i].id, SELECTED.active == OBJECTS[i].id);
            //OBJECTS[i].name = text.newText;

        }

    }

    function footer() {
        UI_LOW_LEVEL.drawRectAbsolute(x1, y2, x2, y2-57, 0, COLORS.hylightGray, COLORS.hylightOutline, 10);

        var result = UI_TOOLS.dropDown(x1+10, y2-115, 40, IMAGES.ICONS.plus, [
            {"icon": IMAGES.ICONS.createSquare ,"name": "Rectangle"},
            {"icon": IMAGES.ICONS.createTriangle, "name": "Triangle"},
            {"icon": IMAGES.ICONS.createCircle, "name": "Circle"},
            {"icon": IMAGES.ICONS.createImage, "name": "Image"}
        ], -1, "outlinerDropDown", false, "Create");

        if(result > -1) {
            var data = {
                "pos": {x: 0, y: 0},
                "rotation": {z: 0},
                "dimensions": {width: 500, height: 500},
                "colors": {
                    "fill": "#ff0000",
                    "outline": "#af0000",
                    "outlineThickness": 0
                }
            }
            var newObject = null;
            switch(result) {
                case 0:
                    newObject = OBJECT_TOOLS.createColoredRect("New Rect", data.pos, data.rotation, data.dimensions, data.colors.fill, data.colors.outline, data.colors.outlineThickness);
                break;
                case 1:
                    newObject = OBJECT_TOOLS.createColoredTriangle("New Triangle", data.pos, data.rotation, data.dimensions, data.colors.fill, data.colors.outline, data.colors.outlineThickness);
                break;
                case 2:
                    newObject = OBJECT_TOOLS.createColoredElipse("New Circle", data.pos, data.rotation, data.dimensions, data.colors.fill, data.colors.outline, data.colors.outlineThickness);
                break;
                case 3:
                    newObject = OBJECT_TOOLS.createImage("New Image", data.pos, data.rotation, data.dimensions, "");
                break;
            }
            SELECTED.active = newObject.id;
        }
    }
}

function TIMELINE_VIEW(x1 = 0, y1 = 0, x2 = 0, y2 = 0, windowObject = WINDOW_TOOLS.windowTemplate, isMouseIn = false) {
    var settings = WINDOW_DATA.timeline_view;

    var headerHeight = 50;
    var bottomHeight = 35;
    x1 += 10;
    x2 -= 10;

    UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, COLORS.backgroundGray, "", 0);
    x1 -= 10;
    x2 += 10;

    var percent = (FRAMES.current - FRAMES.start) / (FRAMES.end-FRAMES.start);
    UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y1+headerHeight, 0, COLORS.hylightGray, COLORS.hylightOutline, 36);
    UI_LOW_LEVEL.drawRectAbsolute(x1, y2-(bottomHeight+8), x2, y2, 0, COLORS.hylightGray, COLORS.hylightOutline, 12);
    UI_LOW_LEVEL.drawLine(x1, y1+(headerHeight+9), x1 + percent*(x2-x1), y1+headerHeight + 9, "#457143", 17)

    x1 += 10;
    x2 -= 10;
    var middle = (x1+x2)/2;
    if(UI_TOOLS.buttonImage(IMAGES.ICONS.play, middle-19-20, y1+6, 38, 38)) {
        FRAMES.isPlaying = true;
    }
    if(UI_TOOLS.buttonImage(IMAGES.ICONS.pause, middle-19+20, y1+6, 38, 38)) {
        FRAMES.isPlaying = false;
    }

    if(UI_TOOLS.buttonImage(IMAGES.ICONS.skipRight, middle-19+65, y1+6, 38, 38)) {
        FRAMES.current = FRAMES.end;
    }
    if(UI_TOOLS.buttonImage(IMAGES.ICONS.skipLeft, middle-19-65, y1+6, 38, 38)) {
        FRAMES.current = FRAMES.start;
    }

    UI_LOW_LEVEL.drawText("Autokey", middle + 550, y1+32, 30, COLORS.normalTextColor, "left", "center");

    UNDO_TOOLS.startListening(`SETTINGS.animation.autoKeyframe`);

    SETTINGS.animation.autoKeyframe = UI_TOOLS.toggleBox(middle+510, y1+8, 30, SETTINGS.animation.autoKeyframe)

    UNDO_TOOLS.finishListening(`SETTINGS.animation.autoKeyframe`);
    /*UI_TOOLS.rectAbsolute(x1, y1, x2, y2, "", "", "", 0, null, DETAILED_PANEL_TOOLS.registerRegion("test_right", null, [
        {
            "name": "Tset Option 1", 
            "callback": function(arg1) {
                console.log(arg1);
            },
            "args": ["this is fun"]
        },
        {
            "name": "Tset Option 2", 
            "callback": function(arg1) {
                console.log(arg1);
            },
            "args": ["this is fun 2"]
        },
        {
            "name": "Tset Option 3", 
            "callback": function(arg1) {
                console.log(arg1);
            },
            "args": ["this is fun 3"]
        },
    ]))*/
    
    var totalFrames = FRAMES.end - FRAMES.start;
    var frameStart = Math.round(totalFrames*settings.zoom.min);
    var frameEnd = Math.round(totalFrames*settings.zoom.max);

    var offset = (totalFrames * settings.zoom.min % 1);

    var framesNeededToFit = frameEnd - frameStart;
    if(framesNeededToFit < 0.6) framesNeededToFit = 0.6;

    var weight = (MOUSE.pos.x-x1) / (x2-x1);

    var isDone = false;
    var smallestCount = (x2-x1) / framesNeededToFit;
    smallestCount = 50 / smallestCount;
    smallestCount = Math.floor(Math.ceil(smallestCount/1)*1.2);
    for(var i = frameStart; i <= frameEnd; i+= 1) {
        var lineThickness = 1;

        var percentThere = (i - frameStart) / (frameEnd - frameStart);
        var x = (percentThere * (x2-x1)) + x1;
        //console.log(((x2-x1) / (frameEnd - frameStart)))
        var c = ["red", "orange", "yellow", "green", "blue", "purple"];
        //c = c[i % c.length]

        var color = COLORS.hylightGray;
        if(i < FRAMES.current) color = brightenColor(COLORS.hylightGray, -5);
        
        var keyFrames = PROPERTIES_BACKEND.getKeysAtFrame(i);
        if(i == FRAMES.current) color = COLORS.activeKeyFrame;

        if(color != COLORS.hylightGray) {
            lineThickness+=1;
        }
        UI_LOW_LEVEL.drawRectAbsolute(x-lineThickness, y1+headerHeight+18, x+lineThickness, y2-bottomHeight-14, 0, color);
        if(color != COLORS.hylightGray) {
            lineThickness-=1;
        }

        if(Math.round(i % smallestCount) == 0 || i == FRAMES.end || i == FRAMES.start) {
            UI_LOW_LEVEL.drawText(i + FRAMES.start, x, y1+headerHeight+13, 15, "white", "center", "center")
        }
        
        if(keyFrames.length > 0) {
            var color = PROPERTIES_BACKEND.getKeyframeColor(keyFrames[0]);
            var interpolation = keyFrames[0].interpolation;
            var itemActions = [
                {
                    "name": "Delete Frame", 
                    "callback": function(frame) {
                        PROPERTIES_BACKEND.removeFramesAt(frame);
                    },
                    "args": [i]
                }
            ];

            if(interpolation == "SMOOTH") {
                itemActions.push({
                    "name": "Set To Linear",
                    "callback": function(frame) {
                        PROPERTIES_BACKEND.changeInterpolationForFrameAt(frame, "LINEAR")
                    },
                    "args": [i]
                });
            } else if(interpolation == "LINEAR") {
                itemActions.push({
                    "name": "Set To Smooth",
                    "callback": function(frame) {
                        PROPERTIES_BACKEND.changeInterpolationForFrameAt(frame, "SMOOTH")
                    },
                    "args": [i]
                });
            }

            if(UI_TOOLS.rectAbsolute(x-lineThickness*2, y1+headerHeight+24, x+lineThickness*2, y2-bottomHeight-14-6, color, "white", "MOVE_KEY_" + i,3, null, DETAILED_PANEL_TOOLS.registerRegion("keyframeDetail" + i, null, itemActions)) && !isDone) {
                var newFrame = Math.round(((1-weight)*frameStart) + (weight*frameEnd));
                PROPERTIES_BACKEND.changeAllKeyframeFrames(i, newFrame);
                isDone = true;
                ACTIVE_TOOL = "MOVE_KEY_" + (newFrame);
            }
            //color = "yellow"
        }
        
    }

    UI_LOW_LEVEL.drawRectAbsolute(x1+4, y2-bottomHeight-4-6, x2-4, y2-2, 0, COLORS.backgroundGray);
    
    var areaWidth = (x2-4) - (x1+4);
    var bottomBarMin = y2-bottomHeight-4;
    var bottomBarMax = y2-25;

    var button = {
        x1: ((x1+13) + areaWidth*settings.zoom.min),
        y: ((bottomBarMin+bottomBarMax)/2),

        x2: ((x1-13) + areaWidth*settings.zoom.max),

        radius: 5,
    }

    UI_LOW_LEVEL.drawRectAbsolute((x1+4) + areaWidth*settings.zoom.min, bottomBarMin, (x1+4) + areaWidth*settings.zoom.max, bottomBarMax, 0, COLORS.greyedOutTextColor);

    UI_LOW_LEVEL.drawCircle(button.x1, button.y, button.radius, COLORS.backgroundGray);
    UI_LOW_LEVEL.drawCircle(button.x2, button.y, button.radius, COLORS.backgroundGray);
    
    if(UI_TOOLS.rectAbsolute(button.x1-button.radius, button.y - button.radius, button.x1 + button.radius, button.y + button.radius, "rgba(0,0,0,0)", "rgba(0,0,0,0)", "ZOOM_MIN", 0)) {
        settings.zoom.min = ((MOUSE.pos.x-10) / areaWidth);
        UI_LOW_LEVEL.drawCircle(button.x1, button.y, button.radius, COLORS.hylightGray);
    }

    if(UI_TOOLS.rectAbsolute(button.x2-button.radius, button.y - button.radius, button.x2 + button.radius, button.y + button.radius, "rgba(0,0,0,0)", "rgba(0,0,0,0)", "ZOOM_MAX", 0)) {
        settings.zoom.max = (MOUSE.pos.x / areaWidth);
        UI_LOW_LEVEL.drawCircle(button.x2, button.y, button.radius, COLORS.hylightGray);
    }

    if(UI_TOOLS.rectAbsolute(((button.x1 + button.x2) / 2)-15, button.y - button.radius, ((button.x1 + button.x2) / 2) + 15, button.y + button.radius, COLORS.highlightOutline, COLORS.hylightGray, "ZOOM_SHIFT")) {
        var divide = (1600);
        var desiredShift = MOUSE.vel.x / divide;
        if(settings.zoom.min + desiredShift > 0 && settings.zoom.max+desiredShift < 1) {
            settings.zoom.min += desiredShift;
            settings.zoom.max += desiredShift;
        }
    }

    var number = Math.round((FRAMES.current / FRAMES.frameRate)*100)/100;
    if(number.toString().length == 1) number += ".00";
    if(number.toString().length == 3) number += "0";
    UI_LOW_LEVEL.drawText(number + "s", x2, y1+30, 25, "white", "right", "center");

    if(UI_LOW_LEVEL.isMouseIn(x1, y1+headerHeight, x2-4, y2-bottomHeight, 0) && MOUSE.isDown &&(ACTIVE_TOOL == "" || ACTIVE_TOOL == "KEY_CURRENT_SHIFT")) {
        FRAMES.current = Math.round(((1-weight)*frameStart) + (weight*frameEnd));
        ACTIVE_TOOL = "KEY_CURRENT_SHIFT";
    }

    if(MOUSE.hoveringWindow == "timeline_view") {
        if(MOUSE.scroll.velocity > 0) {
            settings.zoom.min -= 0.03;
            settings.zoom.max += 0.03;
        }
        if(MOUSE.scroll.velocity < 0) {
            var maxScroll = 0.1;
    
            settings.zoom.min += maxScroll * weight;
            settings.zoom.max -= maxScroll * (1-weight)
        }
    }

    if(settings.zoom.max > 1) settings.zoom.max = 1;
    if(settings.zoom.min < 0) settings.zoom.min = 0;

    var minZoom = 0.04;
    if(settings.zoom.min > settings.zoom.max) settings.zoom.min = settings.zoom.max;
    if(settings.zoom.max - settings.zoom.min < minZoom) {
        var average = (settings.zoom.max + settings.zoom.min) / 2;

        settings.zoom.min = average-(minZoom/2);
        settings.zoom.max = average+(minZoom/2);

    }
}

function PROPERTY_VIEW(x1 = 0, y1 = 0, x2 = 0, y2 = 0, windowObject = WINDOW_TOOLS.windowTemplate, isMouseIn = false) {
    var windowData = WINDOW_DATA.properties_view;
    windowData.smoothScrollPosition += (windowData.scrollPosition - windowData.smoothScrollPosition) / 10;

    var UNDOS = [];

    UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, COLORS.backgroundGray, "", 0);

    var height = 0;
    //HEADER
    var headerHeight = 65;
    function drawHeader() {
        UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y1+headerHeight, 0, COLORS.hylightGray, COLORS.hylightOutline, 12);
        UI_LOW_LEVEL.drawText("Properties", (x2+x1)/2, (y1+y1+headerHeight)/2, 35, COLORS.normalTextColor, "center", "center");

        if(UI_TOOLS.buttonText("Scene", x1, y1+headerHeight-19, (x2-x1)/2, 25, (windowData.mode == 0 ? "prop_object" : ""), false, {"default": COLORS.highlightOutline, "hylighted": COLORS.backgroundGray})) {
            windowData.mode = 0;
        }

        if(UI_TOOLS.buttonText("Object", x2- (x2-x1)/2, y1+headerHeight-19, (x2-x1)/2, 25, (windowData.mode == 1 ? "prop_scene" : ""),false, {"default": COLORS.highlightOutline, "hylighted": COLORS.backgroundGray})) {
            windowData.mode = 1;
        }

    }

    var display = {
    }

    var spacingData = {
        "defaultItemHeight": 30,
        "x1": x1+5,
        "x2": 0
    }
    spacingData.x2 = spacingData.x1 + 15;

    function mainRenderer() {
        var mainBoxes = getJsonCategories(display);
        height = y1+headerHeight+12 + windowData.smoothScrollPosition;

        for(var ii = 0; ii < mainBoxes.length; ii++) {
            var boxID = mainBoxes[ii];
            var boxData = display[boxID];
            var items = getJsonCategories(boxData);
            var boxSettings = {
                "color": brightenColor(COLORS.slightlyDarkerBackgroundGray, -10)
            }

            for(var i = 0; i < items.length; i++) {
                if(typeof(items[i]) == "string" && items[i][0] == "#") {
                    boxSettings[items[i].substring(1)] = boxData[items[i]];
                    items.splice(i, 1);
                    i--;
                }
            }

            var estimatedHeight = spacingData.defaultItemHeight*items.length+10;
            for(var i = 0; i < items.length; i++) {
                if(typeof(items[i]) == "string" && items[i][0] == "-") {
                    estimatedHeight += boxData[items[i]]
                }
            }

            height += 15;
            UI_LOW_LEVEL.drawText(boxID[0].toUpperCase() + boxID.substring(1), spacingData.x1, height, 15, COLORS.normalTextColor, "left", "center");
            height += 10;

            UI_LOW_LEVEL.drawRectLocal(spacingData.x1, height, (x2 - x1) - spacingData.x1, estimatedHeight, 0, COLORS.slightlyDarkerBackgroundGray, "", 0, [{"name": "drop-shadow", "value": "0px 0px 2px rgba(0,0,0,0.48)"}]);
            UI_LOW_LEVEL.drawRectLocal(spacingData.x1, height, 6, estimatedHeight, 0, boxSettings.color)

            height += 15;
            for(var j = 0; j < items.length; j++) {
                var itemID = items[j];
                var itemData = boxData[itemID];
                
                UNDOS.push(UNDO_TOOLS.startListening(itemData.undo == null ? itemData.property : itemData.undo));

                if(itemID[0] == "-") {
                    height += itemData;
                } else {
                    var offsetX = 0;
                    var data = [ 
                    ];

                    if(itemData.property) {
                        var property = PROPERTIES_BACKEND.getPropertyAtPath(itemData.property);

                        data.push({
                            "name": "Keyframe \"" + professionalCamelCase(itemID) + "\"",
                            "callback": function(d, id, property) {
                                property.keyFrame();
                            },
                            "args": [itemData, itemID, property]
                        })
                        offsetX += 10;
                        if(property == null) {
                        } else {
                            var currentKeyFrame = property.getKeyAtFrame(FRAMES.current);
                            var keyColor = PROPERTIES_BACKEND.getKeyframeColor(currentKeyFrame);
                            if(currentKeyFrame == null) {
                                var lastKeyframe = property.getLastKeyframe(FRAMES.current);
                                keyColor = setAlpha(PROPERTIES_BACKEND.getKeyframeColor(lastKeyframe), 0.5);
                            } else {
                                data.push({
                                    "name": "Delete Keyframe",
                                    "callback": function(property) {
                                        property.removeFrames(FRAMES.current);
                                    },
                                    "args": [property]
                                })
                            }
                            data.push({
                                "name": "Clear All Keyframes",
                                "callback": function(property) {
                                    property.clearAll();
                                },
                                "args": [property]
                            })
                            UI_LOW_LEVEL.drawCircle(spacingData.x2, height+3, 6, keyColor, COLORS.highlightOutline, 3);
                            if(UI_LOW_LEVEL.isMouseIn(spacingData.x2 - 3, height, spacingData.x2 + 3, height + 4, 5) && MOUSE.isClick) {
                                property.keyFrame();
                            }
                        }
                        
                    }
                    var textData = UI_LOW_LEVEL.calculateTextSpace(professionalCamelCase(itemID) + ":", spacingData.x2 + offsetX, height, 20, COLORS.normalTextColor, "left");
                    UI_LOW_LEVEL.drawText(professionalCamelCase(itemID) + ":", spacingData.x2 + offsetX, height+10, 20, property == null ? COLORS.normalTextColor : (property.keyframes.length == 0 ? COLORS.normalTextColor : "#b2ceff"), "left", "center");

                    var startX = spacingData.x2 + textData.width + 5 + offsetX;
                    var oldValue = itemData.value;
                    itemData.value = value(startX, height-8, (x2-10), height + 16);
                    if(itemData.value != oldValue && oldValue != null && isMouseIn) {
                        if(SETTINGS.animation.autoKeyframe && itemData.property) {
                            PROPERTIES_BACKEND.keyframeAtPath(itemData.property)
                        }
                    }
                    DETAILED_PANEL_TOOLS.registerRegion("prop_data_" + itemID, {x1: spacingData.x2, y1: height - spacingData.defaultItemHeight / 3, x2: (x2-5), y2: height + spacingData.defaultItemHeight/3+5}, data)

                    function value(x1, y1, x2, y2) {
                        var id = "propertiesPanel" + windowObject.id + itemID;
                        switch(itemData.type) {
                            case "string":
                                var text = UI_TOOLS.textField(x1, y1, (x2-x1), (y2-y1), itemData.value, "string", 20, {textColor: COLORS.normalTextColor, backgroundColor: COLORS.backgroundGray, border: "grey"}, id);
                                return text;

                            case "object-selector":
                                return UI_TOOLS.chooserDropdown(x1, y1, (x2-x1), (y2-y1), itemData.value, id, UI_TOOLS.choserDropdownDataGiver("objects"));

                            case "object-type-selector":
                                return UI_TOOLS.chooserDropdown(x1, y1, (x2-x1), (y2-y1), itemData.value, id, UI_TOOLS.choserDropdownDataGiver("object-types"))

                            case "int":
                                return UI_TOOLS.textField(x1+5, y1, (x2-x1), (y2-y1), itemData.value, "int", 20, {textColor: COLORS.normalTextColor, backgroundColor: COLORS.backgroundGray, border: "grey"}, id)
                            
                            case "float":
                                return UI_TOOLS.textField(x1+5, y1, (x2-x1), (y2-y1), itemData.value, "float", 20, {textColor: COLORS.normalTextColor, backgroundColor: COLORS.backgroundGray, border: "grey"}, id)
                                
                            case "color":
                                return UI_TOOLS.colorPicker(x1+5, y1, (x2-x1), (y2-y1), itemData.value, id);

                            case "image":
                                return UI_TOOLS.userImageChooser(x1+5, y1, (x2-x1), (y2-y1), itemData.value, id)

                            case "bool":
                                return UI_TOOLS.toggleBox(x1+5, y1, 25, itemData.value)
                            break;
                            default:
                                UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, "red");
                            break;
                        }
                        return itemData.value;
                    }

                }

                
                boxData[itemID] = itemData;

                height += spacingData.defaultItemHeight;
            }
            display[boxID] = boxData;
            height += 15;
        }
    }

    function applyPossibleUndo() {
        for(var i = 0; i < UNDOS.length; i++) {
            UNDO_TOOLS.finishListening(UNDOS[i]);
        }
    }

    /////////////////////////////////////////////

    function prepareObjectProperties() {
        //body
        var selectedObject = OBJECT_TOOLS.getObject(SELECTED.active);
        if(selectedObject == null) return;

        display = {
            "root": {
                "#color": "#528edd",
                "objectName": {value: selectedObject.name, type: "string", undo: `OBJECTS.${selectedObject.id}.name`},
                "parent": {value: selectedObject.parent, type: "object-selector", undo: `OBJECTS.${selectedObject.id}.parent`},
                "type": {value: selectedObject.type, type: "object-type-selector", undo: `OBJECTS.${selectedObject.id}.type`}
            },
            "transform": {
                "#color": "#45ec7a",
                "x": {value: selectedObject.pos.x, type: "int", property: `OBJECTS.${selectedObject.id}.pos.x`},
                "y": {value: selectedObject.pos.y, type: "int", property: `OBJECTS.${selectedObject.id}.pos.y`},
                "order": {value: selectedObject.pos.z, type: "int", undo: `OBJECTS.${selectedObject.id}.pos.z`},
                "-space": 0,
                "rotation": {value: selectedObject.rotation.z, type: "int", property: `OBJECTS.${selectedObject.id}.rotation.z`},
                "-space1": 0,
                "scaleX": {value: selectedObject.scale.x, type: "float", property: `OBJECTS.${selectedObject.id}.scale.x`},
                "scaleY": {value: selectedObject.scale.y, type: "float", property: `OBJECTS.${selectedObject.id}.scale.y`},
            }
        }

        //selected
        if(selectedObject.type.substring(0, 7) == "colored") {
            display.colored = {
                "#color": "#ec9345",
                "fillColor": {value: selectedObject.fillColor, type: "color", property: `OBJECTS.${selectedObject.id}.fillColor`},
                "outlineColor": {value: selectedObject.outlineColor, type: "color", property: `OBJECTS.${selectedObject.id}.outlineColor`},
                "outlineThickness": {value: selectedObject.outlineThickness, type: "int", property: `OBJECTS.${selectedObject.id}.outlineThickness`}
            }
        }

        if(selectedObject.type == "image") {
            display.image = {
                "#color": "#ff51ee",
                "src": {value: selectedObject.imgID, type: "image", property: `OBJECTS.${selectedObject.id}.imgID`}
            }
        }

        return selectedObject;
    }

    function drawObjectProperties(selectedObject) {
        
        var filters = selectedObject.filters;

        var filterData = {
            "blur": {
                "size": {"min": 0, "type": "int", "measure": "px", "default": 0},
                "#customHeight": 0,
            },
            "brightness": {
                "percent": {"type": "int", "measure": "%", "default": 100}
            },
            "contrast": {
                "percent": {"type": "int", "measure": "%", "default": 100}
            },
            "drop-shadow": {
                "offsetX": {"type": "int", "measure": "px", "default": 0},
                "offsetY": {"type": "int", "measure": "px", "default": 0},
                "blurSize": {"type": "int", "measure": "px", "default": 0},
                "color": {"type": "color", "measure": "", "default": "#000000"},
            },
            "grayscale": {
                "percent": {"type": "int", "measure": "%", "default": 100}
            },
            "hue-rotate": {
                "angle": {"type": "int", "measure": "deg", "default": 0}
            },
            "invert": {
                "percent": {"type": "int", "measure": "%", "default": 100}
            },
            "opacity": {
                "percent": {"type": "int", "measure": "%", "default": 100}
            },
            "saturate": {
                "percent": {"type": "int", "measure": "%", "default": 100}
            },
            "sepia": {
                "percent": {"type": "int", "measure": "%", "default": 100}
            },
            /*"array": {
                "count": {"type": "int", "measure": "", "default": 0},
                "offsetX": {"type": "int", "measure": "px", "default": 0},
                "offsetY": {"type": "int", "measure": "px", "default": 0}
            }*/
        }

        var filterTypes = getJsonCategories(filterData);

        var predictedHeight = ((filters.length) * 64)+40;

        for(var i = 0; i < filters.length; i++) {
            var data = filterData[filters[i].name];
            var dataItems = getJsonCategories(data);
            for(var x = 0; x < dataItems.length; x++) {
                if(dataItems[x][0] == "#") {
                    switch(dataItems[x].substring(1)) {
                        case "customHeight":
                            predictedHeight += data[dataItems[x]];
                        break;
                    }
                }
            }
        }

        for(var i = 0; i < filters.length; i++) {
            var data = filterData[filters[i].name];

            var itemHeight = 58;
            var items = getJsonCategories(data);
            for(var j = 1; j < items.length; j++) {
                if(items[j][0] != "#") predictedHeight += 32;
            }
        }

        height+= 15;
        UI_LOW_LEVEL.drawText("Filters", spacingData.x1, height, 15, COLORS.normalTextColor, "left", "center");
        height+= 10;
        UI_LOW_LEVEL.drawRectAbsolute(spacingData.x1, height, x2 - 5, height+predictedHeight, 0, COLORS.slightlyDarkerBackgroundGray);
        UI_LOW_LEVEL.drawRectLocal(spacingData.x1, height, 6, predictedHeight, 0, "#40f6d0");


        if(UI_TOOLS.rectAbsolute(spacingData.x1+16, height +5, x2 - 5-16, height + 35, "#151515", "white", "new_filter") && MOUSE.isClick) {
            filters.push({"name": "blur", "value": "0px"});

            UNDO_TOOLS.addUndoStep(`splice OBJECTS.${selectedObject.id}.filters ${filters.length - 1} 1`);
            selectedObject.filters = filters;
        }
        UI_LOW_LEVEL.drawText("NEW", (spacingData.x1 + x2) / 2, (height + 10 + height + 46) / 2-4, 15, "white", "center", "center");

        height += 30+10;

        for(var i = 0; i < filters.length; i++) {
            var data = filterData[filters[i].name];

            var itemHeight = 58;
            var items = getJsonCategories(data);
            for(var j = 1; j < items.length; j++) {
                if(items[j][0] != "#") itemHeight += 32;
            }

            UI_LOW_LEVEL.drawRectAbsolute(spacingData.x1 + 16, height, x2 - 10, height + itemHeight, 0, "#171717");
            var itemSpace = {
                x1: spacingData.x1 + 16+4,
                y1: height+4,
                x2: x2-10,
                y2: height + itemHeight
            }

            var dataItems = [];
            for(var ii = 0; ii < filterTypes.length; ii++) {
                dataItems.push({"value": filterTypes[ii]});
            }



            var text = UI_LOW_LEVEL.drawText("Type:", itemSpace.x1, itemSpace.y1+3, 20, "white", "left", "top");
            if(filters[i]) {
                var buttonWidth = 25;
                if(i > 0) {
                    buttonWidth += 25;
                }
                if(i < filters.length - 1) {
                    buttonWidth += 25;
                }
                

                var option = UI_TOOLS.chooserDropdown(itemSpace.x1+3 + text.width, itemSpace.y1, itemSpace.x2 - (itemSpace.x1+3 + text.width) - 4 - buttonWidth, 25, filters[i].name, "filter_" + i, dataItems);
                filters[i].name = option;
                
                var buttonPos = 0;

                if(UI_TOOLS.buttonImage(IMAGES.ICONS.crossWithBackground, itemSpace.x1+3 + text.width + itemSpace.x2 - (itemSpace.x1 + text.width) - 30 - buttonPos, itemSpace.y1, 25, 25)) {
                    var deleted = filters.splice(i, 1);
                    i--;
                    var step = `push OBJECTS.${selectedObject.id}.filters ${JSON.stringify(deleted[0]).replace(/ /g, '_')}`;
                    UNDO_TOOLS.addUndoStep(step)
                    return;
                }


                if(i > 0) {
                    buttonPos += 26;
                    if(UI_TOOLS.buttonImage(IMAGES.ICONS.upWithBackground, itemSpace.x1+3 + text.width + itemSpace.x2 - (itemSpace.x1 + text.width) - 30-buttonPos, itemSpace.y1, 25, 25)) {
                        var above = copyJson(filters[i-1]);
                        filters[i-1] = copyJson(filters[i]);
                        filters[i] = above;
                        return;
                    }
                }
                if(i < filters.length - 1) {
                    buttonPos += 26;
                    if(UI_TOOLS.buttonImage(IMAGES.ICONS.downWithBackground, itemSpace.x1+3 + text.width + itemSpace.x2 - (itemSpace.x1 + text.width) - 30-buttonPos, itemSpace.y1, 25, 25)) {
                        var above = copyJson(filters[i+1]);
                        filters[i+1] = copyJson(filters[i]);
                        filters[i] = above;
                        return;
                    }
                }

                var filterValues = filters[i].value.split(" ");

                var items = getJsonCategories(data);
                for(var j = 0; j < items.length; j++) {
                    if(items[j][0] != "#") {
                        itemData = data[items[j]]
                        var offsetX = 0;
                        itemData.value = filterValues[j]

                        var property = PROPERTIES_BACKEND.getPropertyAtPath(itemData.property);
                        
                        var textData = UI_LOW_LEVEL.calculateTextSpace(professionalCamelCase(items[j]) + ":", itemSpace.x1 + offsetX, height+40 + (j*32), 20, COLORS.normalTextColor, "left");
                        UI_LOW_LEVEL.drawText(professionalCamelCase(items[j]) + ":", itemSpace.x1 + offsetX, height+10+40 + (j*32), 20, property == null ? COLORS.normalTextColor : (property.keyframes.length == 0 ? COLORS.normalTextColor : "#b2ceff"), "left", "center");

                        
                        if(itemData.value == null) itemData.value = itemData.default.toString();
                        itemData.value = itemData.value.replace(itemData.measure, "");

                        var startX = itemSpace.x1 + textData.width + 5 + offsetX;
                        var oldValue = itemData.value;
                        itemData.value = value(startX, height-8+40 + (j*32), (itemSpace.x2-10), height+ (j*32) + 16+40);
                        if(itemData.value != oldValue && oldValue != null && isMouseIn) {
                            if(SETTINGS.animation.autoKeyframe && itemData.property) {
                                PROPERTIES_BACKEND.keyframeAtPath(itemData.property)
                            }
                        }

                        if(itemData.min && itemData.min > itemData.value) {
                            itemData.value = itemData.min
                        }

                        itemData.value = itemData.value.toString()
                        itemData.value += itemData.measure;
                        filterValues[j] = itemData.value;
                        
                        //DETAILED_PANEL_TOOLS.registerRegion("prop_data_" + itemID, {x1: spacingData.x2, y1: height - spacingData.defaultItemHeight / 3, x2: (x2-5), y2: height + spacingData.defaultItemHeight/3+5}, data)

                        function value(x1, y1, x2, y2) {
                            var id = "propertiesPanel" + windowObject.id + i+ j;
                            switch(itemData.type) {
                                case "string":
                                    var text = UI_TOOLS.textField(x1, y1, (x2-x1), (y2-y1), itemData.value, "string", 20, {textColor: COLORS.normalTextColor, backgroundColor: COLORS.backgroundGray, border: "grey"}, id);
                                    return text;

                                case "object-selector":
                                    return UI_TOOLS.chooserDropdown(x1, y1, (x2-x1), (y2-y1), itemData.value, id, UI_TOOLS.choserDropdownDataGiver("objects"));

                                case "object-type-selector":
                                    return UI_TOOLS.chooserDropdown(x1, y1, (x2-x1), (y2-y1), itemData.value, id, UI_TOOLS.choserDropdownDataGiver("object-types"))

                                case "int":
                                    return UI_TOOLS.textField(x1+5, y1, (x2-x1), (y2-y1), itemData.value, "int", 20, {textColor: COLORS.normalTextColor, backgroundColor: COLORS.backgroundGray, border: "grey"}, id)
                                
                                case "float":
                                    return UI_TOOLS.textField(x1+5, y1, (x2-x1), (y2-y1), itemData.value, "float", 20, {textColor: COLORS.normalTextColor, backgroundColor: COLORS.backgroundGray, border: "grey"}, id)
                                    
                                case "color":
                                    return UI_TOOLS.colorPicker(x1+5, y1, (x2-x1), (y2-y1), itemData.value, id);

                                case "image":
                                    return UI_TOOLS.userImageChooser(x1+5, y1, (x2-x1), (y2-y1), itemData.value, id)

                                default:
                                    UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, "red");
                                break;
                            }
                            return itemData.value;
                        }

                        if(j > 0 && j < items.length-1) {
                            //height += 32;
                        }
                    }
                }

                filters[i].value = filterValues.join(" ")
            }
            height += 5
            
            height += itemHeight;

        }

        selectedObject.filters = filters;

        //UI_LOW_LEVEL.drawRectLocal(spacingData.x1, height, (x2 - x1) - spacingData.x1, estimatedHeight, 0, COLORS.slightlyDarkerBackgroundGray, "", 0, [{"name": "drop-shadow", "value": "0px 0px 2px rgba(0,0,0,0.48)"}]);
        //UI_LOW_LEVEL.drawRectLocal(spacingData.x1, height, 6, estimatedHeight, 0, boxSettings.color)


        if(isMouseIn || active_ui.colorField.id != null || active_ui.imgField.key != null) {

            selectedObject.name = display.root.objectName.value;
            
            selectedObject.parent = display.root.parent.value;
            selectedObject.type = display.root.type.value;
        
            selectedObject.pos.x = display.transform.x.value;
            selectedObject.pos.y = display.transform.y.value;
            selectedObject.pos.z = display.transform.order.value;
            
            selectedObject.rotation.z = display.transform.rotation.value;
            
            selectedObject.scale.x = display.transform.scaleX.value;
            selectedObject.scale.y = display.transform.scaleY.value;

            if(display.image) {
                selectedObject.imgID = display.image.src.value;

            }

            if(display.colored) {
                selectedObject.outlineThickness = display.colored.outlineThickness.value;

                selectedObject.fillColor = display.colored.fillColor.value;
                selectedObject.outlineColor = display.colored.outlineColor.value;
            }
        }
    }

    function prepareSceneProperties() {
        display = {
            "camera": {
                "#color": "#ff3030",
                "cameraX": {value: CAMERA.x, type: "int", property: "CAMERA.x"},
                "cameraY": {value: CAMERA.y, type: "int", property: "CAMERA.y"},
                "-space0": 0,
                "cameraWidth": {value: CAMERA.width, type: "int", undo: "CAMERA.width"},
                "cameraHeight": {value: CAMERA.height, type: "int", undo: "CAMERA.height"},
            },
            "animation": {
                "#color": "#e1d446",
                "startFrame": {value: FRAMES.start, type: "int", undo: "FRAMES.start"},
                "endFrame": {value: FRAMES.end, type: "int", undo: "FRAMES.end"},
                "framesPerSecond": {value: FRAMES.frameRate, type: "int", undo: "FRAMES.frameRate"},
            },
            "scene": {
                "#color": "#36d6e3",
                "showSkyColor": {value: SETTINGS.scene_view.showSkyColor, type: "bool", undo: "SETTINGS.scene_view.showSkyColor"},
                "showGrid": {value: SETTINGS.scene_view.showGrid, type: "bool", undo: "SETTINGS.scene_view.showGrid"},
                "showCamera": {value: SETTINGS.scene_view.showCamera, type: "bool", undo: "SETTINGS.scene_view.showCamera"},
                "showSceneStats": {value: SETTINGS.scene_view.showStats, type: "bool", undo: "SETTINGS.scene_view.showStats"},
                "-space0": 0,
                "skyColor": {value: SETTINGS.rendering.skyColor, type: "color", property: "SETTINGS.rendering.skyColor"},

            }
        }
    }

    function drawSceneProperties() {
        CAMERA.x = display.camera.cameraX.value;
        CAMERA.y = display.camera.cameraY.value;
        
        CAMERA.width = display.camera.cameraWidth.value;
        CAMERA.height = display.camera.cameraHeight.value;


        FRAMES.start = display.animation.startFrame.value;
        FRAMES.end = display.animation.endFrame.value;
        FRAMES.frameRate = display.animation.framesPerSecond.value;


        SETTINGS.rendering.skyColor = display.scene.skyColor.value;
        SETTINGS.scene_view.showSkyColor = display.scene.showSkyColor.value;
        SETTINGS.scene_view.showCamera = display.scene.showCamera.value;
        SETTINGS.scene_view.showGrid = display.scene.showGrid.value;
        SETTINGS.scene_view.showStats = display.scene.showSceneStats.value;

    }

    ////////////////////////////////////////////
    
    var passAlong = null;
    switch(windowData.mode) {
        case 0: 
            prepareSceneProperties();
        break;
            passAlong = prepareObjectProperties();
        case 1:
            passAlong = prepareObjectProperties();
            break;
    }
    mainRenderer();

    switch(windowData.mode) {
        case 0: 
            drawSceneProperties();
        break;
        case 1:
            if(passAlong) {
                var l = passAlong.filters.length;
                var id = passAlong.id;
                for(var i = 0; i < l; i++) {
                    if(OBJECT_TOOLS.getObject(id).filters[i]) {
                        UNDO_TOOLS.startListening(`OBJECTS.${id}.filters.${i}.name`);
                        UNDO_TOOLS.startListening(`OBJECTS.${id}.filters.${i}.value`);
                    }
                }
                passAlong = drawObjectProperties(passAlong);
                for(var i = 0; i < l; i++) {
                    if(OBJECT_TOOLS.getObject(id).filters[i]) {
                        UNDO_TOOLS.finishListening(`OBJECTS.${id}.filters.${i}.name`);
                        UNDO_TOOLS.finishListening(`OBJECTS.${id}.filters.${i}.value`);
                    }
                }
            }
            
            break;
    }
    //onsole.log(UNDOS)
    applyPossibleUndo();

    var mousePercent = (MOUSE.pos.y - y1) / (y2-y1);
        if(!isMouseIn) mousePercent = 0.5;
        mousePercent = (Math.max(0, Math.min(mousePercent, 1)));

        var extraPixels = 0-((y2-y1)-height);

        if(extraPixels > 0) {
            if(mousePercent > 0.75) {
                windowData.scrollPosition -= map(mousePercent, 0.75, 1, 5, 15);
            }
            
        }
        if(windowData.scrollPosition < 0) {
            if(mousePercent < 0.25) {
                windowData.scrollPosition -= map(mousePercent, 0.75, 1, 5, 10);
            }
        }

    drawHeader();

    WINDOW_DATA.properties_view = windowData;
}

function RENDER_VIEW(x1 = 0, y1 = 0, x2 = 0, y2 = 0, windowObject = WINDOW_TOOLS.windowTemplate, isMouseIn = false) {
    UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, SETTINGS.rendering.skyColor, "green");
    isMouseIn = false;
    OBJECTS.sort(ZSort);
    
    
    var sceneLocal0x0 = {
        x: windowObject.init.center.x,
        y: windowObject.init.center.y
    };

    var sceneOffset = {"pos": sceneLocal0x0, "scale": WINDOW_DATA.scene_view.zoomLevel};

    sceneOffset.pos.x += CAMERA.width / 2;
    sceneOffset.pos.y += CAMERA.height / 2;

    sceneOffset.pos.x -= CAMERA.x;
    sceneOffset.pos.y -= CAMERA.y;

    for(var i = 0; i < OBJECTS.length; i++) {
        ON_OBJECT_PRE_RENDER(OBJECTS[i], sceneOffset, {x1: x1, y1: y1, x2: x2, y2: y2}, isMouseIn, worldTransform);
    }

    var worldTransform = OBJECT_TOOLS.caculateAllWordTransforms();
    
    for(var i = 0; i < OBJECTS.length; i++) {
        OBJECTS[i].pos.x = Math.round(OBJECTS[i].pos.x*10)/10;
        OBJECTS[i].pos.y = Math.round(OBJECTS[i].pos.y*10)/10;
        ON_OBJECT_RENDER(OBJECTS[i], sceneOffset, {x1: x1, y1: y1, x2: x2, y2: y2}, isMouseIn, worldTransform);
    }
    function ZSort(a, b) {

        if (a.pos.z < b.pos.z) return -1;
        if (a.pos.z > b.pos.z) return 1;
       
        return 0;
    }
}

//////////////////////////////
function ON_OBJECT_PRE_RENDER(object = OBJECT_TOOLS.objectTemplate, sceneOffset = {"pos": {x: 0, y: 0}, "scale": 1}, windowDimensions = {x1: 0, y1: 0, x2: 0, y2: 0}, isInWindow, worldPosition = {}) {
    var worldTransform = worldPosition[object.id];
    object = copyJson(object);
    if(worldTransform != null) {
        object.pos = copyJson(worldTransform.pos);
        object.rotation = copyJson(worldTransform.rotation);
        object.scale = copyJson(worldTransform.scale)
    }

    var x = object.pos.x * sceneOffset.scale;
    var y = object.pos.y * sceneOffset.scale;

    var width = object.dimensions.width * sceneOffset.scale;
    var height = object.dimensions.height * sceneOffset.scale;

    var leftCorner = {x: (x - (width/2)), y: (y - (height/2))};

    leftCorner.x += sceneOffset.pos.x;
    leftCorner.y += sceneOffset.pos.y;

    if(SELECTED.active == object.id || SELECTED.other.indexOf(object.id) > -1) {
        if(ACTIVE_TOOL == "MOVE_X" || KEYS_DOWN_UNTIL_CLICK.indexOf("x") > -1 && KEYS_DOWN_UNTIL_CLICK.indexOf("g") > -1) {
            var yy = (leftCorner.y + leftCorner.y+ height)/2;
            UI_LOW_LEVEL.drawRectLocal(0, yy-5*sceneOffset.scale, INFO_CANVAS.width, 10*sceneOffset.scale, 0, "pink")
        }

        if(ACTIVE_TOOL == "MOVE_Y" || KEYS_DOWN_UNTIL_CLICK.indexOf("y") > -1 && KEYS_DOWN_UNTIL_CLICK.indexOf("g") > -1) {
            var xx = (leftCorner.x + leftCorner.x+ width)/2;
            UI_LOW_LEVEL.drawRectLocal(xx-5*sceneOffset.scale, 0, 10*sceneOffset.scale, INFO_CANVAS.width, 0, "cyan")
        }
    }
}

function ON_OBJECT_RENDER(object = OBJECT_TOOLS.objectTemplate, sceneOffset = {"pos": {x: 0, y: 0}, "scale": 1}, windowDimensions = {x1: 0, y1: 0, x2: 0, y2: 0}, isInWindow, worldPosition = {}) {
    var worldTransform = worldPosition[object.id];
    object = copyJson(object);
    if(worldTransform != null) {
        object.pos = copyJson(worldTransform.pos);
        object.rotation = copyJson(worldTransform.rotation);
        object.scale = copyJson(worldTransform.scale)
    }
    var x = object.pos.x * sceneOffset.scale;
    var y = object.pos.y * sceneOffset.scale;

    var width = object.dimensions.width * sceneOffset.scale;
    var height = object.dimensions.height * sceneOffset.scale;

    
    width *= object.scale.x;
    height *= object.scale.y;

    var leftCorner = {x: (x - (width/2)), y: (y - (height/2))};

    leftCorner.x += sceneOffset.pos.x;
    leftCorner.y += sceneOffset.pos.y;

    /*var cutX = Math.max(leftCorner.x, windowDimensions.x1);
    var cutY = Math.max(leftCorner.y, windowDimensions.y1);

    var cutX2 = Math.min(leftCorner.x + object.dimensions.width, windowDimensions.x2);
    var cutY2 = Math.min(leftCorner.y + object.dimensions.height, windowDimensions.y2);

    cutX2 = Math.max(cutX2, cutX);
    cutY2 = Math.max(cutY2, cutY);*/

    var filters = [];

    for(var i = 0; i < object.filters.length; i++) {
        filters.push(object.filters[i]);
    }

    var selectColor = COLORS.selectionActive;
    var sideColor = COLORS.selectionBackground;

    if(SELECTED.active == object.id) {
        filters.push({"name": "drop-shadow", "value": "0px 0px 15px " + selectColor});
    } else if(SELECTED.other.indexOf(object.id) > -1) {
        filters.push({"name": "drop-shadow", "value": "10px 10px 15px " + sideColor});
    }

    if(!object.isEnabled) return;

    if(object.parent != "") {
        var pa = OBJECT_TOOLS.getObject(object.parent);
        //UI_LOW_LEVEL.drawLine(pa.pos.x * sceneOffset.scale + sceneOffset.pos.x, pa.pos.y * sceneOffset.scale + sceneOffset.pos.y, leftCorner.x, leftCorner.y, "red", 4)
    }
    
    switch(object.type) {
        case OBJECT_TYPES.colored_rect:
            UI_LOW_LEVEL.drawRectLocal(leftCorner.x, leftCorner.y, width, height, object.rotation.z, object.fillColor, object.outlineColor, object.outlineThickness*sceneOffset.scale, filters);//Math.min(cutX, cutX2), Math.min(cutY, cutY2), cutX2, cutY2, object.fillColor);
        break;
        case OBJECT_TYPES.colored_elipse:
            UI_LOW_LEVEL.drawElipse(leftCorner.x, leftCorner.y, width, height, object.rotation.z, object.fillColor, object.outlineColor, object.outlineThickness*sceneOffset.scale, true, filters);
        break;
        case OBJECT_TYPES.colored_triangle:
            UI_LOW_LEVEL.drawTriangle(leftCorner.x, leftCorner.y, width, height, object.rotation.z, object.fillColor, object.outlineColor, object.outlineThickness*sceneOffset.scale, object.triangleTipPosition, filters)
        break;
        case OBJECT_TYPES.image:
            UI_LOW_LEVEL.drawImage(object.imgID, leftCorner.x, leftCorner.y, width, height, object.rotation.z, filters);
        break;
    }

    if(isInWindow && MOUSE.postClick && UI_LOW_LEVEL.isMouseIn(leftCorner.x, leftCorner.y, leftCorner.x + width, leftCorner.y + height, 0) && ACTIVE_TOOL == "") {
        calcualteSelection(object.id);
        
    }
}

function RENDER_OBJECT_LOCALLY(object = OBJECT_TOOLS.objectTemplate, x1, y1, x2, y2) {
    switch(object.type) {
        case OBJECT_TYPES.colored_rect:
            UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, object.fillColor, object.outlineColor, 5, []);//Math.min(cutX, cutX2), Math.min(cutY, cutY2), cutX2, cutY2, object.fillColor);
        break;
        case OBJECT_TYPES.colored_elipse:
            UI_LOW_LEVEL.drawElipse(x1, y1, x2-x1, y2-y1, 0, object.fillColor, object.outlineColor, 5, true, []);
        break;
        case OBJECT_TYPES.colored_triangle:
            UI_LOW_LEVEL.drawTriangle(x1, y1, x2-x1, y2-y1, 0, object.fillColor, object.outlineColor, 5, object.triangleTipPosition, [])
        break;
        case OBJECT_TYPES.image:
            UI_LOW_LEVEL.drawImage(object.imgID, x1, y1, x2-x1, y2-y1, 0, []);
        break;
    }
}

////////////////////////////////////

function ON_DETAILED_PANEL_RENDER() {
    var buffer = 5;
    var itemHeight = 35;

    var initialXOffset = 20;
    var iconXOffset = 32;
    var textSize = 23;
    var linkedObject = OPENED_PANEL.linkedObject;
    
    if(linkedObject.items.length == 0 || linkedObject.items.length == null) {
        OPENED_PANEL = null;
        ACTIVE_TOOL = "";
        MOUSE.isDown = false;
        MOUSE.isClick = false;
        return;
    }

    var actualOffset = initialXOffset;
    if(linkedObject.items[0].icon != null) actualOffset += iconXOffset;

    var startX = OPENED_PANEL.pos.x + actualOffset;


    var widths = 0;
    for(var i = 0; i < linkedObject.items.length; i++) {
        var w = UI_LOW_LEVEL.calculateTextSpace(linkedObject.items[i].name, startX, OPENED_PANEL.pos.y - buffer - (i*itemHeight), textSize, "white", "left");
        if(widths < w.width + actualOffset) widths = w.width + actualOffset;
    }
    OPENED_PANEL.width = Math.max(OPENED_PANEL.width, widths+initialXOffset);

    var height = (linkedObject.items.length*itemHeight) + buffer;
    if(OPENED_PANEL.pos.y - height < 0) {
        OPENED_PANEL.pos.y -= 0-height;
    }
    if(OPENED_PANEL.pos.x + OPENED_PANEL.width > INFO_CANVAS.width) {
        OPENED_PANEL.pos.x -= OPENED_PANEL.width;
    }
    UI_LOW_LEVEL.drawRectAbsolute(OPENED_PANEL.pos.x, OPENED_PANEL.pos.y - height, OPENED_PANEL.pos.x + OPENED_PANEL.width, OPENED_PANEL.pos.y, 0, COLORS.backgroundGray, COLORS.hylightOutline, 5, [{"name": "drop-shadow", "value": "0px 0px 5px black"}]);

    for(var i = 0; i < linkedObject.items.length; i++) {
        var y = OPENED_PANEL.pos.y - ((i+1)*itemHeight)-(buffer);
        if(UI_TOOLS.rectAbsolute(startX-initialXOffset, y, startX + widths, y + textSize*2, "", "grey", "detail_select_" + i, 0)) {

            if(linkedObject.items[i].callback) {
                var args = linkedObject.items[i].args ? linkedObject.items[i].args : [];
                linkedObject.items[i].callback(...args);
            }
        }
        UI_LOW_LEVEL.drawText(linkedObject.items[i].name, startX, OPENED_PANEL.pos.y - buffer - (i*itemHeight), textSize, "white", "left", "bottom");
    }

    if(MOUSE.isDown) {
        OPENED_PANEL = null;
        ACTIVE_TOOL = "";
        MOUSE.isDown = false;
        MOUSE.isClick = false;
    }
}

////////////////////////////////////
function calcualteSelection(objectID, noDeselect) {
    if(SELECTED.multiSelectMode) {
        if(SELECTED.active == "") {
            SELECTED.active = objectID;
            on_select_change();
             if(SELECTED.other.indexOf(objectID) > -1) SELECTED.other.splice(SELECTED.other.indexOf(objectID), 1);
        } else {
            if(SELECTED.active == objectID) {
                 SELECTED.active = "";
                 on_select_change();
                 if(SELECTED.other.length > 0) {
                     SELECTED.active = SELECTED.other.splice(SELECTED.other.length - 1, 1)
                 }
            } else {
                 if(SELECTED.other.indexOf(SELECTED.active) > -1) SELECTED.other.splice(SELECTED.other.indexOf(SELECTED.active), 1);

                 SELECTED.other.push(SELECTED.active);
                 on_select_change();
                 SELECTED.active = objectID;
            }
        }
     } else {
         if(SELECTED.active == objectID && !noDeselect) {
             SELECTED.active = "";
             on_select_change();
             SELECTED.other = [];
         } else {
             SELECTED.active = objectID;
             SELECTED.other = [];
             on_select_change();
         }
         
     }
}

function on_select_change() {
    if(average.position) {
        for(var i = 0; i < OBJECTS.length; i++) {
            gizmoLast[OBJECTS[i].id] = UI_LOW_LEVEL.getAngleBetweenPoints(average.position.x, average.position.y, OBJECTS[i].pos.x, OBJECTS[i].pos.y);
        }
    }
}

///////////////////////////////////