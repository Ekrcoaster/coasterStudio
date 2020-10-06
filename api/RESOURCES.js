var IMAGES = {
    "ICONS": {
        "goToCenter": "",
        "toggleGridVisibility": "",
        "toggleCameraVisiblity": "",
        "toggleSkyVisiblity": "",
        "toggleStatsVisibility": "",

        "menuIcon": "",
    
        "scene": "",
        "properties": "",
        "outliner": "",
        "timeline": "",
    
        "plus": "",
    
        "createCircle": "",
        "createImage": "",
        "createSquare": "",
        "createTriangle": "",
    
        "skipLeft": "",
        "play": "",
        "skipRight": "",
        "pause": "",
        
        "cross": "",

        "crossWithBackground": "",
        "downWithBackground": "",
        "upWithBackground": ""
    },
    "IMAGES": {
        "MISSING": ""
    },
    "USER": {
    }
}

var RAW_DATA = {
    
}

var c = getJsonCategories(IMAGES);
for(var x = 0; x < c.length; x++) {
    var loadedIcons = getJsonCategories(IMAGES[c[x]]);
    for(var i = 0; i < loadedIcons.length; i++) {
        document.getElementById("res").innerHTML += `<img id="id_${loadedIcons[i]}" src="res/${c[x].toLocaleLowerCase()}/${loadedIcons[i]}.png">`
        IMAGES[c[x]][loadedIcons[i]] = `id_${loadedIcons[i]}`;
    }
}

function addImageToDatabase(data = {"fileName": "", "data": null}, dontAddObject = false) {
    data.fileName = data.fileName.replace(/user_/g, "")
    var id = "user_" + data.fileName;
    document.getElementById("res").innerHTML += `<img id="${id}" src=${data.data}>`
    IMAGES.USER[id] = id;
    RAW_DATA[id] = data.data;

    if(active_ui.imgField.key == null && !dontAddObject) {
        OBJECT_TOOLS.createImage("New Image", {x: 0, y: 0, z: 0}, {z: 0}, {width: 256, height: 256}, id)
    }

    return id;
}

