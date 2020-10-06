var KEYS_DOWN = [];

var KEYS_DOWN_UNTIL_CLICK = [];

function on_scroll(delta) {
    var windowName = MOUSE.hoveringWindow;

    if(windowName == "scene_view") {

        //WINDOW_DATA.scene_view.zoomLevel += (delta/-2000);
        //if(WINDOW_DATA.scene_view.zoomLevel < 0.1) WINDOW_DATA.scene_view.zoomLevel = 0.1;

        //WINDOW_DATA.scene_view.position.x *= delta/-99.5;
    }

}

function on_key_down(keyCode, rawKey) {
    var key = getKey(keyCode, rawKey);
    var caseKey = (KEYS_DOWN.indexOf("SHIFT") > -1 ? key : key.toLowerCase())
    if(KEYS_DOWN.indexOf(key) == -1) KEYS_DOWN.push(key);
    if(KEYS_DOWN_UNTIL_CLICK.indexOf(key) == -1 && JSON.stringify(active_ui.typing) == "{}" && JSON.stringify(active_ui.textField) == "{}") KEYS_DOWN_UNTIL_CLICK.push(key);

    if(key == "SHIFT") SELECTED.multiSelectMode = true;
    if(active_ui.textField.id != null) {
        if(key == "LEFT_ARROW") {
            if(SELECTED.multiSelectMode) {
                if(active_ui.textField.selection == -1) {
                    active_ui.textField.selection = active_ui.textField.cursorPoint;
                }
                tryDecrease("selection");
            } else {
                if(active_ui.textField.selection == -1) {
                    tryDecrease();
                } else {
                    active_ui.textField.cursorPoint = active_ui.textField.selection;
                    active_ui.textField.selection = -1;
                }
            }

            function tryDecrease(key = "cursorPoint") {
                if(active_ui.textField[key] > 0) active_ui.textField[key]--;
            }
        } else if(key == "RIGHT_ARROW") {
            if(SELECTED.multiSelectMode) {
                if(active_ui.textField.selection == -1) {
                    active_ui.textField.cursorPoint = active_ui.textField.selection;
                    active_ui.textField.selection = active_ui.textField.cursorPoint;
                }
                tryIncrease("selection");
            } else {
                if(active_ui.textField.selection == -1) {
                    tryIncrease();
                } else {
                    active_ui.textField.selection = -1;
                }
            }

            function tryIncrease(key = "cursorPoint") {
                if(active_ui.textField[key] < active_ui.textField.textSoFar.length) active_ui.textField[key]++;
            }
        } else if(key == "BACK_SPACE") {
            active_ui.textField.action = "REMOVE";
        } else if(key.length == 1) {
            active_ui.textField.action = caseKey;
        } else if(key == "SPACE") {
            active_ui.textField.action = " "
        }
    }

    if(JSON.stringify(active_ui.textField) == "{}" && JSON.stringify(active_ui.typing) == "{}") {
        if(key == "RIGHT_ARROW") {
            if(FRAMES.current < FRAMES.end)
            FRAMES.current++;
        }
        if(key == "LEFT_ARROW") {
            if(FRAMES.current > FRAMES.start)
            FRAMES.current--;
        }
        if(key == "SPACE") {
            FRAMES.isPlaying = !FRAMES.isPlaying;
        }
        if(key == "i") {
            if(SELECTED.active != "") {
                keyframe(SELECTED.active);
            }
            for(var i = 0; i < SELECTED.other.length; i++) keyframe(SELECTED.other[i])
            function keyframe(id) {
                PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${id}.pos.x`);
                PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${id}.pos.y`);
                PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${id}.pos.z`);
                
                PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${id}.rotation.z`);
                
                PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${id}.scale.x`);
                PROPERTIES_BACKEND.keyframeAtPath(`OBJECTS.${id}.scale.y`);
            }
        }
    
    }

    if(MOUSE.hoveringWindow == "scene_view" || MOUSE.hoveringWindow == "outliner_view" && ACTIVE_TOOL == "") {
        if(KEYS_DOWN.indexOf("CTRL") > -1 && KEYS_DOWN.indexOf("c") > -1) {
            COPY = [];

            if(SELECTED.active != "") COPY.push({"type": "COPY_OBJECT", "data": {"main": true, "id": SELECTED.active}});
            for(var i = 0; i < SELECTED.other.length; i++) COPY.push({"type": "COPY_OBJECT", "data": {"main": false, "id": SELECTED.other[i], "removeSelect": SELECTED.other[i]}})
        }
    
        if(KEYS_DOWN.indexOf("CTRL") > -1 && KEYS_DOWN.indexOf("v") > -1) {
            for(var i = 0; i < COPY.length; i++) {
                var type = COPY[i].type;
                var data = COPY[i].data;
    
                switch(type) {
                    case "COPY_OBJECT":
                        var newObject = OBJECT_TOOLS.duplicateObject(data.id);
                        if(data.main) SELECTED.active = newObject.id;
                        else {
                            SELECTED.other.splice(SELECTED.other.indexOf(data.removeSelect), 1);
                            SELECTED.other.push(newObject.id);
                        }
                    break;
                }
            }
        }
    
        if(key == "DELETE") {
            if(SELECTED.active != "") OBJECT_TOOLS.deleteObject(SELECTED.active);
            for(var i = 0; i < SELECTED.other.length; i++) {
                OBJECT_TOOLS.deleteObject(SELECTED.other[i])
                i--;
            }
        }
    }
    
    
    if(KEYS_DOWN.indexOf("CTRL") > -1 && KEYS_DOWN.indexOf("z") > -1) {
        UNDO_TOOLS.onUndoRequested();
    }
}

function on_key_up(keyCode, rawKey) {
    var key = getKey(keyCode, rawKey);
    var caseKey = (KEYS_DOWN.indexOf("SHIFT") > -1 ? key : key.toLowerCase())
    if(KEYS_DOWN.indexOf(key) > -1) KEYS_DOWN.splice(KEYS_DOWN.indexOf(key), 1);

    
    if(key == "SHIFT") SELECTED.multiSelectMode = false;
}

function getKey(code, rawKey) {
    if(code == 16) return "SHIFT";
    if(code == 17) return "CTRL";
    if(code == 46) return "DELETE";
    if(code == 39) return "RIGHT_ARROW";
    if(code == 37) return "LEFT_ARROW";
    if(code == 40) return "DOWN_ARROW";
    if(code == 38) return "UP_ARROW";
    if(code == 8) return "BACK_SPACE";
    if(code == 32) return "SPACE"
    return rawKey.toString();
}

function onImageUpload(imageFile) {
    var reader = new FileReader();

    reader.readAsDataURL(imageFile);
    reader.onload = function() {
        addImageToDatabase({"fileName": imageFile.name, "data": reader.result})
    }
}

function onObjectFileLoaded(objectFile) {
    var reader = new FileReader();

    reader.readAsText(objectFile);
    reader.onload = function() {
        addObjectToDatabaseFromFile(JSON.parse(reader.result))
    }
}

function onSceneFileLoaded(sceneFile) {
    console.log("scene");
    var reader = new FileReader();

    reader.readAsText(sceneFile);
    reader.onload = function() {
        TRY_LOAD_SCENE(JSON.parse(reader.result))
    }
}