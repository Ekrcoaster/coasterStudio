var active_ui = {
    "dropDown": {},
    "typing": {},
    "textField": {},
    "chooserDropdown": {},
    "colorField": {},
    "imgField": {}
}

var down = [];

function UI_ClearDown() {
    down = [];
}


//{"name": "", "value": ""}
var UI_TOOLS = {

    rectAbsolute: function(x1, y1, x2, y2, normalColor = "", hylightedColor = "", toolID = "", buffer = 0, boundsExtension = {x1: 0, y1: 0, x2: 0, y2: 0}, detailPanel = "") {
        if(detailPanel != "")
            DETAILED_PANEL_TOOLS.registerRegion(detailPanel, {x1: x1, y1: y1, x2: x2, y2: y2});
        if(boundsExtension == null) boundsExtension = {x1: 0, y1: 0, x2: 0, y2: 0};
        var isMouseIn = UI_LOW_LEVEL.isMouseIn(x1 + boundsExtension.x1, y1 + boundsExtension.y1, x2 + boundsExtension.x2, y2 + boundsExtension.y2, buffer) || ACTIVE_TOOL == toolID;
        isMouseIn = isMouseIn && staticUISpace.mouse.isDown;

        if(ACTIVE_TOOL != "" && ACTIVE_TOOL != toolID) {
            isMouseIn = false;
        }
        
        if(isMouseIn) {
            ACTIVE_TOOL = toolID;
        }

        UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, (isMouseIn ? hylightedColor : normalColor));
        if(ACTIVE_TOOL != "" && ACTIVE_TOOL != toolID) return false;

        return isMouseIn;
    },

    rotateArc: function(originX, originY, radius, inputAngle, angelRange, toolID = "", snapAmount = 1, fillColor = "", outlineColor = "", outlineThickness = 0, filters = [], keyboardShortcut = "", isMouseInWindow) {
        UI_LOW_LEVEL.drawArc(originX, originY, radius, inputAngle-(angelRange/2), angelRange, fillColor, outlineColor, outlineThickness, filters);
        if((ACTIVE_TOOL == "" && UI_LOW_LEVEL.isMouseInRadius(originX, originY, radius, radius, inputAngle-(angelRange/2), inputAngle+(angelRange/2), 25) && staticUISpace.mouse.isDown) || ACTIVE_TOOL == toolID || KEYS_DOWN_UNTIL_CLICK.indexOf(keyboardShortcut) > -1 && isMouseInWindow) {
            var angle = UI_LOW_LEVEL.getMouseAngle(originX, originY);
            staticUISpace.mouse.isClick = false;
            ACTIVE_TOOL = toolID;
            if(KEYS_DOWN.indexOf("CTRL") > -1) {
                angle = Math.round(angle/snapAmount)*snapAmount;
                for(var i = 0; i < 360; i += snapAmount) {
                    var x = Math.cos(i*DEG_TO_RAD);
                    var y = Math.sin(i*DEG_TO_RAD);
                    UI_LOW_LEVEL.drawLine(x*(radius*.9) + originX, y*(radius*.9) + originY, x*(radius*1.1) + originX, y*(radius*1.1) + originY, outlineColor, outlineThickness/2)
                }
            }
            inputAngle = angle;
            UI_LOW_LEVEL.drawArc(originX, originY, radius, 0, 360, "", outlineColor, outlineThickness/4);
        }
        return inputAngle;
    },

    buttonImage: function(iconID = IMAGES.ICONS, x, y, width, height, forceSelect = false, allowIFToolBusy = false) {
        var mouseIn = UI_LOW_LEVEL.isMouseIn(x, y, x+width, y+height, 0);

        if(!allowIFToolBusy) {
            if(ACTIVE_TOOL != "") mouseIn = false;
        }
        //console.log(staticUISpace.mouse.pos, {"x": x, "y": y})
        var shouldActivate = mouseIn && staticUISpace.mouse.isDown;
        if(shouldActivate) {
            if(down.indexOf(iconID) > -1) {
                shouldActivate = false;
            } else {
                down.push(iconID);
            }
        }

        UI_LOW_LEVEL.drawImage(iconID, x, y, width, height, 0, mouseIn || forceSelect ? [{"name": "brightness", "value": "2"}] : []);

        return shouldActivate;
    },

    buttonText: function (text, x, y, width, height, forceSelectID = "", allowIFToolBusy = false, customColors = {"default": COLORS.slightlyDarkerBackgroundGray, "hylighted": COLORS.highlightOutline}) {
        var mouseIn = UI_LOW_LEVEL.isMouseIn(x, y, x+width, y+height, 0);
        if(!allowIFToolBusy) {
            if(ACTIVE_TOOL != "") mouseIn = false;
        }
        var shouldActivate = mouseIn && staticUISpace.mouse.isDown;
        if(forceSelectID.length > 0) {
            if(down.indexOf(forceSelectID) > -1) {
                shouldActivate = false;
            } else {
                down.push(forceSelectID);
            }
        }
        UI_LOW_LEVEL.drawRectLocal(x, y, width, height, 0, mouseIn || forceSelectID.length > 0 ? customColors.hylighted : customColors.default);
        UI_LOW_LEVEL.drawText(text, (x+x+width)/2, (y+y+height)/2+(height/5), 20, COLORS.normalTextColor, "center", "center");
        
        return shouldActivate;
    },

    toggleImage: function(iconID = IMAGES.ICONS, x, y, width, height, inValue) {
        if(this.buttonImage(iconID, x, y, width, height, inValue)) {
            inValue = !inValue;
        }
        return inValue;
    },

    typeTextInvisible: function(x, y, inputText, size, color, type = "text", align = "left", uniqueKey = "", isInteractable = true) {
        var spaceTaken = UI_LOW_LEVEL.calculateTextSpace(inputText, x, y, size, color, align);
        var drawLetters = [];
        var actualLetters = [];
        var dI = -1;
        for(var i = 0; i < inputText.length+1; i++) {
            if(active_ui.typing != null && active_ui.typing.id == uniqueKey) {
                if(i == active_ui.typing.key) {
                    if(active_ui.typing.newText != "") {
                        if(active_ui.typing.newText == -1) {
                            actualLetters.splice(i-1, 1);
                            active_ui.typing.newText = "";
                            active_ui.typing.key--;
                        } else {
                            actualLetters.push(active_ui.typing.newText);
                            active_ui.typing.newText = "";
                            active_ui.typing.key++;
                        }
                        
                    }
                    drawLetters.push("|");
                    dI = drawLetters.length-1;
                }
            }
            if(i < inputText.length)
            drawLetters.push(inputText[i]);
            actualLetters.push(inputText[i]);
        }
        
        UI_LOW_LEVEL.drawText(drawLetters.join(""), x, y, size, color, align);
        var isMouseIn = UI_LOW_LEVEL.isMouseIn(spaceTaken.x1, spaceTaken.y1, spaceTaken.x2, spaceTaken.y2, 0);
        if(isMouseIn && staticUISpace.mouse.isClick && isInteractable) {
            var percentage = (staticUISpace.mouse.pos.x - spaceTaken.x1)/(spaceTaken.x2-spaceTaken.x1);
            var key = Math.round(percentage*inputText.length);
            active_ui.typing= {
                "key": key,
                "id": uniqueKey,
                "length": inputText.length,
                "newText": ""
            }
        }

        if(staticUISpace.mouse.isClick && !isMouseIn && active_ui.typing.id == uniqueKey) {
            active_ui.typing = {};
        }


        return {"newText": actualLetters.join(""), "isSelected": active_ui.typing != null && (active_ui.typing.id == uniqueKey)};
    },

    toggleBox: function(x, y, size, isOn) {
        UI_LOW_LEVEL.drawRectLocal(x, y, size, size, 0, isOn ? "grey": "rgba(194,222,255,0)", "white", 3);

        if(staticUISpace.mouse.isClick && UI_LOW_LEVEL.isMouseIn(x, y, x+size, y+size, 3)) {
            isOn = !isOn;
        }
        return isOn;
    },

    dropDown: function(x, y, size, icon, contents = [{"name": "", "icon": ""}], inputIndex = 0, uniqueKey = "", selectActive = true, dropDownTitle = "", direction = "up_right") {
        if(this.buttonImage(icon, x, y, size, size, active_ui.dropDown.id == uniqueKey)) {
            active_ui.dropDown = {
                "id": uniqueKey
            }
        }

        if(active_ui.dropDown.id == uniqueKey) {

            var panel = {
                x: x+size+10,
                y: y+size-5,
                width: 170,
                height: 0,
                heightPadding: 6,
                spacing: 45,
                topSpacing: 0
            }
            panel.height = panel.heightPadding*2 + (panel.spacing*contents.length);

            if(dropDownTitle != 0) {
                panel.topSpacing = 40;
            }


            UI_LOW_LEVEL.drawRectAbsolute(panel.x, panel.y-panel.height-panel.topSpacing, panel.x + panel.width, panel.y, 0, COLORS.slightlyDarkerBackgroundGray, COLORS.hylightGray, 8 , [{"name": "drop-shadow", "value": "0px 0px 5px rgba(0,0,0,0.49)"}]);
            if(panel.topSpacing != 0) {
                UI_LOW_LEVEL.drawLine(panel.x, panel.y-panel.height, panel.x + panel.width, panel.y-panel.height, COLORS.hylightOutline, 3);
                UI_LOW_LEVEL.drawText(dropDownTitle, panel.x+5, (panel.y-panel.height-panel.topSpacing + (panel.y-panel.height))/2, 35, "white", "left", "middle")
            }

            for(var i = 0; i < contents.length; i++) {
                var item = {
                    x1: panel.x,
                    y1: (panel.y-panel.height)+panel.heightPadding + (i*panel.spacing),
                    x2: panel.x + panel.width,
                    y2: (panel.y-panel.height)+panel.heightPadding + ((i+1)*panel.spacing),
                }
                if(UI_LOW_LEVEL.isMouseIn(item.x1, item.y1, item.x2, item.y2, 0)) {
                    UI_LOW_LEVEL.drawRectAbsolute(item.x1, item.y1, item.x2, item.y2, 0, COLORS.hylightGray);
                    if(staticUISpace.mouse.isClick) {
                        inputIndex = i;
                        active_ui.dropDown = {};
                    }
                } else if(selectActive && inputIndex == i) {
                    UI_LOW_LEVEL.drawRectAbsolute(item.x1, item.y1, item.x2, item.y2, 0, COLORS.hylightGray);
                }
                var textOffset = 5;
                if(contents[i].icon != "" && contents[i].icon != null) {
                    UI_LOW_LEVEL.drawImage(contents[i].icon, item.x1 + 5, item.y1+panel.spacing/5, 30, 30, 0);
                    textOffset+= 35;
                }
                UI_LOW_LEVEL.drawText(contents[i].name, item.x1 + textOffset, (item.y2+item.y1)/2, 25, "white", "left", "middle");
            }
            return inputIndex;

            var start = {
                x: x+size+10,
                y: y+size-5
            }

            var spacing = 35;
            var windowSize = {
                x: start.x,
                y: start.y,
                x2: start.x + 164,
                y2: start.y - (contents.length*spacing)-10
            }

            
            for(var i = 0; i < contents.length; i++) {
                var item = {
                    x: windowSize.x+4,
                    y: windowSize.y-(i*spacing)-4,
                    x2: windowSize.x2-4,
                    y2: windowSize.y-(i*spacing)-30
                }
                if(UI_LOW_LEVEL.isMouseIn(item.x, item.y2, item.x2, item.y, 0)) {
                    UI_LOW_LEVEL.drawRectAbsolute(item.x, item.y, item.x2, item.y2, 0, "red");
                }
                
                UI_LOW_LEVEL.drawText(contents[i].name, start.x+7, start.y-(i*spacing)-14, 25, "white", "left");
            }
        
        }
    },

    textField: function(x, y, width, height, inputValue, type = "text", textSize = 20, style = {textColor: "white", backgroundColor: "grey", border: "white"}, key) {
        UI_LOW_LEVEL.drawRectLocal(x, y, width, height, 0, style.backgroundColor, style.border, 3);

        var res = UI_TOOLS.improvedInvisibleTextField(x+5, y+height-2, inputValue, type, width, textSize, style.textColor, key);
        //var res = UI_TOOLS.typeTextInvisible(x,(y+y+height)/2+6, inputValue, textSize, style.textColor, type, "left", key);
        return res;
    },

    improvedInvisibleTextField: function(x1, y1, inputValue, type = "string", maxWidth = 0, textSize = 20, color = "white", uniqueKey = "") {
        if(active_ui.textField.id == uniqueKey) {
            color = "#bde6f8";
        }

        if(type == "int") {
            inputValue = Math.round(inputValue);
            if(inputValue == 0 && active_ui.textField.action != "" && active_ui.textField.id == uniqueKey) {
                inputValue = parseInt(active_ui.textField.action);
                active_ui.textField.action = "";
                active_ui.textField.cursorPoint++;
            }
            if(isNaN(inputValue)) inputValue = 0;
            inputValue = inputValue.toString();
        }

        if(type == "float") {
            if(active_ui.textField.action == ".") active_ui.textField.action = ".1";
            inputValue = (Math.round(inputValue*1000)/1000)
            if(inputValue == 0 && active_ui.textField.action != "" && active_ui.textField.id == uniqueKey) {
                inputValue = parseFloat(active_ui.textField.action);
                active_ui.textField.action = "";
                active_ui.textField.cursorPoint++;
            }
            if(isNaN(inputValue)) inputValue = 0;
            inputValue = inputValue.toString();
        }

        var calculations = UI_LOW_LEVEL.drawText(inputValue, x1, y1, textSize, color, "left", "bottom");
        var isInRange = UI_LOW_LEVEL.isMouseIn(x1, y1-15, x1+maxWidth, y1, 5) && ACTIVE_TOOL == "" || ACTIVE_TOOL == uniqueKey;
        if(active_ui.textField.id == uniqueKey) {
            if(active_ui.textField.selection > -1) {
                UI_LOW_LEVEL.drawRectAbsolute(calculations.x1 + calculateLetterPosition(active_ui.textField.cursorPoint), calculations.y1, calculations.x1 + calculateLetterPosition(active_ui.textField.selection), calculations.y2, 0, "rgba(0,0,0,0.5)");

            }

            active_ui.textField.textSoFar = inputValue;
            if(staticUISpace.mouse.isClick && isInRange) {
                active_ui.textField.cursorPoint = calculateCursorPosition();
            } else if(staticUISpace.mouse.isDown) {
                active_ui.textField.selection = calculateCursorPosition();
            }

            var letterDistance = calculateLetterPosition(active_ui.textField.selection == -1 ? active_ui.textField.cursorPoint : active_ui.textField.selection);

            
            if(active_ui.textField.action == "REMOVE") {
                if(active_ui.textField.selection > -1) {
                    removeContentInSelection();
                } else {
                    inputValue = removeLetterAtIndex(inputValue, Math.max(active_ui.textField.cursorPoint-1, 0));
                    active_ui.textField.cursorPoint--;
                    if(active_ui.textField.cursorPoint < 0) active_ui.textField.cursorPoint = 0;
                }
                active_ui.textField.action = ""
            } else if(active_ui.textField.action != "") {
                if(active_ui.textField.selection > -1) {
                    removeContentInSelection();
                }

                inputValue = inputValue.slice(0, active_ui.textField.cursorPoint) + active_ui.textField.action + inputValue.slice(active_ui.textField.cursorPoint);
                active_ui.textField.cursorPoint++;
                active_ui.textField.action = "";
            }

            function removeContentInSelection() {
                var smallIndex = 0, bigIndex = 0;

                if(active_ui.textField.selection > active_ui.textField.cursorPoint) {
                    smallIndex = active_ui.textField.cursorPoint;
                    bigIndex = active_ui.textField.selection;
                } else {
                    smallIndex = active_ui.textField.selection;
                    bigIndex = active_ui.textField.cursorPoint;
                }

                var result = inputValue.split('');
                result.splice(smallIndex, bigIndex - smallIndex);
                inputValue = result.join('');

                if(active_ui.textField.selection < active_ui.textField.cursorPoint) active_ui.textField.cursorPoint = active_ui.textField.selection;
                active_ui.textField.selection = -1;
            }
            
            UI_LOW_LEVEL.drawRectLocal(calculations.x1 + letterDistance, y1, 2, calculations.height, 0, `rgba(184, 234, 255, ${((Math.sin(TIME*40)/2)+ 1)})`)
        } else {
            if(staticUISpace.mouse.isClick && isInRange) {
                ACTIVE_TOOL = uniqueKey;
                active_ui.textField = {
                    "id": uniqueKey,
                    "cursorPoint": calculateCursorPosition(),
                    "selection": -1,
                    "action": "",
                    "textSoFar": inputValue
                }
            }
        }
        
        if(staticUISpace.mouse.isClick && !isInRange && active_ui.textField.id == uniqueKey) {
            active_ui.textField = {};

        }

        function calculateCursorPosition() {
            var n = Math.round((staticUISpace.mouse.pos.x - calculations.x1) / (calculations.x2 - calculations.x1)*inputValue.length);
            if(n > inputValue.length) n = inputValue.length;
            return n;
        }

        function calculateLetterPosition(index) {
            var letterDistance = 0;
            for(var i = 0; i < Math.min(index, inputValue.length); i++) {
                var letCalc = UI_LOW_LEVEL.calculateTextSpace(inputValue[i], 0, 0, textSize, color, "left", "buttom");
                letterDistance += (letCalc.width);
            }
            return letterDistance;
        }

        if(type == "int") {
            inputValue = parseInt(inputValue);
        }

        if(type == "float") {
            inputValue = parseFloat(inputValue);
        }

        return inputValue;
    },

    choserDropdownDataGiver: function(dataType = "objects") {
        var data = [];
        if(dataType == "objects") {
            var tdata = [
                {"value": "[EMPTY]", "icon": IMAGES.ICONS.createSquare}
            ]
            for(var i = 0; i < OBJECTS.length; i++) {
                if(SELECTED.active != OBJECTS[i].id)
                tdata.push({"value": OBJECTS[i].id, "icon": "{objectRender}", "display": OBJECTS[i].name});
            }
            
            data = tdata;
        }
        if(dataType == "object-types") {
            data = [
                {"display": "Image", "icon": IMAGES.ICONS.createImage, "value": OBJECT_TYPES.image},
                {"display": "Rectangle", "icon": IMAGES.ICONS.createSquare, "value": OBJECT_TYPES.colored_rect},
                {"display": "Circle", "icon": IMAGES.ICONS.createCircle, "value": OBJECT_TYPES.colored_elipse},
                {"display": "Triangle", "icon": IMAGES.ICONS.createTriangle, "value": OBJECT_TYPES.colored_triangle},
            ]
        }
        return {"data": data, "type": dataType};
    },

    chooserDropdown: function(x1, y1, width, height, inputValue, key = "", data = []) {
        UI_LOW_LEVEL.drawRectLocal(x1, y1, width, height, 0, COLORS.backgroundGray, COLORS.hylightOutline, 3);
        var textColor = COLORS.normalTextColor;
        var displayValue = inputValue;
        var iconOffset = 0;

        //handle data
        var dataType = "default";
        if(data.data != null) {
            dataType = data.type;
            data = data.data;
        }
        var selectedIndex = -1;
        for(var i = 0; i < data.length; i++) {
            if(data[i].value == inputValue) selectedIndex = i;
        }

        //custom behavior
        if(dataType == "objects") {
            displayValue = OBJECT_TOOLS.getObject(inputValue);
            if(displayValue == null) {
                displayValue = "[MISSING]";
                textColor = "#e94e46";
            }
            if(inputValue == "" || inputValue == "[EMPTY]") {
                displayValue = "[EMPTY]";
                textColor = COLORS.normalTextColor;
            }

            var selectedObject = OBJECT_TOOLS.getObject(inputValue);
            if(selectedObject != null) {
                iconOffset += 28;
                RENDER_OBJECT_LOCALLY(selectedObject, x1+5, y1+5, x1+20, y1+height-5);
            }
            if(selectedIndex == -1) selectedIndex = 0;
        }

        //icon and custom display handling
        if(selectedIndex > -1) {
            if(data[selectedIndex].display) displayValue = data[selectedIndex].display;

            if(data[selectedIndex].icon != null && data[selectedIndex].icon != "" && iconOffset == 0) {
                iconOffset += 28;
                UI_LOW_LEVEL.drawImage(data[selectedIndex].icon, x1, y1, 25, height, 0, [])
            }
        }

        //draw data text
        UI_LOW_LEVEL.drawText(displayValue, x1 + iconOffset, y1+3, 20, textColor, "left", "top");


        //popup behavior
        if(active_ui.chooserDropdown.id == key) {
            if(active_ui.chooserDropdown.chosenOption != null) {
                inputValue = active_ui.chooserDropdown.chosenOption;

                active_ui.chooserDropdown = {}
            }

            if(staticUISpace.mouse.postClick) {
                active_ui.chooserDropdown = {}
            }
        } else {
            if(UI_LOW_LEVEL.isMouseIn(x1, y1, x1 + width, y1 + height, 0) && staticUISpace.mouse.isClick && ACTIVE_TOOL == "") {
                active_ui.chooserDropdown = {
                    "id": key,
                    "invert": ((y1 / INFO_CANVAS.height) > 0.5) ? -1 : 1,
                    "x1": x1,
                    "y1": y1,
                    "width": width,
                    "height": height,
                    "inputValue": inputValue,
                    "displayValue": displayValue,
                    "key": key,
                    "data": data,
                    "chosenOption": null,
                    "type": data
                }
                ACTIVE_TOOL = "a"
                staticUISpace.mouse.isClick = false;
                staticUISpace.mouse.postClick = false;
                staticUISpace.mouse.isDown = false;
                staticUISpace.mouse.isClick = false;
                staticUISpace.mouse.postClick = false;
            }
        }
        return inputValue;
    },

    colorPicker: function(x, y, width, height, inputHex, uniqueKey = "", savedColorsDatabase = "default") {
        UI_LOW_LEVEL.drawRectLocal(x+4, y+4, width-8, height-8, 0, inputHex, COLORS.highlightOutline, 10);

        var isInRange = UI_LOW_LEVEL.isMouseIn(x, y, x + width, y + height, 0);

        if(active_ui.colorField.id == uniqueKey) {
            var hue = active_ui.colorField.chooserHueValue;
            var sat = active_ui.colorField.chooserSaturationValue;
            var val = active_ui.colorField.chooserBrightnessValue/2;

            val += ((100-sat) * (val/50))/2;

            inputHex = hslToHex(hue, sat, val);
            active_ui.colorField.color = inputHex;
            if(active_ui.colorField.overrideColor) {
                active_ui.colorField.color = active_ui.colorField.overrideColor;
                var hsl = hexToHSL(active_ui.colorField.color);

                active_ui.colorField.chooserHueValue = hsl.h*360;
                active_ui.colorField.chooserSaturationValue = hsl.s*100;
                active_ui.colorField.chooserBrightnessValue = (hsl.v/.5)*100;
                active_ui.colorField.overrideColor = null;
            }

            if(staticUISpace.mouse.postClick) {
                if(isInRange || !active_ui.colorField.isMouseInBox) {
                    active_ui.colorField = {}
                }
            }
        } else {
            if(staticUISpace.mouse.isClick && isInRange && ACTIVE_TOOL == "") {
                var hsl = hexToHSL(inputHex);
                active_ui.colorField = {
                    "id": uniqueKey,
                    "invert": ((y / INFO_CANVAS.height) > 0.5) ? -1 : 1,
                    "x": x,
                    "y": y,
                    "width": width,
                    "height": height,
                    "chooserHueValue": hsl.h*360,
                    "chooserSaturationValue": hsl.s*100,
                    "chooserBrightnessValue": (hsl.v/.5)*100,
                    "color": inputHex,
                    "initColor": inputHex,
                    "pastTool": "",
                    "savedColorsDatabase": savedColorsDatabase,
                    "overrideColor": null,
                    "isMouseInBox": true
                }
                
                staticUISpace.mouse.isClick = false;
                staticUISpace.mouse.postClick = false;
            }
        }

        return inputHex;
    },

    userImageChooser: function(x, y, width, height, inputID, key) {
        UI_LOW_LEVEL.drawRectLocal(x+4, y+4, width-8, height-8, 0, COLORS.slightlyDarkerBackgroundGray, COLORS.highlightOutline, 5);

        var display = inputID == "" ? "No Image Selected" : inputID;
        UI_LOW_LEVEL.drawText(display, x+5, y+height-2, 18, COLORS.normalTextColor, "left", "bottom");

        var isMouseIn = UI_LOW_LEVEL.isMouseIn(x, y, x+width, y+height, 0);

        if(active_ui.imgField.key == key) {
            inputID = active_ui.imgField.input;
            if(!active_ui.imgField.isMouseIn && staticUISpace.mouse.postClick) {
                active_ui.imgField = {}
            }
        } else {
            if(isMouseIn && staticUISpace.mouse.isClick && ACTIVE_TOOL == "") {
                active_ui.imgField = {
                    "key": key,
                    "input": inputID,
                    "lastTool": "",
                    "isMouseIn": false
                }
                staticUISpace.mouse.isDown = false;
                staticUISpace.mouse.isClick = false;
                staticUISpace.mouse.postClick = false;
            }
        }
        return inputID;
    }
}

