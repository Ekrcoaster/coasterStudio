var OBJECT_TYPES = {
    "image": "image",
    "colored_rect": "colored_rect",
    "colored_elipse": "colored_elipse",
    "colored_triangle": "colored_triangle"
}

var OBJECT_TOOLS = {
    objectTemplate: {
        "type": OBJECT_TYPES.image,
        "isEnabled": true,
        "id": "",
        "name": "",
        "pos": {x: 0, y: 0, z: 0},
        "rotation": {z: 0},
        "dimensions": {width: 1, height: 1},
        "scale": {x: 1, y: 1},
        "parent": "",
        "filters": [],

        "imgID": "",

        "triangleTipPosition": 0.5,
        
        "fillColor": "",
        "outlineColor": "",
        "outlineThickness": 0
    },

    createObject: function(type = OBJECT_TYPES.image, name = "", position = {x: 0, y: 0, z: 0}, rotation = {z: 0}, dimensions = {width: 1, height: 1}, imgSource = "", fillColor = "", outlineColor = "", outlineThickness = 0, triangleTipPosition = 0.5, scale = {"x": 1, "y": 1}) {
        var template = copyJson(OBJECT_TOOLS.objectTemplate);
        template.type = type;
        template.name = name;
        position.y *= -1;
        template.pos = position;
        template.rotation = rotation;
        template.dimensions = dimensions;
        template.imgID = imgSource;
        template.fillColor = fillColor;
        template.outlineColor = outlineColor;
        template.outlineThickness = outlineThickness;
        template.triangleTipPosition = triangleTipPosition;
        template.filters = []
        template.scale = scale;

        if(template.pos.z == null) template.pos.z = 0;

        template.id = createID(77);

        PROPERTIES.createFloatProperty(`OBJECTS.${template.id}.pos.x`, 0);
        PROPERTIES.createFloatProperty(`OBJECTS.${template.id}.pos.y`, 0);
        PROPERTIES.createFloatProperty(`OBJECTS.${template.id}.pos.z`, 0);
        
        PROPERTIES.createAngleProperty(`OBJECTS.${template.id}.rotation.z`, 0);
        
        PROPERTIES.createFloatProperty(`OBJECTS.${template.id}.scale.x`, 1);
        PROPERTIES.createFloatProperty(`OBJECTS.${template.id}.scale.y`, 1);
        
        PROPERTIES.createColorProperty(`OBJECTS.${template.id}.fillColor`, "white");
        PROPERTIES.createColorProperty(`OBJECTS.${template.id}.outlineColor`, "white");
        PROPERTIES.createIntProperty(`OBJECTS.${template.id}.outlineThickness`, 0);
        
        PROPERTIES.createFloatProperty(`OBJECTS.${template.id}.triangleTipPosition`, 0);

        PROPERTIES.createStringProperty(`OBJECTS.${template.id}.imgID`, "");

        template.getChildren = function() {
            var children = [];
            for(var i = 0; i < OBJECTS.length; i++) {
                if(OBJECTS[i].parent == template.id) children.push(OBJECTS[i]);
            }
            return children;
        }

        template.getWorldTransform = function(worldData) {
            if(worldData[template.id] == null) return {
                pos: template.pos,
                rotation: template.rotation,
                scale: template.scale
            };
            return worldData[template.id];
        }

        template.getParentCount = function() {
            var count = "";
            var parent = OBJECT_TOOLS.getObject(template.parent);
            while(parent != null) {
                count++;
                parent = OBJECT_TOOLS.getObject(parent.parent);
            }
            return count;
        }

        OBJECTS.push(template);
        
        UNDO_TOOLS.addUndoStep(`rawFunction OBJECT_TOOLS.deleteObject("${template.id}")`)
        return template;
    },

    createImage: function(name = "", position = {x: 0, y: 0}, rotation = {z: 0}, dimensions = {width: 1, height: 1}, src = "", scale = {x: 1, y: 1}) {
        return this.createObject(OBJECT_TYPES.image, name, position, rotation, dimensions, src, this.objectTemplate.fillColor, this.objectTemplate.outlineColor, this.objectTemplate.outlineThickness, this.objectTemplate.triangleTipPosition, scale);
    },

    createColoredRect: function(name = "", position = {x: 0, y: 0}, rotation = {z: 0}, dimensions = {width: 1, height: 1}, fillColor = "", outlineColor = "", outlineThickness = 0,  scale = {x: 1, y: 1}) {
        return this.createObject(OBJECT_TYPES.colored_rect, name, position, rotation, dimensions, this.objectTemplate.imgID, fillColor, outlineColor, outlineThickness, this.objectTemplate.triangleTipPosition, scale);
    },
    createColoredElipse: function(name = "", position = {x: 0, y: 0}, rotation = {z: 0}, dimensions = {width: 1, height: 1}, fillColor = "", outlineColor = "", outlineThickness = 0, scale = {x: 1, y: 1}) {
        return this.createObject(OBJECT_TYPES.colored_elipse, name, position, rotation, dimensions, this.objectTemplate.imgID, fillColor, outlineColor, outlineThickness, this.objectTemplate.triangleTipPosition, scale);
    },
    createColoredTriangle: function(name = "", position = {x: 0, y: 0}, rotation = {z: 0}, dimensions = {width: 1, height: 1}, fillColor = "", outlineColor = "", outlineThickness = 0, triangleTipPosition = 0.5, scale = {x: 1, y: 1}) {
        return this.createObject(OBJECT_TYPES.colored_triangle, name, position, rotation, dimensions, this.objectTemplate.imgID, fillColor, outlineColor, outlineThickness, triangleTipPosition, scale);
    },

    getObject: function(id) {
        for(var i = 0; i < OBJECTS.length; i++) {
            if(OBJECTS[i].id == id) return OBJECTS[i];
        }
        return null;
    },
    
    deleteObject: function(id) {
        for(var i = 0; i < OBJECTS.length; i++) {
            if(OBJECTS[i].id == id) {
                if(SELECTED.active == id) SELECTED.active = "";
                if(SELECTED.other.indexOf(id) > -1) SELECTED.other.splice(SELECTED.other.indexOf(id), 1);
                var old = OBJECTS.splice(i, 1);
                i--;
                var obj = old[0];
                var path = `rawFunction OBJECT_TOOLS.createObject("${obj.type}", "${obj.name}", ${JSON.stringify(obj.pos)}, ${JSON.stringify(obj.rotation)}, ${JSON.stringify(obj.dimensions)}, "${obj.imgSource ? obj.imgSource : ""}", "${obj.fillColor}", "${obj.outlineColor}", "${obj.outlineThickness}", "${obj.triangleTipPosition}", ${JSON.stringify(obj.scale)})`
                UNDO_TOOLS.addUndoStep(path)
            }
        }
    },

    duplicateObject: function(id) {
        var ref = this.getObject(id);
        var obj = this.createObject(ref.type, ref.name + " (Copy)", copyJson(ref.pos), copyJson(ref.rotation), copyJson(ref.dimensions), ref.imgID, ref.fillColor, ref.outlineColor, ref.outlineThickness, ref.triangleTipPosition, copyJson(ref.scale))
        
        obj.filters = []
        for(var i = 0; i < ref.filters.length; i++) {
            obj.filters.push(copyJson(ref.filters[i]))
        }
        UNDO_TOOLS.addUndoStep(`rawFunction OBJECT_TOOLS.deleteObject("${obj.id}")`)
        return obj;
    },

    caculateAllWordTransforms: function() {
        var allParents = [];
        for(var i = 0; i < OBJECTS.length; i++) {
            if(OBJECTS[i].parent == "") allParents.push(copyJson(OBJECTS[i]));
        }

        var DATA = {};
        for(var i = 0; i < allParents.length; i++) {
            applyChild(allParents[i]);
        }

        function applyChild(parent = OBJECT_TOOLS.objectTemplate) {
            var children = parent.getChildren();

            for(var i = 0; i < children.length; i++) {
                var child = copyJson(children[i]);
                var d = applyMotion({
                    pos: parent.pos,
                    rot: parent.rotation,
                    scale: parent.scale
                }, {
                    pos: child.pos,
                    rot: child.rotation,
                    scale: child.scale
                });
                
                child.pos = d.pos;
                child.rotation = d.rot;
                child.scale = d.scale;
                DATA[child.id] = {
                    pos: d.pos,
                    rotation: d.rot,
                    scale: d.scale
                }

                var childOfChild = child.getChildren();
                if(childOfChild.length > 0) {
                    applyChild(child)
                }
            }
            
        }

        function applyMotion(parentData = {pos:{x: 0, y: 0, z: 0}, rot: {z: 0}, scale: {x: 1, y: 1}}, childData = {pos:{x: 0, y: 0, z: 0}, rot: {z: 0}, scale: {x: 1, y: 1}}) {

            childData.pos.x += parentData.pos.x;
            childData.pos.y += parentData.pos.y;

            var myOGAngle = 0;
            var angleNeededToChange = (parentData.rot.z - myOGAngle);
            
            var myAngleToParent = UI_LOW_LEVEL.getAngleBetweenPoints(parentData.pos.x, parentData.pos.y, childData.pos.x, childData.pos.y);
            myAngleToParent -= 90;
            var newPos = UI_LOW_LEVEL.rotateAroundPoint(parentData.pos.x, parentData.pos.y, childData.pos.x, childData.pos.y, myAngleToParent + angleNeededToChange);

            childData.pos.x = newPos.x;
            childData.pos.y = newPos.y;

            childData.rot.z += angleNeededToChange;

            childData.pos.x -= parentData.pos.x;
            childData.pos.y -= parentData.pos.y;

            childData.scale.x *= parentData.scale.x;
            childData.scale.y *= parentData.scale.y;

            childData.pos.x *= parentData.scale.x;
            childData.pos.y *= parentData.scale.y;

            childData.pos.x += parentData.pos.x;
            childData.pos.y += parentData.pos.y;

            return childData;
        }

        return DATA;
    }
}