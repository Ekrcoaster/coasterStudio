
const PROPERTY_TYPES = {
    "int": "int",
    "float": "float",
    "bool": "bool",
    "color": "color",
    "angle": "angle",
    "string": "string"
}

var PROPERTIES = {
    propertyTemplate: {
        "path": "",
        "type": PROPERTY_TYPES.int,
        "id": "",
        "default": null,
        "keyframes": [],
        "influences": {
            "min": null,
            "max": null
        }
    },
    keyframeTemplate: {
        "frame": 0,
        "interpolation": "SMOOTH",
        "value": 0
    },
    createProperty: function(type = PROPERTY_TYPES.int, propertyPath = "", defaultValue, min = null, max = null) {
        var temp = copyJson(this.propertyTemplate);
        temp.type = type;
        temp.path = propertyPath;
        temp.id = createID(77);
        temp.default = defaultValue;
        temp.influences.min = min;
        temp.influences.max = max;
        temp.keyframes = [];

        temp.setValue = function(newValue) {
            return PROPERTIES_BACKEND.applyProperty(temp.path, newValue)
        }

        temp.getValue = function() {
            return PROPERTIES_BACKEND.getPropertyValue(temp.path);
        }

        temp.keyFrame = function() {
            var keyframeTemplate = copyJson(PROPERTIES.keyframeTemplate);
            keyframeTemplate.frame = FRAMES.current;
            keyframeTemplate.value = temp.getValue();

            var index = -1;
            for(var i = 0; i < temp.keyframes.length; i++) {
                if(temp.keyframes[i].frame == FRAMES.current) {
                    index = i;
                }
            }

            if(index == -1) {
                temp.keyframes.push(keyframeTemplate);
            } else {
                temp.keyframes[index] = keyframeTemplate;
            }

            return keyframeTemplate;
        }

        temp.applyKeyframe = function() {
            var lastKeyFrame = -1, nextKeyFrame = -1;

            for(var i = 0; i < temp.keyframes.length; i++) {
                if(temp.keyframes[i].frame <= FRAMES.current) {
                    lastKeyFrame = i;
                }
            }
            for(var i = Math.max(lastKeyFrame, 0); i < temp.keyframes.length; i++) {
                if(temp.keyframes[i].frame > FRAMES.current && nextKeyFrame == -1) {
                    nextKeyFrame = i;
                }
            }

            if(lastKeyFrame == -1 && nextKeyFrame == -1) return;

            var lastKeyFrameObject = lastKeyFrame > -1 ? temp.keyframes[lastKeyFrame] : null;
            var nextKeyFrameObject = nextKeyFrame > -1 ? temp.keyframes[nextKeyFrame] : null;

            var percentageToNextFrame = 0;
            if(lastKeyFrameObject == null) percentageToNextFrame = 1;

            if(lastKeyFrameObject && nextKeyFrameObject) {
                var relative = nextKeyFrameObject.frame - lastKeyFrameObject.frame;
                var currentFrameRelative = FRAMES.current - lastKeyFrameObject.frame;
                var percentage = currentFrameRelative / relative;
                if(percentage > 1) percentage = 1;
                if(percentage < 0) percentage = 0;

                var interpolation = calculateInterAmount(percentage);

                var newValue = calculateValue(interpolation, lastKeyFrameObject.value, nextKeyFrameObject.value);
                temp.setValue(newValue);
            } else if(nextKeyFrameObject) {
                lastKeyFrameObject = nextKeyFrameObject;
                var interpolation = calculateInterAmount(1);
                var newValue = calculateValue(interpolation, lastKeyFrameObject.value, nextKeyFrameObject.value);
                temp.setValue(newValue);
            } else if(lastKeyFrameObject) {
                nextKeyFrameObject = lastKeyFrameObject;
                var interpolation = calculateInterAmount(0);
                var newValue = calculateValue(interpolation, lastKeyFrameObject.value, nextKeyFrameObject.value);
                temp.setValue(newValue);
            }
            function calculateInterAmount(linearIn) {
                if(lastKeyFrameObject.interpolation == "SMOOTH") return smooth0To1(linearIn);
                return linearIn;
            }

            function calculateValue(interpolation, valA, valB) {
                switch(temp.type) {
                    case PROPERTY_TYPES.angle:
                        var mainDistance = Math.abs(valA - valB);
                        var altDistance = Math.abs((valA - 360) - valB);
                        if(altDistance < mainDistance) {
                            return mapClamp(interpolation, 0, 1, valA-360, valB);
                        }
                        
                        altDistance = Math.abs((valA + 360) - valB);
                        if(altDistance < mainDistance) {
                            return mapClamp(interpolation, 0, 1, valA+360, valB);
                        }
                        
                        return mapClamp(interpolation, 0, 1, valA, valB);
                    case PROPERTY_TYPES.color:
                        return lerpColor(valA, valB, interpolation)

                    case PROPERTY_TYPES.string:
                        if(interpolation >= 1) return valB;
                        return valA;
                    
                    default:
                        return mapClamp(interpolation, 0, 1, valA, valB);
                }
            }
        },

        temp.getKeyAtFrame = function(frame) {
            for(var i = 0; i < temp.keyframes.length; i++) {
                if(temp.keyframes[i].frame == frame) return temp.keyframes[i];
            }
            return null;
        },

        temp.sortFrames = function() {
            function Comparator(a, b) {
                if (a.frame < b.frame) return -1;
                if (a.frame > b.frame) return 1;
                return 0;
            }
    
            temp.keyframes.sort(Comparator);
        },

        temp.getLastKeyframe = function(frame) {
            var lastKeyFrame = -1;
            for(var i = 0; i < temp.keyframes.length; i++) {
                if(temp.keyframes[i].frame <= frame) {
                    lastKeyFrame = i;
                }
            }
            if(lastKeyFrame == -1) return null;
            return temp.keyframes[lastKeyFrame];
        }

        temp.removeFrames = function(frame) {
            for(var i = 0; i < temp.keyframes.length; i++) {
                if(temp.keyframes[i].frame == frame) {
                    temp.keyframes.splice(i, 1);
                    i--;
                }
            }
        },

        temp.clearAll = function() {
            temp.keyframes = [];
        }

        temp.setFrameInterpolation = function(frame, newInterpolation) {
            for(var i = 0; i < temp.keyframes.length; i++) {
                if(temp.keyframes[i].frame == frame) {
                    temp.keyframes[i].interpolation = newInterpolation;
                }
            }
        }

        PROPERTY_LISTENERS.push(temp);
    },
    
    createIntProperty: function(propertyPath = "", defaultValue = 0, min = null, max = null) {
        return this.createProperty(PROPERTY_TYPES.int, propertyPath, defaultValue, min, max);
    },
    createFloatProperty: function(propertyPath = "", defaultValue = 0, min = null, max = null) {
        return this.createProperty(PROPERTY_TYPES.float, propertyPath, defaultValue, min, max);
    },
    createBoolProperty: function(propertyPath = "", defaultValue = false) {
        return this.createProperty(PROPERTY_TYPES.bool, propertyPath, defaultValue, null, null);
    },
    createColorProperty: function(propertyPath = "", defaultValue = "white") {
        return this.createProperty(PROPERTY_TYPES.color, propertyPath, defaultValue, null, null);
    },
    createAngleProperty: function(propertyPath = "", defaultValue = 0) {
        return this.createProperty(PROPERTY_TYPES.angle, propertyPath, defaultValue, null, null);
    },
    createStringProperty: function(propertyPath = "", defaultValue = "") {
        return this.createProperty(PROPERTY_TYPES.string, propertyPath, defaultValue, null, null);
    },

    updateFrame: function() {
        for(var i = 0; i < PROPERTY_LISTENERS.length; i++) {
            PROPERTY_LISTENERS[i].applyKeyframe();
        }
    }
}