function lateUIRenderer() {
    if(active_ui.chooserDropdown.id != null) {
        renderDropdown();
    }

    if(active_ui.colorField.id != null) {
        renderColorField();
    }

    if(active_ui.imgField.key != null) {
        renderImageField();
    }

    function renderDropdown() {
        var myData = active_ui.chooserDropdown;
        var invert = myData.invert;
        var shouldInvert = invert == 1;

        var itemHeight = 32;
        UI_LOW_LEVEL.drawRectLocal(myData.x1, myData.y1+(myData.height), myData.width, (itemHeight*(myData.data.length)+15)*invert, 0, COLORS.slightlyDarkerBackgroundGray, COLORS.hylightOutline, 4, [{name: "drop-shadow", value: "0px 0px 5px black"}])
    
        if(ACTIVE_TOOL == "opened_dropdown_" + active_ui.chooserDropdown.key) ACTIVE_TOOL = ""

        for(var i = 0; i < myData.data.length; i++) {
            var y = myData.y1 + ((i+1)*itemHeight*invert);
            if(!shouldInvert) y+=15;
            if(UI_TOOLS.rectAbsolute(myData.x1, y, myData.x1 + myData.width, y + itemHeight, "", "white", "select_dropdown_" + i, 0)) {
                active_ui.chooserDropdown.chosenOption = myData.data[i].value;
            }

            var objectSelected = OBJECT_TOOLS.getObject(myData.data[i].value);
            var iconOffset = 0;

            var displayValue = myData.data[i].value;
            if(myData.type == "objects") {
                var objectName = myData.data[i].value != "[EMPTY]" ? objectSelected.name : "[EMPTY]";
                //displayValue = objectName;
            }

            if(myData.data[i].display != null) displayValue = myData.data[i].display;
            
            if(myData.data[i].icon == "{objectRender}") {
                iconOffset += 32;
                RENDER_OBJECT_LOCALLY(objectSelected, myData.x1+5, y+5, myData.x1+iconOffset, y+32);
            } else if(myData.data[i].icon != "" && myData.data[i].icon != null) {
                iconOffset += 32;
                UI_LOW_LEVEL.drawImage(myData.data[i].icon, myData.x1+2, y, iconOffset, 28, 0, [])
            }


            UI_LOW_LEVEL.drawText('"' + displayValue + '"', myData.x1+5 + iconOffset, ((y + itemHeight + y) /2)+8, 25, COLORS.normalTextColor, "left", "center");

        }

        ACTIVE_TOOL = "opened_dropdown_" + active_ui.chooserDropdown.key

    }

    function renderColorField() {
        var myData = active_ui.colorField;
        var invert = myData.invert;

        var container = {
            pivotX: myData.x,
            pivotY: myData.y,
            centerX: 0,
            centerY: 0,
            width: 320,
            height: 370
        }

        if(invert == -1) {
            container.pivotY -= container.height
        }

        var sc = SAVED_COLORS[myData.savedColorsDatabase];
        if(sc) {
            container.height += Math.max(0, Math.ceil((Math.min(sc.length+1, 40)) / 8)-2)*34;
        }

        container.centerX = (myData.x + myData.x + container.width) / 2;
        container.centerY = (myData.y + myData.y + (container.height+25)) / 2;

        //DRAW CONTAINER
        UI_LOW_LEVEL.drawRectLocal(container.pivotX, container.pivotY, container.width, container.height, 0, COLORS.slightlyDarkerBackgroundGray, COLORS.highlightOutline, 15, [{name: "drop-shadow", value: "0px 0px 5px black"}]);
        //if(invert > 0) {
            myData.isMouseInBox = UI_LOW_LEVEL.isMouseIn(container.pivotX, container.pivotY + (myData.height),container.pivotX + container.width, container.pivotY + (myData.height) + container.height);

        //SET EXCLUSIVE UI USE
        if(ACTIVE_TOOL == "opened_color_picker_" + active_ui.colorField.id) ACTIVE_TOOL = myData.pastTool;

        //DRAW BASE UI
        var colorWheelSpace = {
            x1: container.pivotX + 10,
            y1: container.pivotY + 5,
            x2: (container.pivotX + container.width) - 10,
            y2: container.pivotY + 290,
            centerX: 0,
            centerY: 0
        }
        colorWheelSpace.centerX = (colorWheelSpace.x2 + colorWheelSpace.x1) / 2;
        colorWheelSpace.centerY = (colorWheelSpace.y2 + colorWheelSpace.y1) / 2;
        UI_LOW_LEVEL.drawRectAbsolute(colorWheelSpace.x1, colorWheelSpace.y1, colorWheelSpace.x2, colorWheelSpace.y2, 0, brightenColor(COLORS.slightlyDarkerBackgroundGray, -10));

        var savedColorsSpace = {
            x1: container.pivotX + 10,
            y1: container.pivotY + 300,
            x2: (container.pivotX + container.width) - 10,
            y2: (container.pivotY + container.height) - 5
        }

        UI_LOW_LEVEL.drawRectAbsolute(savedColorsSpace.x1, savedColorsSpace.y1, savedColorsSpace.x2, savedColorsSpace.y2, 0, brightenColor(COLORS.slightlyDarkerBackgroundGray, -10));
        

        //DRAW COLOR WHEEL
        drawColorWheel();
        function drawColorWheel() {
            var colorWheel = {
                "radius": 110,
                "xOffset": 25,
                "currentHue": myData.chooserHueValue,
                "currentSat": myData.chooserSaturationValue,
                "currentVal": myData.chooserBrightnessValue
            }
            for(var a = 0; a <= 360; a++) {
                var inAngle = (a - 2)*DEG_TO_RAD;
                var outAngle = (a*DEG_TO_RAD);
    
                ctx.strokeStyle = `hsl(${a}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(colorWheelSpace.centerX-colorWheel.xOffset, colorWheelSpace.centerY, colorWheel.radius, inAngle, outAngle);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(colorWheelSpace.centerX-colorWheel.xOffset, colorWheelSpace.centerY, colorWheel.radius*0.9, inAngle, outAngle);
                ctx.stroke();
            }
    
            UI_LOW_LEVEL.drawRectAbsolute(colorWheelSpace.x2 - 40, colorWheelSpace.y1 + 30, colorWheelSpace.x2 - 20, colorWheelSpace.y1 + (colorWheelSpace.y2-colorWheelSpace.y1)/2, 0, myData.color);
            if(UI_TOOLS.rectAbsolute(colorWheelSpace.x2 - 40, colorWheelSpace.y1 + (colorWheelSpace.y2-colorWheelSpace.y1)/2 , colorWheelSpace.x2 - 20, colorWheelSpace.y2 - 30, myData.initColor, "white", "restoreColor")) {
                myData.overrideColor = myData.initColor;
            }

    
            //drawHueHandle
            var hueGizmo = {
                "x": (Math.cos(colorWheel.currentHue*DEG_TO_RAD)*colorWheel.radius*0.95) + colorWheelSpace.centerX - colorWheel.xOffset,
                "y": (Math.sin(colorWheel.currentHue*DEG_TO_RAD)*colorWheel.radius*0.95) + colorWheelSpace.centerY,
                "radius": 12
            }
    
            var isInHueRange = UI_LOW_LEVEL.isMouseInRadius(colorWheelSpace.centerX - colorWheel.xOffset, colorWheelSpace.centerY, colorWheel.radius+20, colorWheel.radius-20) && ACTIVE_TOOL == "";
            UI_LOW_LEVEL.drawCircle(hueGizmo.x, hueGizmo.y, hueGizmo.radius, "rgba(0,0,0,0.5)", isInHueRange ? "#3f3f3f" : "#1c1c1c", 4);
            //handleToolUsage
            if(((isInHueRange) || ACTIVE_TOOL == "colorWheelHue") && staticUISpace.mouse.isDown) {
                var mouseAngle = UI_LOW_LEVEL.getMouseAngle(colorWheelSpace.centerX - colorWheel.xOffset, colorWheelSpace.centerY);
                var snapColors = [1, 46, 88, 116, 146, 208, 272, 331];
                if(KEYS_DOWN.indexOf("CTRL") > -1) {
                    var closestIndex = -1;
                    var clos = Infinity;

                    for(var i = 0; i < snapColors.length; i++) {
                        if(Math.abs(mouseAngle - snapColors[i]) < clos) {
                            clos = Math.abs(mouseAngle - snapColors[i]);
                            closestIndex = i;
                        }
                    }

                    if(closestIndex > -1) {
                        mouseAngle = snapColors[closestIndex];
                    }
                }
                ACTIVE_TOOL = "colorWheelHue";
                colorWheel.currentHue = mouseAngle - 90;
            }
    
            
            //drawSat/Val Handle
            var satValBox = {
                boxSize: 60,
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            }
            satValBox.x1 = (colorWheelSpace.centerX - colorWheel.xOffset) - satValBox.boxSize;
            satValBox.y1 = colorWheelSpace.centerY - satValBox.boxSize;
            satValBox.x2 = satValBox.x1 + (satValBox.boxSize*2);
            satValBox.y2 = satValBox.y1 + (satValBox.boxSize*2);
    
            UI_LOW_LEVEL.drawGradient(satValBox.x1, satValBox.y1, (satValBox.x2 - satValBox.x1), (satValBox.y2 - satValBox.y1), "#ffffff", hslToHex(colorWheel.currentHue, 100, 50), "#000000", "#000000");
            
            var satValHandle = {
                x: (colorWheel.currentSat/100)*(satValBox.x2 - satValBox.x1) + satValBox.x1,
                y: (1-(colorWheel.currentVal/100))*(satValBox.y2 - satValBox.y1) + satValBox.y1,
                width: 5,
                height: 5
            }
    
            var isInSatVal = UI_LOW_LEVEL.isMouseIn(satValBox.x1, satValBox.y1, satValBox.x2, satValBox.y2, 0) && ACTIVE_TOOL == "";
            UI_LOW_LEVEL.drawCircle((satValHandle.x + satValHandle.x + satValHandle.width) / 2, (satValHandle.y + satValHandle.y + satValHandle.height) / 2, satValHandle.width, "rgba(0,0,0,0.5)",  isInSatVal ? "#3f3f3f" : "#1c1c1c", 4);
            //handleToolUsage
            if(((isInSatVal) || ACTIVE_TOOL == "colorWheelSatVal") && staticUISpace.mouse.isDown) {
                ACTIVE_TOOL = "colorWheelSatVal";
                colorWheel.currentSat = Math.max(0, Math.min(100, ((staticUISpace.mouse.pos.x - satValBox.x1) / (satValBox.x2 - satValBox.x1))*100));
                colorWheel.currentVal = Math.max(0, Math.min(100, (1-((staticUISpace.mouse.pos.y - satValBox.y1) / (satValBox.y2 - satValBox.y1)))*100));
            }

            //APPLY CHANGES
            myData.chooserHueValue = colorWheel.currentHue;
            myData.chooserSaturationValue = Math.max(0, Math.min(100, colorWheel.currentSat));
            myData.chooserBrightnessValue = Math.max(0, Math.min(100, colorWheel.currentVal));
        }
        
        //DRAW SAVED COLORS
        drawSavedColors();
        function drawSavedColors() {
            var savedColors = SAVED_COLORS[myData.savedColorsDatabase];
            if(savedColors == null) savedColors = [];

            for(var i = 0; i < savedColors.length + 1; i++) {
                var color = i < savedColors.length ? savedColors[i] : null;
                var spacing = {
                    x: 36,
                    y: 36,
                    rows: 8
                }
                var x = (i%spacing.rows*spacing.x) + savedColorsSpace.x1 + 5;
                var y = (Math.floor(i/spacing.rows) * spacing.y) + savedColorsSpace.y1 + 5;

                if(color) {
                    if(UI_TOOLS.rectAbsolute(x, y, x+spacing.x-2, y+spacing.y-3, color, "white", "savedButton" + i)) {
                        myData.overrideColor = color;
                    }
                    /*DETAILED_PANEL_TOOLS.registerRegion("savedColor" + i, {x1: x, y1: y, x2: x + spacing.x-2, y2: y + spacing.y-3}, [
                        {
                            "name": "Delete",
                            "callback": function(ii, savedDB) {
                                SAVED_COLORS[savedDB].splice(ii, 1);
                            },
                            "args": [i, myData.savedColorsDatabase]
                        }
                    ]);*/
                } else {
                    if(savedColors.length < 40) {
                        if(UI_TOOLS.buttonImage(IMAGES.ICONS.plus, x, y, spacing.x-2, spacing.y-3)) {
                            savedColors.push(myData.color);
                            staticUISpace.mouse.isClick = false;
                            staticUISpace.mouse.isDown = false;
                            staticUISpace.mouse.postClick = false;
                        }
                        
                    }
                    
                }
            }

            SAVED_COLORS[myData.savedColorsDatabase] = savedColors;
        }

        //CLEAR EXCLUSIVE USE
        active_ui.colorField.pastTool = ACTIVE_TOOL;
        ACTIVE_TOOL = "opened_color_picker_" + active_ui.colorField.id;
    }

    function renderImageField() {
        var myData = active_ui.imgField;
        var containerSpace = {
            x1: INFO_CANVAS.width*0.1,
            y1: INFO_CANVAS.height*0.06,
            x2: INFO_CANVAS.width*0.9,
            y2: INFO_CANVAS.height*0.9
        }

        myData.isMouseIn = UI_LOW_LEVEL.isMouseIn(containerSpace.x1, containerSpace.y1, containerSpace.x2, containerSpace.y2);

        if(ACTIVE_TOOL == "opened_image_picker_" + active_ui.imgField.id) ACTIVE_TOOL = myData.pastTool;
        UI_LOW_LEVEL.drawRectAbsolute(containerSpace.x1, containerSpace.y1, containerSpace.x2, containerSpace.y2, 0, COLORS.slightlyDarkerBackgroundGray, COLORS.highlightOutline, 14, [{"name": "drop-shadow", "value": "0px 0px 50px black"}]);


        UI_LOW_LEVEL.drawText("Image Bank", containerSpace.x1+20, containerSpace.y1 + 40, 40, COLORS.normalTextColor, "left", "center");
        UI_LOW_LEVEL.drawLine(containerSpace.x1+15, containerSpace.y1 + 50, containerSpace.x2 - 15, containerSpace.y1+50, COLORS.normalTextColor, 3);

        if(UI_TOOLS.buttonImage(IMAGES.ICONS.cross, containerSpace.x2-50, containerSpace.y1+5, 40, 40)) {
            myData = {}
        }

        var images = IMAGES.USER;
        var imageKeys = getJsonCategories(images);

        var spacing = {
            boxWidth: 205*.8,
            boxHeight: 220*.8,
            spaceX: 16,
            spaceY: 15
        }
        var rows = (Math.floor((containerSpace.x2 - containerSpace.x1) / (spacing.boxWidth + (spacing.spaceX*1.09))));
        var columns = (Math.round((containerSpace.y2 - containerSpace.y1) / (spacing.boxHeight + (spacing.spaceY*5.4))));
        
        var imageSpace = {
            x1: containerSpace.x1 + spacing.spaceX,
            y1: containerSpace.y1 + spacing.spaceY+37,
            x2: containerSpace.x2 - spacing.spaceX,
            y2: containerSpace.y2
        }
        
        var height = 0;
        var changeNeeded = 0;

        changeNeeded = myData.lastHeight - (imageSpace.y2 - imageSpace.y1-55);
        if(changeNeeded == null || isNaN(changeNeeded)) changeNeeded = 0;

        var extra = 0;
        if(imageKeys.length  < rows*columns) extra = 1;
        for(var i = 0; i < imageKeys.length + extra; i++) {
            var x1 = ((i % rows)*spacing.boxWidth) + imageSpace.x1 + (i % rows*spacing.spaceX);
            var x2 = x1 + spacing.boxWidth;

            if(myData.scrollY == null) myData.scrollY = 0;
            if(myData.lastHeight == null) myData.lastHeight = 0;
            var y1 = (Math.floor(i / rows) * spacing.boxHeight) + imageSpace.y1+15 + (Math.floor(i / rows)*spacing.spaceY);
            var y2 = y1 + spacing.boxHeight;

            if(i % rows == 0) height += (y2- y1)

            var shouldHighlight = myData.input == images[imageKeys[i]] && i < imageKeys.length;
            UI_LOW_LEVEL.drawRectAbsolute(x1, y1, x2, y2, 0, shouldHighlight ? "#feffc9" : brightenColor(COLORS.slightlyDarkerBackgroundGray, -10), "", "");

            if(i < imageKeys.length) {
                UI_LOW_LEVEL.drawImage(images[imageKeys[i]], x1+10, y1+10, (x2-x1)-20, (y2-y1)-20, 0);
                var imageName = imageKeys[i];
                imageName = imageName.replace("user_", "");
                if(imageName.length > 10) imageName = imageName.substring(0, 10) + "..."
                UI_LOW_LEVEL.drawText(imageName, (x2+x1)/2, y2-20, 20, COLORS.normalTextColor, "center", "center", [{"name": "drop-shadow", "value": "0px 0px 15px black"},{"name": "drop-shadow", "value": "0px 0px 15px black"},{"name": "drop-shadow", "value": "0px 0px 15px black"}]);
            
                if(UI_LOW_LEVEL.isMouseIn(x1, y1, x2, y2, 0) && staticUISpace.mouse.isClick) {
                    myData.input = images[imageKeys[i]];
                }
            } else {
                UI_LOW_LEVEL.drawText("Or... drag and", (x2+x1)/2, y2-45, 20, COLORS.normalTextColor, "center", "center");
                UI_LOW_LEVEL.drawText("drop images here!", (x2+x1)/2, y2-20, 20, COLORS.normalTextColor, "center", "center");
                UI_LOW_LEVEL.drawText("NEW", (x2+x1)/2, y1+35, 35, COLORS.normalTextColor, "center", "center");
                if(UI_TOOLS.buttonImage(IMAGES.ICONS.plus, (x2+x1)/2-32, (y2+y1)/2-45, 64, 64)) {
                    askForFile()
                }
            }
        }

        
        active_ui.imgField.pastTool = ACTIVE_TOOL;
        ACTIVE_TOOL = "opened_image_picker_" + active_ui.imgField.id;


        active_ui.imgField = myData;
    }

    return;
    for(var i = 0; i < DETAILED_PANELS.length; i++) {
        UI_LOW_LEVEL.drawRectAbsolute(DETAILED_PANELS[i].area.x1, DETAILED_PANELS[i].area.y1, DETAILED_PANELS[i].area.x2, DETAILED_PANELS[i].area.y2, 0, "rgba(255, 0, 255, 0.1)");
    }
}

var UI_LOW_LEVEL = {

    drawRectAbsolute: function(x1, y1, x2, y2, rotation, color, outlineColor = null, outlineWidth = 0, filters = []) {
        if(outlineColor == null) outlineColor = color;

        var w = x2-x1;
        var h = y2-y1;
        var offset = this.prepareRendering(x1, y1, w, h, rotation, filters);

        x1 = -offset.x;
        y1 = -offset.y;

        x2 = x1+w;
        y2 = y1+h;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth + "";
        ctx.rect(x1, y1,x2-x1, y2-y1);
        if(outlineWidth > 0 && outlineColor != "")
        ctx.stroke();

        if(color != "")
        ctx.fill();
        
        this.wrapUpRendering(rotation);
    },

    drawRectLocal: function(x1, y1, width, height, rotation, color, outlineColor = "", outlineWidth = 0, filters = []) {
        this.drawRectAbsolute(x1, y1, x1+width, y1+height, rotation, color, outlineColor, outlineWidth, filters);
    },

    drawCircle: function(x, y, radius, color, outlineColor = null, outlineThickness = 0) {
        if(outlineColor == null) outlineColor = color;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = outlineThickness;
        ctx.strokeStyle = outlineColor;
        
        if(outlineThickness > 0)
        ctx.stroke();
    },

    drawLine: function(x1, y1, x2, y2, color, thickness) {
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    },

    drawElipse: function(x, y, width, height, rotation, color, outlineColor = null, outlineThickness = 0, dontCenter = false, filters = []) {
        if(outlineColor == null) outlineColor = color;
        width = Math.abs(width);
        height = Math.abs(height);

        var offset = this.prepareRendering(x, y, width, height, rotation, filters);

        x = -offset.x;
        y = -offset.y;

        if(dontCenter) {
            x += width/2;
            y += height/2;
        }

        ctx.beginPath();
        ctx.ellipse(x, y, width/2, height/2, 0, 0, Math.PI*2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = outlineThickness;
        ctx.strokeStyle = outlineColor;
        if(outlineThickness > 0)
        ctx.stroke();

        this.wrapUpRendering(rotation);
    },

    drawTriangle: function(x, y, baseWidth, height, rotation, color, outlineColor = null, outlineThickness = 0, centerPoint = 0.5, filters = []) {
        if(outlineColor == null) outlineColor = color;

        var offset = this.prepareRendering(x, y, baseWidth, height, rotation, filters);

        x = -offset.x;
        y = -offset.y;

        ctx.fillStyle = color;
        ctx.lineWidth = outlineThickness;
        ctx.strokeStyle = outlineColor;
        ctx.beginPath();
        ctx.moveTo(x, y+height);
        ctx.lineTo(x+baseWidth, y+height);
        ctx.lineTo(x+(baseWidth*centerPoint), y);
        ctx.lineTo(x, y+height);
        ctx.lineTo(x+baseWidth, y+height);
        ctx.fill();
        if(outlineThickness > 0)
        ctx.stroke();

        this.wrapUpRendering(rotation);
    },

    drawArc: function(x, y, radius, startAngle, rotationAmount, fillColor = "", outlineColor = "", outlineThickness = 0, filters = []) {
        startAngle = mineToArc(startAngle);
        startAngle = (startAngle/180)*Math.PI;
        rotationAmount = (rotationAmount/180)*Math.PI;

        var temp = "";
        for(var i = 0; i < filters.length; i++) {
            if(filters[i].name != "")
            temp += filters[i].name + "(" + filters[i].value + ") ";
        }

        ctx.filter = temp;

        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, startAngle + rotationAmount);
        ctx.fillStyle = fillColor;
        ctx.lineWidth = outlineThickness;
        ctx.strokeStyle = outlineColor;
        
        if(fillColor != "")
        ctx.fill();
        
        if(outlineThickness > 0)
        ctx.stroke();

        return;
        //startAngle = 0;
        //endAngle = 125;
        var a = endAngle;

        endAngle = ((a > 0 ? 1 : -1) * 360) - endAngle;

        startAngle = (startAngle/-180)*Math.PI;
        endAngle = (endAngle/180)*Math.PI;

        if(startAngle > 180) startAngle-= 360;
        if(startAngle < -180) startAngle+= 360;

        if(endAngle > 180) endAngle-= 360;
        if(endAngle < -180) endAngle+= 360;

        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, a > 0);
        ctx.fillStyle = fillColor;
        ctx.lineWidth = outlineThickness;
        ctx.strokeStyle = outlineColor;
        
        if(fillColor != "")
        ctx.fill();
        
        if(outlineThickness > 0)
        ctx.stroke();
    },

    isMouseIn: function(x1, y1, x2, y2, buffer = 0) {
        //this.drawRectAbsolute(x1, y1, x2, y2, "red")
        if(staticUISpace.mouse.pos.x >= x1-buffer && staticUISpace.mouse.pos.x <= x2+buffer) {
            if(staticUISpace.mouse.pos.y >= y1-buffer && staticUISpace.mouse.pos.y <= y2+buffer) {
                return true;
            }
        }
        return false;
    },

    isMouseInRadius: function(originX, originY, maxRadius, minRadius = 0, minAngle = -1, maxAngle = -1, buffer = 0) {
        var angle = this.getMouseAngle(originX, originY);

        while(angle > 180) {
            angle -= 360;
        };

        while(minAngle > 180) {
            minAngle -= 360;
        };

        while(maxAngle > 180) {
            maxAngle -= 360;
        };

        /*while(angle < 180) {
            angle += 360;
        };*/
        //if(angle < 0) angle += 360;
        //while(angle < 0) angle += 360;

        var distance = Math.sqrt(((staticUISpace.mouse.pos.x - originX)*(staticUISpace.mouse.pos.x - originX)) + ((staticUISpace.mouse.pos.y - originY)*(staticUISpace.mouse.pos.y - originY)));

        if(distance >= minRadius-buffer && distance <= maxRadius+buffer) {
            var a = maxAngle-minAngle;
            if(minAngle == maxAngle && maxAngle == -1) {
                return true;
            }
            if(a > 0) {
                //console.log(`${Math.round(minAngle)}<${Math.round(angle)}<${Math.round(maxAngle)}`);
                if(angle > minAngle-(buffer/10) && angle-(buffer/10) < maxAngle) {
                    return true;
                }
            } else {
                //console.log(`${Math.round(minAngle)}>${Math.round(angle)}>${Math.round(maxAngle)}`);
                if(angle < minAngle-(buffer/10) && angle-(buffer/10) > maxAngle) {
                    return true;
                }
            }
            
        }
        return false;
    },

    getMouseAngle: function(originX, originY) {
        return this.getAngleBetweenPoints(originX, originY, staticUISpace.mouse.pos.x, staticUISpace.mouse.pos.y)
    },

    getAngleBetweenPoints: function(pointAX, pointAY, pointBX, pointBY) {
        var mousePos = {
            x: pointBX - pointAX,
            y: pointBY - pointAY
        }
        
        return atanToMine(Math.atan2(mousePos.x, mousePos.y)* (180/Math.PI));
    },

    rotateAroundPoint: function(originX, originY, pointX, pointY, rotation) {

        var localPoint = {
            x: pointX - originX,
            y: pointY - originY
        }

        var distance = Math.sqrt((localPoint.x * localPoint.x) + (localPoint.y * localPoint.y));
        var newPoint = {
            x: Math.cos(rotation*DEG_TO_RAD)*distance,
            y: Math.sin(rotation*DEG_TO_RAD)*distance
        }

        newPoint.x += originX;
        newPoint.y += originY;

        return newPoint;

        var localPosition = {
            x: pointX - originX,
            y: pointY - originY
        }

        var distance = Math.sqrt(((pointX - originX) * (pointX - originX)) + ((pointY - originY) * (pointY - originY)));

        var newAngleDestination = {
            x: Math.cos(rotation*DEG_TO_RAD),
            y: Math.sin(rotation*DEG_TO_RAD)
        }

        return {
            x: (newAngleDestination.x*distance)-localPosition.x,
            y: (newAngleDestination.y*distance)-localPosition.y
        }
    },

    drawText: function(text = "", x, y, size, color = "white", align = "left", vertical = "center", filters = []) {
        ctx.font = size + "px Courier Prime";
        var original = {
            "base": ctx.textBaseline,
            "align": ctx.align
        }

        
        var temp = "";
        for(var i = 0; i < filters.length; i++) {
            if(filters[i].name != "")
            temp += filters[i].name + "(" + filters[i].value + ") ";
        }

        ctx.filter = temp;
        ctx.fillStyle = color;
        ctx.textBaseline = vertical
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
        //ctx.fillText(text, x, y+1);
        ctx.textAlign = original.align;
        ctx.textBaseline = original.base;
        ctx.filter = "none"
        return UI_LOW_LEVEL.calculateTextSpace(text, x, y, size, color, align, vertical);
    },

    calculateTextSpace(text = "", x, y, size, color = "white", align = "left", vertical = "") {
        ctx.font = size + "px Courier Prime";
        var original = {
            "base": ctx.textBaseline,
            "align": ctx.align
        }
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = vertical;
        var data = ctx.measureText(text);
        ctx.textAlign = original.align;
        ctx.textBaseline = original.base;

        return {"x1": x - data.actualBoundingBoxLeft, "y1": y - data.actualBoundingBoxAscent, "x2": x+data.actualBoundingBoxRight, "y2": y + data.actualBoundingBoxDescent, "width": data.width, "height": data.actualBoundingBoxDescent - data.actualBoundingBoxAscent}
    },

    drawImage: function(id, x, y, width, height, rotation, filters = [{"name": "", "value": ""}]) {
        if(id == "" || id == null) id = IMAGES.IMAGES.MISSING;
        var image = document.getElementById(id);
        if(image == null) console.log(id)
        //ctx.save()
        var offset = {"x": width/2, "y": height/2};
        ctx.setTransform(1, 0, 0, 1, x+offset.x, y+offset.y);
        ctx.rotate(rotation * Math.PI / 180);

        var temp = "";
        for(var i = 0; i < filters.length; i++) {
            if(filters[i].name != "")
            temp += filters[i].name + "(" + filters[i].value + ") ";
        }

        ctx.filter = temp;

        ctx.drawImage(image, 0, 0, image.width, image.height, -offset.x, -offset.y, width, height);
        ctx.filter = "none";
        //ctx.restore();
        ctx.resetTransform();
        ctx.rotate(-rotation * Math.PI / 180)
    },

    prepareRendering: function(x, y, width, height, rotation, filters = []) {
        var offset = {"x": width/2, "y": height/2};
        ctx.setTransform(1, 0, 0, 1, x+offset.x, y+offset.y);
        ctx.rotate(rotation * Math.PI / 180);

        var temp = "";
        for(var i = 0; i < filters.length; i++) {
            if(filters[i].name != "")
            temp += filters[i].name + "(" + filters[i].value + ") ";
        }

        ctx.filter = temp;
        return offset;
    },

    wrapUpRendering: function(rotation) {
        ctx.filter = "none";
        ctx.resetTransform();
        ctx.rotate(-rotation * Math.PI / 180)
    },
    
    //https://jsbin.com/boyemuxowa/1/edit?html,js,output
    drawGradient: function(x, y, width, height, topLeftCorner= "", topRightCorner = "", bottomLeftCorner = "",  bottomRightCorner = "") {

        for(var xPos = x; xPos < width+x; xPos++) {
            var grad = ctx.createLinearGradient(xPos, y, xPos + 1, y+height);
            var precent = (xPos - x) / (width);
            grad.addColorStop(0, lerpColor(topLeftCorner, topRightCorner, precent));
            grad.addColorStop(1, lerpColor(bottomLeftCorner, bottomRightCorner, precent));

            ctx.fillStyle = grad;
            ctx.fillRect(xPos, y, 1, height);
        }

        
    },

    
}