
var ACTIVE_TOOL = "";
var STORED_TOOL_SETTINGS = {};

var MOUSE = {
    "pos": {x: 0, y: 0},
    "vel": {x: 0, y: 0},
    "last": {x: 0, y: 0},
    "lastFree": {x: 0, y: 0},
    "downDistance": {x: 0, y: 0},
    "isDown": false,
    "isClick": false,
    "postClick": false,
    "scroll": {
        "level": 0,
        "velocity": 0,
        "last": 0
    },
    "hoveringWindow": "",
    "holdingTime": 0,
    "isHolding": false
}

var INFO_CANVAS = {
    "width": 0,
    "height": 0
}

var FRAMES = {
    "start": 0,
    "current": 0,
    "end": 300,

    "lastFrame": 0,

    "isPlaying": false,
    "frameRate": 30,

    "activeTimer": null,

    "updateTimer": function() {
        if(FRAMES.activeTimer) clearInterval(FRAMES.activeTimer);

        FRAMES.activeTimer = setInterval(function() {
            if(FRAMES.isPlaying) {
                FRAMES.current += 1;
                if(FRAMES.current > FRAMES.end) FRAMES.current = FRAMES.start;
            }
            if(FRAMES.current != FRAMES.lastFrame) {
                FRAMES.lastFrame = FRAMES.current;
                PROPERTIES.updateFrame();
            }
        }, 1000/FRAMES.frameRate);
    }
}

var WINDOWS = [
]

var LAYOUT = [
    {
        "type": "column",
        "id": "root",
        "weights": {"left": 0, "top": 0, "right": 0, "bottom": 0},
        "children": [
            {
                "type": "row",
                "weights": {"left": 0, "top": 0, "right": 0, "bottom": 0},
                "id": "topRow"
            },
            {
                "type": "row",
                "weights": {"left": 0, "top": 0, "right": 0, "bottom": 0},
                "id": "bottomRow"
            }
        ]
    }
];

var OBJECTS = [];

var SELECTED = {
    "active": "",
    "other": [],
    "multiSelectMode": false
}

var WINDOW_DATA = {
    "scene_view": {
        "position": {x: 0, y:0},
        "lastPosition": {x: 0, y: 0},
        "zoomLevel": 1,
        changeZoom: function(chageValue) {
            
        }
    },
    "timeline_view": {
        "zoom": {
            min: 0,
            max: 1
        }
    },
    "properties_view": {
        "scrollPosition": 0,
        "smoothScrollPosition": 0,
        "mode": 1
    }
}

var SETTINGS = {
    "scene_view": {
        "showGrid": true,
        "showSkyColor": false,
        "showCamera": true,
        "showStats": true
    },
    "animation": {
        "autoKeyframe" : false
    },
    "rendering": {
        "skyColor": "#ffffff"
    }
}

var CAMERA = {
    "width": 1280,
    "height": 720,
    "x": 0,
    "y": 0
}

var PROPERTY_LISTENERS = [

];

var DETAILED_PANELS = [
];

var SAVED_COLORS = [
    
]

var OPENED_PANEL = {
    "pos": {
        x: 0,
        y: 0,
    },
    "width": 0,
    "linkedObject": {
        "area": {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        },
        "id": "",
        "name": "",
        "items": [

        ]
    }
};

var COPY = [];


const COLORS = {
    "backgroundGray": "#2a2a2a",
    "slightlyDarkerBackgroundGray": "#212121",
    "hylightGray": "#3b3b3b",
    "highlightOutline": "#565656",

    "normalTextColor": "white",
    "hylightedTextColor": "#c2deff",

    "greyedOutTextColor": "#737373",

    "selectionActive": "#6f95ff",
    "selectionBackground": "#503f78",

    "activeKeyFrame": "#1e7feb"
}