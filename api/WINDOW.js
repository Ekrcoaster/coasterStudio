var WINDOW_TOOLS = {
    windowTemplate: {
        "name": "",
        "x": 0,
        "y": 0,
        "width": 1,
        "height": 1,
        "layoutOrder": "",
        "weights": {left: 0, top: 0, right: 0, bottom: 0},
        "onRender": function(windowName) {
        },
        "onUpdate": function() {
        },
        "id": "",
        "init": {
            "pos": {x: 0, y: 0},
            "dimensions": {width: 0, height: 0},
            "center": {x: 0,y: 0},
            "needsInit": true
        },
        "refreshInit": function() {

        }
    },
    createNewWindow: function(name = "", layoutOrder = "", weights = {left: 0, top: 0, right: 0, bottom: 0}) {
        var obj = copyJson(WINDOW_TOOLS.windowTemplate);
        obj.name = name;
        obj.layoutOrder = layoutOrder;
        obj.weights = weights;
        obj.onRender = function(post) {
            var convertedSpace = {
                "x": obj.x * INFO_CANVAS.width,
                "width": obj.width * INFO_CANVAS.width,

                "y": obj.y*INFO_CANVAS.height,
                "height": obj.height*INFO_CANVAS.height
            }
            if(post) {
                ON_WINDOW_POST_RENDER(this.name, this.id, convertedSpace.x, convertedSpace.y, convertedSpace.x+convertedSpace.width, convertedSpace.height, obj)
                return;
            }
            ON_WINDOW_RENDER(this.name, this.id, convertedSpace.x, convertedSpace.y, convertedSpace.x+convertedSpace.width, convertedSpace.height, obj)
        };
        obj.onUpdate = function() {};
        obj.applied = weights;
        obj.applied.weights = weights;
        obj.id = createID(77);

        obj.refreshInit = function() {
            this.init.needsInit = true;
            WINDOW_TOOLS.updateAllWindowSizes();
        }

        WINDOWS.push(obj);
    },
    getWindows: function(name) {
        var soFar = [];
        for(var i = 0; i < WINDOWS.length; i++) {
            if(WINDOWS[i].name == name) soFar.push(WINDOWS[i]);
        }
        return soFar;
    },
    updateAllWindowSizes: function() {
        
        for(var i = 0; i < WINDOWS.length; i++) {
            var spacing = this.calculateWindowSpace(WINDOWS[i].layoutOrder);
            var windowsInSpace = this.getWindowsInSpace(WINDOWS[i].layoutOrder);
            var myIndex = windowsInSpace.indexOf(WINDOWS[i]);

            if(spacing.active.type == "row") {
                var spaceBetween = spacing.space.width / windowsInSpace.length;
                WINDOWS[i].x = spacing.space.x + (myIndex*spaceBetween);
                WINDOWS[i].width = (spacing.space.width / (windowsInSpace.length));//((spacing.myChildIndex + 1)*spaceBetween)+spacing.space.x;

                WINDOWS[i].y = spacing.space.y;
                WINDOWS[i].height = spacing.space.height;
            } else if(spacing.active.type == "column") {
                var spaceBetween = spacing.space.height / windowsInSpace.length;
                WINDOWS[i].y = spacing.space.y + (myIndex*spaceBetween);
                WINDOWS[i].height = (spacing.space.height / (windowsInSpace.length));//((spacing.myChildIndex + 1)*spaceBetween)+spacing.space.x;

                WINDOWS[i].x = spacing.space.x;
                WINDOWS[i].width = spacing.space.width;
            }

            var weights = {"left": WINDOWS[i].weights.left, "right": WINDOWS[i].weights.right, "top": WINDOWS[i].weights.top, "bottom": WINDOWS[i].weights.bottom}
            if(spacing.active.type == "row") {
                WINDOWS[i].x += (WINDOWS[i].width*weights.left)
                WINDOWS[i].width += (WINDOWS[i].width*(weights.right + (-weights.left)))

                if(WINDOWS[i].width + WINDOWS[i].x > INFO_CANVAS.width) {
                    WINDOWS[i].width = INFO_CANVAS.width - WINDOWS[i].x;
                }

                if(WINDOWS[i].x < 0) {
                    var change = -WINDOWS[i].x;
                    WINDOWS[i].x = change;
                    WINDOWS[i].width -= change;
                }
                
                WINDOWS[i].y += (WINDOWS[i].height*weights.top*.5)
                WINDOWS[i].height += (WINDOWS[i].height*((weights.bottom)*1 + (weights.top*0)))

                /*if(WINDOWS[i].height + WINDOWS[i].y > INFO_CANVAS.height) {
                    WINDOWS[i].height = INFO_CANVAS.height - WINDOWS[i].y;
                }

                if(WINDOWS[i].y < 0) {
                    var change = -WINDOWS[i].y;
                    WINDOWS[i].y = change;
                    WINDOWS[i].height -= change;
                }*/
            }

            if(WINDOWS[i].init.needsInit) {
                WINDOWS[i].init.needsInit = false;

                WINDOWS[i].init.pos.x = WINDOWS[i].x;
                WINDOWS[i].init.pos.y = WINDOWS[i].y;

                WINDOWS[i].init.dimensions.width = WINDOWS[i].width;
                WINDOWS[i].init.dimensions.height = WINDOWS[i].height;
                
                WINDOWS[i].init.center.x = WINDOWS[i].x + (WINDOWS[i].width/2);
                WINDOWS[i].init.center.y = WINDOWS[i].y + (WINDOWS[i].height/2);
            }
            
            WINDOWS[i].x = WINDOWS[i].x/INFO_CANVAS.width;
            WINDOWS[i].y = WINDOWS[i].y/INFO_CANVAS.height;
            WINDOWS[i].height = WINDOWS[i].height/INFO_CANVAS.height;
            WINDOWS[i].width = WINDOWS[i].width/INFO_CANVAS.width;

            
        }
    },
    getWindowsInSpace: function(layoutOrder = "") {
        var soFar = [];
        for(var i = 0; i < WINDOWS.length; i++) {
            if(WINDOWS[i].layoutOrder == layoutOrder) soFar.push(WINDOWS[i]);
        }
        return soFar;
    },
    calculateWindowSpace: function(layoutOrder = "") {
        var space = {x: 0, y: 0, width: INFO_CANVAS.width, height: INFO_CANVAS.height};
        var steps = layoutOrder.split(".");
        var selectedLayout = LAYOUT;
        var active = null;
        var lastActive = null;
        
        for(var i = 0; i < steps.length; i++) {
            active = get(steps[i]);
            if(lastActive) {
                var myChildIndex = lastActive.children.indexOf(active);
                if(lastActive.type == "row") {
                    var spacing = space.width / lastActive.children.length;
                    space.x = myChildIndex * spacing;
                    space.width = (myChildIndex + 1) * spacing;
                }
                if(lastActive.type == "column") {
                    var spacing = space.height / lastActive.children.length;
                    space.y = myChildIndex * spacing;
                    space.height = (myChildIndex + 1) * spacing;
                }
            }

            selectedLayout = active.children ? active.children : [];
            if(i < steps.length-1)
            lastActive = active;
        }

        return {"space": space, "active": active, "parent": lastActive, "myChildIndex": lastActive.children.indexOf(active)};

        function get(id) {
            for(var xx = 0; xx < selectedLayout.length; xx++) {
                if(selectedLayout[xx].id == id) return selectedLayout[xx];
            } 
        }
    },
    setWeights: function(myWindow, newWeights) {
        var index = WINDOWS.indexOf(myWindow);
        if(newWeights.left != null) WINDOWS[index].weights.left = newWeights.left;
        if(newWeights.right != null) WINDOWS[index].weights.right = newWeights.right;
        if(newWeights.top != null) WINDOWS[index].weights.top = newWeights.top;
        if(newWeights.bottom != null) WINDOWS[index].weights.bottom = newWeights.bottom;

        this.updateAllWindowSizes();
    },
    getLeftWindow: function(myWindow) {
        var windows = this.getWindowsInSpace(myWindow.layoutOrder);
        var myIndex = windows.indexOf(myWindow);
        if(myIndex == -1 || myIndex == 0) return null;
        myIndex--;
        return windows[myIndex];
    },
    getLayoutItem : function(layoutOrder) {
        var steps = layoutOrder.split(".");
        var activeSpace = LAYOUT;
        var active = null;

        for(var i = 0; i < steps.length; i++) {
            for(var x = 0 ; x < activeSpace.length; x++) {
                if(activeSpace[x].id == steps[i]) {
                    active = activeSpace[x];
                }
            }
            if(active) {
                activeSpace = active.children;
            } else {
                return null;
            }
        }
        return active;
    },
    getParentItem : function(layoutOrder) {
        var steps = layoutOrder.split(".");
        steps.splice(steps.length - 1, 1);
        return {"parent": this.getLayoutItem(steps.join(".")), "path": steps.join(".")};
    },
    setColumnHeights: function(myWindow, newWeight = 0) {
        var parent = this.getParentItem(myWindow.layoutOrder);
        var myRow = this.getLayoutItem(myWindow.layoutOrder);
        while(parent.parent != null && parent.parent.type != "column") {
            parent = this.getParentItem(parent.path);
        }
        var myindex = parent.parent.children.indexOf(myRow);
        var windowToChangeHeight = parent.parent.children[myindex-1];
        var windowToChangePosition = parent.parent.children[myindex];

        var heights = this.getWindowsInSpace(parent.parent.id + "." + windowToChangeHeight.id);
        var positions = this. getWindowsInSpace(parent.parent.id + "." + windowToChangePosition.id);

        for(var i = 0; i < heights.length; i++) {
            this.setWeights(heights[i], {"bottom": newWeight});
        }
        for(var i = 0; i < positions.length; i++) {
            this.setWeights(positions[i], {"top": newWeight});
        }
        //console.log(windowToChangePosition)
    }
}