var PROPERTIES_BACKEND = {
    applyProperty: function(path = ".", newValue) {
        
        var codeSoFar = PROPERTIES_BACKEND.generatePath(path);
        if(typeof(newValue) == "string") {
            codeSoFar += ` = "${newValue}"`;
        } else {
            codeSoFar += ` = ${newValue}`;
        }

        eval(codeSoFar);
        return newValue;
    },
    getPropertyValue: function(path = ".") {
        return eval(`${PROPERTIES_BACKEND.generatePath(path)}`);
    },
    getPropertyAtPath: function(path = ".") {
        for(var i = 0; i < PROPERTY_LISTENERS.length; i++) {
            if(PROPERTY_LISTENERS[i].path == path) return PROPERTY_LISTENERS[i];
        }
        return null;
    },
    generatePath: function(path = ".") {
        var steps = path.split(".");

        var init = steps.shift();

        if(init == "OBJECTS") {
            var id = steps.shift();
            if(id) {
                init = `OBJECT_TOOLS.getObject("${id}")`;
            }
        }
        
        var codeSoFar = `${init}`;
        for(var i = 0; i < steps.length; i++) {
            codeSoFar += `["${steps[i]}"]`;
        }
        return codeSoFar;
    },
    getKeysAtFrame: function(frame) {
        var keys = [];
        for(var i = 0; i < PROPERTY_LISTENERS.length; i++) {
            var fr = PROPERTY_LISTENERS[i].getKeyAtFrame(frame);
            if(fr != null)
            keys.push(fr);
        }
        return keys;
    },
    changeAllKeyframeFrames: function(oldFrame, newFrame) {
        for(var i = 0; i < PROPERTY_LISTENERS.length; i++) {
            var fr = PROPERTY_LISTENERS[i].getKeyAtFrame(oldFrame);
            if(fr) 
            {
                fr.frame = newFrame;
                PROPERTY_LISTENERS[i].sortFrames();
            }
        }
    },
    removeFramesAt: function(frame) {
        for(var i = 0; i < PROPERTY_LISTENERS.length; i++) {
            PROPERTY_LISTENERS[i].removeFrames(frame);
        }
    },
    changeInterpolationForFrameAt: function(frame, newType) {
        for(var i = 0; i < PROPERTY_LISTENERS.length; i++) {
            PROPERTY_LISTENERS[i].setFrameInterpolation(frame, newType);
        }
    },
    getKeyframeColor: function(key) {
        if(key == null) return "rgba(0,0,0,0)";
        if(key.interpolation == "SMOOTH") return "#e56732";
        if(key.interpolation == "LINEAR") return "#4ce532";
        return "#3273e5";
    },
    keyframeAtPath: function(path = ".") {
        var property = this.getPropertyAtPath(path);
        if(property) property.keyFrame();
    }
}