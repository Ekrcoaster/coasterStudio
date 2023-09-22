var CURRENTLY_LISTENING = [];
var UNDO_STEPS = [];

var UNDO_TOOLS = {
    startListening: function(path) {
        if(path == null) return null;
        var id = createID(777);

        var index = -1;
        for(var i = 0; i < CURRENTLY_LISTENING.length; i++) {
            if(CURRENTLY_LISTENING[i].path == path) index = i;
        }

        var initValue = UNDO_TOOLS.getValueAtPath(path);

        if(index > -1) {
            CURRENTLY_LISTENING[index] = {
                "initValue": initValue,
                "id": CURRENTLY_LISTENING[index].id,
                "path": path
            }
            id = CURRENTLY_LISTENING[index].id;
        } else {
            CURRENTLY_LISTENING.push({
                "initValue": initValue,
                "id": id,
                "path": path
            });
        }
        
        return id;
    },
    finishListening: function(id) {
        if(id == null) return false;
        var index = -1;
        for(var i = 0; i < CURRENTLY_LISTENING.length; i++) {
            if(CURRENTLY_LISTENING[i].id == id || CURRENTLY_LISTENING[i].path == id) index = i;
        }

        if(index == -1) {
            console.error("MISSING", id);
            return;
        }

        var initValue = UNDO_TOOLS.getValueAtPath(CURRENTLY_LISTENING[index].path);

        if(CURRENTLY_LISTENING[index].initValue == initValue) {
            CURRENTLY_LISTENING.splice(index, 1);
            return false;
        }

        if(CURRENTLY_LISTENING[index].initValue.toString() == "NaN") CURRENTLY_LISTENING[index].initValue = 0

        UNDO_STEPS.push({
            "id": id,
            "plan": `restore ${CURRENTLY_LISTENING[index].path} ${CURRENTLY_LISTENING[index].initValue}`
        });

        CURRENTLY_LISTENING.splice(index, 1);
        return true;
    },
    getValueAtPath: function(path) {
        return PROPERTIES_BACKEND.getPropertyValue(path);
    },
    addUndoStep: function(plan = ``) {
        UNDO_STEPS.push({
            "id": createID(777),
            "plan": plan
        });
    },

    onUndoRequested: function() {
        if(UNDO_STEPS.length == 0) return;
        var activeUndo = UNDO_STEPS.splice(UNDO_STEPS.length - 1, 1)[0];

        var planSteps = activeUndo.plan.split(" ");
        var label = planSteps.shift();

        var path = planSteps[0];
        var codedPath = PROPERTIES_BACKEND.generatePath(path);

        switch(label) {
            case "restore":
                var newValue = planSteps[1];

                var ogValueType = typeof(eval(codedPath));
               
                newValue = convertValue(ogValueType, newValue);

                eval(codedPath + ` = ${newValue}`);
            break;
            case "splice":
                var indexToSplice = planSteps[1];
                var amountToCut = planSteps[2];


                eval(codedPath + `.splice(${indexToSplice},${amountToCut})`);
            break;
            case "push":
                var newValue = planSteps[1];

                var ogValueType = typeof(eval(codedPath));
               
                newValue = convertValue(ogValueType, newValue);

                eval(codedPath + `.push(${newValue})`);
            break;
            case "function":
                eval(codedPath);                
            break;
            case "rawFunction":
                eval(planSteps.join(" "));
            break;
        }

        function convertValue(type, value) {
            value = value.replace(/_/g, " ");
            value = value.replace(/\"/g, "'")
            if(type == "number") return parseFloat(value);
            if(value.toString()[0] == "{") return value;
            if(value == "true") return true;
            if(value == "false") return false;
            return '"' + value + '"'
        }
    }
}