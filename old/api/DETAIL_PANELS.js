const PANEL_TOOLS_detailedPanelTemplate = {
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

const PANEL_TOOLS_panelItemTemplate = {
    "name": "",
    "callback": function() {},
    "icon": ""
}

const DETAILED_PANEL_TOOLS = {
    
    /*function(area = {x1: 0, y1: 0, x2: 0, y2: 0}, name = "", items = []) {
        return 
    },*/
    
    /*function(itemName = "", callback = function() {}, itemIcon = null) {
        return 
    },*/
    registerRegion: function(id = "", area = {x1: 0, y1: 0, x2: 0, y2: 0}, items = []) {
        var existing = -1;

        for(var i = 0; i < DETAILED_PANELS.length; i++) {
            if(DETAILED_PANELS[i].id == id) {
                existing = i;
            }
        }

        var data = {};
        if(existing == -1) {
            data = copyJson(PANEL_TOOLS_detailedPanelTemplate);
        } else {
            data = DETAILED_PANELS[existing];
        }

        data.id = id;
        if(area != null) {
            if(!(area.x1 == 0 && area.x2 == 0)) {
                data.area = copyJson(area);
            }
        }
        
        if(items.length > 0) {
            data.items = [];
            for(var i = 0; i < items.length; i++) data.items.push(items[i]);
    
        }
        if(existing == -1) {
            DETAILED_PANELS.push(data);
        }
        return data.id;
    },

    onRightClick: function() {
        var possiblePanels = [];
        for(var i = 0; i < DETAILED_PANELS.length; i++) {
            if(UI_LOW_LEVEL.isMouseIn(DETAILED_PANELS[i].area.x1, DETAILED_PANELS[i].area.y1, DETAILED_PANELS[i].area.x2, DETAILED_PANELS[i].area.y2, 5)) {
                possiblePanels.push(DETAILED_PANELS[i]);
            }
        }

        if(possiblePanels.length > 0) {
            DETAILED_PANEL_TOOLS.OpenPanel(staticUISpace.mouse.pos.x, staticUISpace.mouse.pos.y, 140, possiblePanels[possiblePanels.length - 1]);
        }
        DETAILED_PANELS = []
    },

    OpenPanel: function(x, y, width, panelObject = DETAILED_PANEL_TOOLS.panelItemTemplate) {
        OPENED_PANEL = {
            "pos": {
                x: x,
                y: y,
            },
            "width": width,
            "linkedObject": panelObject
        }
    }
}