function EXPORT_SELECTED_OBJECT() {
    var exportData = {};

    if(SELECTED.active == "") {
        alert("Nothing is Selected!");
        return;
    }
    var selectedObject = OBJECT_TOOLS.getObject(SELECTED.active);
    exportData = addObject(selectedObject);
    
    function addObject(object) {
        var temp = copyJson(object);
        
        var myChildren = object.getChildren();
        temp.children = [];
        for(var i = 0; i < myChildren.length; i++) {
            temp.children.push(addObject(myChildren[i]));
        }

        var savedImageID = temp.imgID;
        delete temp.imgID;

        var image = document.getElementById(savedImageID);
        if(image) {
            temp.rawImageData = RAW_DATA[savedImageID]
        }

        delete temp.parent;
        delete temp.id;
        delete temp.getChildren;
        delete temp.getParentCount;
        delete temp.getWorldTransform;

        return temp;
    }

    download(selectedObject.name + ".cObj", JSON.stringify(exportData))

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

function addObjectToDatabaseFromFile(data = {}) {
    convertObject(data);
    function convertObject(objectData, parentID) {
        objectData = copyJson(objectData)
        var image = "";
        if(objectData.rawImageData.length > 0) {
            image = addImageToDatabase({"fileName": "imported_image_" + createID(6), "data": objectData.rawImageData}, true);
        }
        objectData.pos.y *= -1;
        var createdObject = OBJECT_TOOLS.createObject(objectData.type, objectData.name, copyJson(objectData.pos), 
        copyJson(objectData.rotation), copyJson(objectData.dimensions), image, objectData.fillColor, objectData.outlineColor, 
        objectData.outlineThickness, objectData.triangleTipPosition, copyJson(objectData.scale));
        createdObject.filters = [];
        for(var i = 0; i < objectData.filters.length; i++) {
            createdObject.filters.push(copyJson(objectData.filters[i]));
        }

        if(parentID != null && parentID != "") {
            createdObject.parent = parentID;
        }

        for(var i = 0; i < objectData.children.length; i++) {
            convertObject(objectData.children[i], createdObject.id);
        }
    }
}

function EXPORT_SCENE() {

    download("coasterStudioScene.cScene", JSON.stringify(getSceneJson()))

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

function TRY_LOAD_SCENE(data = {}) {
    if(JSON.stringify(data) == "{}") {
        askForFile()
        return;
    }
    if(!isSceneEmpty()) {
        if(!confirm("Are you sure you want to override this scene?")) {
            return;
        }
    }

    applySceneJson(data);
}

function TRY_RELOAD() {
    if(!isSceneEmpty()) {
        if(!confirm("Are you sure you want to override this scene?")) {
            return;
        }
    }

    location.reload();
}

function getSceneJson() {
    var data = {
        "OBJECTS": [],
        "PROPERTIES": [],
        "WINDOW_DATA": copyJson(WINDOW_DATA),
        //"WINDOWS": [],
        "SETTINGS": copyJson(SETTINGS),
        "CAMERA": copyJson(CAMERA),
        "SAVED_COLORS": [],
        "IMAGE_DATABASE": copyJson(IMAGES.USER),
        "FRAMES": copyJson(FRAMES),

        "version": VERSION
    }

    for(var i = 0; i < OBJECTS.length; i++) {
        data.OBJECTS.push(copyJson(OBJECTS[i]));
    }

    for(var i = 0; i < PROPERTY_LISTENERS.length; i++) {
        data.PROPERTIES.push(copyJson(PROPERTY_LISTENERS[i]));
    }

    //for(var i = 0; i < WINDOWS.length; i++) {
    //    data.WINDOWS.push(copyJson(PROPERTY_LISTENERS[i]));
    //}
//
    for(var i = 0; i < SAVED_COLORS.length; i++) {
        data.SAVED_COLORS.push(copyJson(SAVED_COLORS[i]));
    }

    var imageIDS = getJsonCategories(data.IMAGE_DATABASE);
    for(var i = 0; i < imageIDS.length; i++) {
        data.IMAGE_DATABASE[imageIDS[i]] = {"id": imageIDS[i], "src": RAW_DATA[imageIDS[i]]}
    }

    return data;

    function copyArray(array) {
        var re = [];
        for(var i = 0; i < array.length; i++) {
            re.push(copyJsonDebug(array[i]));
        }
        return re;
    }
}

function isSceneEmpty() {
    return OBJECTS.length == 0 && SAVED_COLORS.length == 0 && JSON.stringify(IMAGES.USER) == "{}";
}

function applySceneJson(data = {"OBJECTS": [], "PROPERTIES": [], "WINDOW_DATA": {}, "WINDOWS": [], "SETTINGS": {}, "CAMERA": {}, "SAVED_COLORS": [], "IMAGE_DATABASE": {}, "FRAMES": {}, "version": ""}) {
    //OBJECTS = data.OBJECTS;
    //PROPERTIES = data.PROPERTIES;
    WINDOW_DATA = data.WINDOW_DATA;
    //WINDOWS = data.WINDOWS;
    SETTINGS = data.SETTINGS;
    CAMERA = data.CAMERA;
    SAVED_COLORS = data.SAVED_COLORS;
    FRAMES = data.FRAMES;
    //IMAGES.USER = data.IMAGE_DATABASE;

    var userImages = getJsonCategories(data.IMAGE_DATABASE);
    for(var i = 0; i < userImages.length; i++)
        addImageToDatabase({"fileName": data.IMAGE_DATABASE[userImages[i]].id,"data": data.IMAGE_DATABASE[userImages[i]].src})

    PROPERTY_LISTENERS = [];
    OBJECTS = [];
    for(var i = 0; i < data.OBJECTS.length; i++) {
        var obj = data.OBJECTS[i];
        var ob = OBJECT_TOOLS.createObject(obj.type, obj.name, obj.pos, obj.rotation, obj.dimensions, obj.imgID, obj.fillColor, obj.outlineColor, obj.outlineThickness, obj.triangleTipPosition, obj.scale);
        ob.filters = obj.filters;
    }

    for(var i = 0; i < data.PROPERTIES.length; i++) {
        var prop = data.PROPERTIES[i];
        PROPERTIES.createProperty(prop.type, prop.path, prop.default, prop.min, prop.max);
    }
}