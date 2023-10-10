let widgetCacheData = {}

class StringFieldOption {
    /**@typedef {("insert-regex-here"|"alphabet_only"|"numbers_only"|"any")} StringFieldFormatType */
    /**@typedef {("single"|"double")} StringFieldClickMethod */
    /**@typedef {("normal"|"selectAll")} StringFieldFirstClickMethod */

    /**@type {StringFieldFormatType} */
    format = "any";

    minLength = 0;
    maxLength = Infinity;

    /**@type {Number} what to multiply to round */
    roundDecimalPlaces = 10000;

    /**@type {StringFieldClickMethod} */
    clickMethod = "single";

    /**@type {StringFieldFirstClickMethod} */
    firstClickMethod = "normal";

    /**@param {StringFieldFormatType} format */
    constructor(format) {
        this.format = format || "any";
        this.minLength = 0;
        this.maxLength = Infinity;
        this.roundDecimalPlaces = 10000;
        this.clickMethod = "single";
        this.firstClickMethod = "selectAll";
    }

    doesStringMatch(text) {
        return this._matchFormat(text) && this._matchLength(text);
    }

    _matchFormat(text) {
        if(this.format == "any") return true;

        // check if this string is for numbers only
        if(this.format == "numbers_only") {
            let numbers = "0123456-789.";
            for(let c = 0; c < text.length; c++) {
                let index = numbers.indexOf(text[c]);
                if(index == -1) return false;
            }
            return true;
        }

        // check if this string is alphabet only
        if(this.format == "alphabet_only") {
            for(let c = 0; c < text.length; c++) {
                let index = alphabet.indexOf(text[c]);
                if(index == -1) return false;
            }
            return true;
        }

        // otherwise its regex
        return text.match(this.format);
    }

    _matchLength(text) {
        return text.length >= this.minLength && text.length <= this.maxLength;
    }

    parseAndRound(stringNumber) {
        return Math.round(parseFloat(stringNumber) * this.roundDecimalPlaces) / this.roundDecimalPlaces;
    }

    setTextLengthRestraints(min, max) {
        this.minLength = min;
        this.maxLength = max;
        return this;
    }

    /**@param {StringFieldFormatType} format */
    setFormat(format) {
        this.format = format;
        return this;
    }

    setRoundDecimalPlaces(places) {
        this.roundDecimalPlaces = 10 ** places;
        return this;
    }

    makeInt() {
        return this.setRoundDecimalPlaces(0);
    }

    /**@param {StringFieldClickMethod} type */
    setClickMethod(type) {
        this.clickMethod = type;
        return this;
    }

    /**
     * @param {StringFieldFirstClickMethod} type 
     */
    setFirstClickMethod(type) {
        this.firstClickMethod = type;
        return this;
    }
}

class DropdownItem {
    /**
     * @callback DropdownItemIconRender
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     */
    label;
    id;
    obj;
    /**@type {DropdownItemIconRender} */
    onIconRender;

    constructor(id, label, obj) {
        this.id = id;
        this.label = label;
        this.obj = obj;
    }

    /**@param {DropdownItemIconRender} onRender */
    setOnRender(onRender) {
        this.onIconRender = onRender;
        return this;
    }

    /** @param {ImageAsset} image  */
    setImageIcon(image) {
        this.onIconRender = (x1, y1, x2, y2) => {
            UI_LIBRARY.drawImage(image, x1, y1, x2, y2, 0, new DrawImageOption());
        }
        return this;
    }

    render(x1, y1, x2, y2, isHovering, isSelected) {
        if(isHovering)
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.dropdownHoverBackground);
        if(isSelected)
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.dropdownSelectedBackground);

        let offset = 5;
        if(this.onIconRender != null) {
            this.onIconRender(x1+offset+5, y1+6, x1+(y2-y1)-5, y2-6);
            offset += (y2-y1);
        }
        UI_LIBRARY.drawText(this.label, x1+offset, y1, x2, y2, COLORS.dropdownItemText);
    }
}

const UI_WIDGET = {
    /**
     * @param {string} id this is what will be assigned to the gizmo
     * @param {("x-axis"|"y-axis")} type 
     * @param {Number} axis the main axis, for example: y-axis would mean x
     * @param {Number} start the cross to the main axis, for example: y-axis would be y1
     * @param {Number} end the cross to the main axis, for example: y-axis would be y2
     * @param {Number} wholeSpaceMin the starting value of the current window
     * @param {Number} wholeSpaceMax the ending value of the current window
     */
    windowResize: function (id, type, axis, start, end, wholeSpaceMin, wholeSpaceMax, mouseOffset) {
        let width = 3;
        //let length = (end-start)/2;
        //let avg = (start + end) / 2;
        let x1 = axis - width;
        let x2 = axis + width;
        let y1 = start;
        let y2 = end;

        if (type == "x-axis") {
            x1 = start;
            x2 = end;
            y1 = axis - width;
            y2 = axis + width;
        }

        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 10, id);
        let down = mouse.isToolDown(id) && hover;

        let color = COLORS.windowResizeHandleDefault;
        if (down) {
            color = COLORS.windowResizeHandlePress;
            mouse.setActiveTool(id, { ogWholeSpaceMin: wholeSpaceMin, ogWholeSpaceMax: wholeSpaceMax });
        } else if (mouse.isHoveringOver(x1, y1, x2, y2, 10) && (mouse.activeTool == id || mouseOffset.activeTool == null)) {
            color = COLORS.windowResizeHandleHover;
        } else {
            mouse.removeActiveTool(id);
        }

        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, color);

        let newPercent = 0;
        if (down) {
            newPercent = ((type == "x-axis" ? mouse.y - mouseOffset : mouse.x - mouseOffset) - mouse.activeToolInitData.ogWholeSpaceMin) / (mouse.activeToolInitData.ogWholeSpaceMax - mouse.activeToolInitData.ogWholeSpaceMin);
            if (newPercent > 1) newPercent = 1;
            if (newPercent < 0) newPercent = 0;
        }

        return {
            hover: hover,
            isDown: down,
            newPercent: newPercent
        }
    },

    /**
     * 
     * @param {String} id 
     * @param {String} name 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} y2 
     * @param {("notActive"|"active"|"potential"|"moving")} state 
     * @returns 
     */
    windowTabLabel: function (id, name, x1, y1, y2, state) {
        let size = UI_UTILITY.measureText(this.name, COLORS.windowTabLabel);
        let myLength = Math.max(100, size.width);
        let x2 = x1 + myLength;
        let color = COLORS.windowTabDefault;

        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 10, id);
        let down = mouse.isToolFirstUp(id) && hover;

        if (hover)
            color = COLORS.windowTabHover;
        if (down || state == "active")
            color = COLORS.windowTabActive;
        if(state == "potential")
            color = COLORS.windowTabPotential;
        if(state == "moving")
            color = COLORS.windowTabMoving;

        return {
            hover: hover,
            setActive: down,
            myLength: myLength,
            downDistance: mouse.getDownDistance(),
            render: () => {
                UI_LIBRARY.drawRectCoords(x1, y1, x2, y2 + (state || down ? 5 : 10), 0, color);
        
                if(state)
                    UI_LIBRARY.drawRectCoords(x1, y2, x2, y2+10+color.outlineWidth, 0, new DrawShapeOption(color.fillColor));

                UI_LIBRARY.drawText(name, x1, y1, x2, y2, COLORS.windowTabLabel);
            }
        }
    },

    /**
     * 
     * @param {String} id 
     * @param {GameObject} obj 
     * @param {HierarchyWindowObjectMetadata} meta 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {{parent: GameObject, after: GameObject, before: GameObject}} hoveringGameObject
     * @returns 
     */
    hierarchyGameObject: function(id, obj, meta, x1, y1, x2, isScene, isSelected, hoveringGameObject) {
        let height = isScene ? 40 : 30;

        if(isScene)
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y1+height, 0, COLORS.hierarchyWindowSceneGameObjectBackground);
        else if(isSelected)
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y1+height, 0, COLORS.hierarchyWindowSelect);

        if(hoveringGameObject?.parent?.id == obj.id) {
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y1+height, 0, COLORS.hierarchyWindowSelect);
        }
        if(hoveringGameObject?.before?.id == obj.id) {
            UI_LIBRARY.drawRectCoords(x1, y1-3, x2, y1+3, 0, COLORS.hierarchyWindowSelect);
        }
        if(hoveringGameObject?.after?.id == obj.id) {
            UI_LIBRARY.drawRectCoords(x1, y1+height-3, x2, y1+height+3, 0, COLORS.hierarchyWindowSelect);
        }

        let hover = mouse.isHoveringOver(x1, y1, x2, y1+height, 0, id);
        let click = mouse.isToolFirstUp(id) && hover;

        let change = meta.drawChildren;
        let offset = isScene ? 2 : height+2;
        if(obj.children.length > 0) {
            let old = change;
            change = this.dropdownHandle("handle"+id, x1, y1, x1+(height), y1+height, meta.drawChildren, COLORS.normalDropdownHandle, COLORS.hoverDropdownHandle);
            if(old != change)
                click = false;
        }

        let textColor = isScene ? COLORS.hierarchyWindowSceneGameObjectText : COLORS.hierarchyWindowGameObjectNormalText;
        if(!obj.activeInHierarchy) textColor = COLORS.hierarchyWindowGameObjectDisabledText;
        let newName = UI_WIDGET.editableText("edit"+id, obj.name, true, x1+offset, y1, x2, y1+height, textColor, new StringFieldOption("any").setTextLengthRestraints(1, 64).setClickMethod("double").setFirstClickMethod("normal"));

        return {
            height: height,
            newExpandValue: change,
            click: click,
            hover: hover,
            newName: newName?.text || obj.name
        };
    },

    /**
     * @param {String} id 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {Boolean} isDown 
     * @param {DrawShapeOption} normalColor 
     * @param {DrawShapeOption} hoverColor 
     */
    dropdownHandle: function(id, x1, y1, x2, y2, isDown, normalColor, hoverColor) {
        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 0, id);
        let click = mouse.isToolFirstUp(id) && hover;

        let padding = 10;

        let points = [];
        if(isDown) {
            points = [{x: x1+padding, y: y1+padding},
                {x: x2-padding, y: y1+padding},
                {x: (x1+x2)/2, y: y2-padding}]
        } else {
            points = [{x: x1+padding, y: y1+padding},
                {x: x2-padding, y: (y1+y2)/2},
                {x: x1+padding, y: y2-padding}]
        }
        
        UI_LIBRARY.drawPolygon(points, hover ? hoverColor : normalColor);

        if(click)
            isDown = !isDown;
        return isDown;
    },

    inspectorComponentHeight: function(id, component, editor) {
        let height = 30;

        if(editor.isExpanded) {
            let calculatedHeight = editor.calculateExpandedHeight();
            height += calculatedHeight;
        }
        return height;
    },
    /**
     * @param {Component} component 
     * @param {EditorComponent} editor
     * */
    inspectorComponent: function(id, x1, y1, x2, component, editor) {
        let height = 30;
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y1+height, 0, COLORS.inspectorComponentHeader);
        UI_LIBRARY.drawText(component.name, x1, y1, x2, y1+height, COLORS.inspectorComponentHeaderText);

        let expanded = this.dropdownHandle(id + "dropdown", x2-height, y1, x2, y1+height, editor.isExpanded, COLORS.normalDropdownHandle, COLORS.hoverDropdownHandle);
        if(expanded != editor.isExpanded)
            editor.isExpanded = expanded;

        if(editor.isExpanded) {
            let calculatedHeight = editor.calculateExpandedHeight();
            UI_LIBRARY.drawRectCoords(x1, y1+height, x2, y1+height+calculatedHeight, 0, COLORS.inspectorComponentBox);
            editor.onRender(x1+14, y1+height+2, x2-2, y1+height+calculatedHeight, (x2-2)-(x1+25), calculatedHeight-4);
            height += calculatedHeight;
        }
        
        return {
            height: height
        }
    },

    /**
     * @param {DrawTextOption} draw
     * @param {StringFieldOption} option
     * @param {("standard"|"doubleClick")} clickMethod
     * */
    editableText: function(id, text, isEditable, x1, y1, x2, y2, draw, option) {
        if(option == null) option = new StringFieldOption();

        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 0, id);
        let meta = widgetCacheData[id] || {};

        let appliedChange = false;
        // even if we want a double click, if we are active we should still cancel from a single outside click
        if(meta.isActive) option.clickMethod = "single";
        let click = (option.clickMethod == "single" ? mouse.isToolFirstUp(id) : mouse.isToolDoubleClick(id)) && isEditable;

        let tempText = text;
        if(meta.tempText != null) tempText = meta.tempText;

        if(meta.isActive) {
            keyboard.downFirst.forEach(element => {
                let first = tempText.substring(0, meta.cursor);
                let last = tempText.substring(meta.cursor);

                // check for deletions
                if(element == "DELETE") {
                    // if theres a selection, delete it
                    if(meta.select > -1) {
                        deleteSelected();
                    } else {
                        // otherwise delete the cursor character
                        tempText = first.substring(0, first.length - 1) + last;
                        meta.cursor--;
                        if(meta.cursor < 0) meta.cursor = 0;
                    }

                // alt + A shortcut
                } else if(element == "A" && keyboard.isCtrlDown) {
                    meta.select = 0;
                    meta.cursor = tempText.length;
                
                // well, then type a character
                } else {
                    let character = keyboard.getAlphabeticNumbericSymbolic(element);
                    // before we type a character, if there is an existing selection, delete it
                    if(character != "" && meta.select > -1) {
                        deleteSelected();
                        first = tempText.substring(0, meta.cursor);
                        last = tempText.substring(meta.cursor);
                    }

                    if(character != "") {
                        tempText = first + character + last;
                        meta.cursor++;
                    }
                }

                // if the left arrow is being pressed, shift the cursor left
                if(element == "ARROWLEFT") {
                    // but if the user is holding shift, then mark the original point as the selection origin
                    if(keyboard.isShiftDown) {
                        if(meta.select == -1)
                            meta.select = meta.cursor;
                    } else {
                        meta.select = -1;
                    }
                    meta.cursor--;
                    if(meta.cursor < 0) meta.cursor = 0;
                }

                // if the right arrow is being pressed, shift the cursor right
                if(element == "ARROWRIGHT") {
                    // but if the user is holding shift, then mark the original point as the selection origin
                    if(keyboard.isShiftDown) {
                        if(meta.select == -1)
                            meta.select = meta.cursor;
                    } else {
                        meta.select = -1;
                    }
                    meta.cursor++;
                    if(meta.cursor >= tempText.length) meta.cursor = tempText.length;
                }

                function deleteSelected() {
                    tempText = tempText.substring(0, Math.min(meta.cursor, meta.select)) + tempText.substring(Math.max(meta.cursor, meta.select));
                    if(meta.cursor >= tempText.length) meta.cursor = tempText.length;

                    if(meta.select < meta.cursor)
                        meta.cursor -= meta.cursor - meta.select;
                    meta.select = -1;
                }
            });
        }
        meta.tempText = tempText;

        let space = UI_LIBRARY.drawText(tempText, x1, y1, x2, y2, new DrawTextOption(draw.size, draw.font, draw.fillColor.setAlpha(isEditable ? 1 : 0.5), draw.horizontalAlign, draw.verticalAlign));

        if(click && hover) {
            meta.isActive = true;
            if(keyboard.isShiftDown) {
                if(meta.select == -1)
                    meta.select = meta.cursor;
            } else {
                meta.select = -1;
            }
            if(option.firstClickMethod == "normal") {
                meta.cursor = Math.round(Math.max(0, Math.min(1, (mouse.x - x1) / ((x1+space.width)-x1))) * tempText.length);
            } else {
                meta.cursor = tempText.length;
                meta.select = 0;
            }
            if(meta.tempText == null) meta.tempText = text;
            
        }

        if(meta.isActive) {
            let cursorOffset = x1 + space.getLocalXOffsetOfLetter(meta.cursor);
            UI_LIBRARY.drawRectCoords(cursorOffset-1, y1, cursorOffset+1, y2, 0, COLORS.textCursor);
            if(meta.select > -1) {
                let smallest = Math.min(meta.cursor, meta.select);
                let largest = Math.max(meta.cursor, meta.select);
                UI_LIBRARY.drawRectCoords(x1 + space.getLocalXOffsetOfLetter(smallest), y1, x1 + space.getLocalXOffsetOfLetter(largest), y2, 0, COLORS.textSelect);
            }

            widgetCacheData[id] = meta;

            if((click && !mouse.isHoveringOver(x1, y1, x2, y2)) || keyboard.downFirst.has("ENTER")) {
                if(option.doesStringMatch(meta.tempText))
                    text = meta.tempText;
                delete widgetCacheData[id];
                appliedChange = true;
            }
        }

        return {
            hover: hover,
            click: click,
            meta: meta,
            text: text,
            height: y2-y1,
            applied: appliedChange
        }
    },

    /** @param {StringFieldOption} option */
    editorGUIString: function(id, label, text, isEditable, x1, y1, x2, y2, option, divide = 2) {
        let labelOffset = UI_WIDGET.editorGUILabelPre(label, x1, y1, x2, y2, divide);
        
        UI_LIBRARY.drawRectCoords(x1+labelOffset, y1, x2, y2, 0, COLORS.stringEditorTextBackground.setAlpha(isEditable ? 1 : 0.5));
        return UI_WIDGET.editableText(id, text, isEditable, x1+3+labelOffset, y1+3, x2-3, y2-3, COLORS.stringEditorText, option);
    },
    editorGUILabelPre: function(label, x1, y1, x2, y2, divide = 2) {
        if(label) {
            let labelOffset = (x2-x1)/divide;
            UI_LIBRARY.drawText(label, x1, y1, x2 -labelOffset, y2, COLORS.inspectorLabel);
            return labelOffset;
        }
        return 0;
    },

    /** @param {StringFieldOption} option */
    editorGUINumber: function(id, label, number, isEditable, x1, y1, x2, y2, option, divide = 2) {
        if(option == null) option = new StringFieldOption("numbers_only");
        let res = UI_WIDGET.editorGUIString(id, label, number+"", isEditable, x1, y1, x2, y2, option, divide);
        res.text = option.parseAndRound(res.text);
        if(isNaN(res.text))
            res.text = 0;
        return res;
    },
    /**@param {Vector2} vector @param {StringFieldOption} option  */
    editorGUIVector2: function(id, label, vector, isEditable, x1, y1, x2, y2, option) {
        let spacing = 20;
        let half = (x2-x1)/2-spacing;
        let leftSpacing = 0;
        if(label) {
            UI_WIDGET.editorGUILabelPre(label, x1, y1, x2, y2, 2);
            leftSpacing = half;
        }
        half = (x2-(x1+leftSpacing))/2-spacing;
        vector.x = UI_WIDGET.editorGUINumber(id + "x", "X", vector.x, isEditable, x1+leftSpacing, y1, x1+half+leftSpacing, y2, option, 4)?.text;
        vector.y = UI_WIDGET.editorGUINumber(id + "y", "Y", vector.y, isEditable, x1+half+spacing+leftSpacing, y1, x2, y2, option, 4)?.text;
        return vector;
    },

    /**
     * @param {String} id 
     * @param {String} label 
     * @param {Color} color 
     * @param {boolean} isEditable 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     */
    editorGUIColor: function(id, label, color, isEditable, x1, y1, x2, y2) {
        let labelOffset = UI_WIDGET.editorGUILabelPre(label, x1, y1, x2, y2, 2);

        let hover = mouse.isHoveringOver(x1+labelOffset, y1, x2, y2, 0, id);
        let down = mouse.isToolDown(id);

        let meta = widgetCacheData[id] || {};

        // if the color space is being pressed
        if(hover && down) {
            let mod = createWheelModal();
            meta = {
                modal: mod
            }
            widgetCacheData[id] = meta;
        }

        UI_LIBRARY.drawRectCoords(x1+labelOffset, y1, x2, y2, 0, new DrawShapeOption(color, COLORS.stringEditorTextBackground.outlineColor, COLORS.stringEditorTextBackground.outlineWidth).setRoundedCorners(10));

        return color;

        function createWheelModal() {
            let hsv = color.getHSV();
            return editor.createModal(new EditorModal(id+"modal", 350, 512, {
                initColor: new Color(color),
                color: color,
                hue: hsv.hue,
                sat: hsv.sat,
                val: hsv.val
            },(x1, y1, x2, y2, data) => {
                let isFree = handleSatBox({
                    centerX: (x2+x1)/2,
                    centerY: (y2+y1)/2+(x2-x1)/-4+15,
                    size: ((x2-x1)/2-15)/2,
                    movingInsideGizmo: false
                });

                handleWheel(isFree, {
                    x: (x2+x1)/2,
                    y: (y2+y1)/2,
                    yOffset: (x2-x1)/-4+15,
                    radius: (x2-x1)/2-15
                });

                handleColorPreview((y2+y1)/2 + (x2-x1)/4 +15+10);

                function handleWheel(isMouseFree, wheelSpace = {x: 0, y: 0, yOffset: 0, radius: 0}) {
                
                    UI_LIBRARY.drawImage(assets.getAsset("editor/colorWheel"), 
                        wheelSpace.x-wheelSpace.radius, wheelSpace.y-wheelSpace.radius+wheelSpace.yOffset,
                        wheelSpace.x+wheelSpace.radius, wheelSpace.y+wheelSpace.radius+wheelSpace.yOffset, 0)

                    let hoverInWheel = mouse.isHoveringOver(wheelSpace.x-wheelSpace.radius, wheelSpace.y-wheelSpace.radius+wheelSpace.yOffset, wheelSpace.x+wheelSpace.radius, wheelSpace.y+wheelSpace.radius+wheelSpace.yOffset);
                    if(hoverInWheel && mouse.down && isMouseFree) {
                        data.hue = 180-mouse.angleTo(wheelSpace.x, wheelSpace.y+wheelSpace.yOffset)+90;
                        data.color.setHSV(data.hue, data.sat, data.val);
                    }

                    let hueGizmo = {
                        "x": (Math.cos(data.hue  * DEGREE_TO_RADIANS)*wheelSpace.radius*0.87) + wheelSpace.x,
                        "y": (Math.sin(data.hue  * DEGREE_TO_RADIANS)*wheelSpace.radius*0.87) + wheelSpace.y+wheelSpace.yOffset,
                        "radius": 30
                    }

                    UI_LIBRARY.drawEllipse(hueGizmo.x, hueGizmo.y,
                        hueGizmo.radius, hueGizmo.radius, COLORS.colorPickerHueRotate);
                }

                function handleSatBox(space = {centerX: 0, centerY: 0, size: 0}) {
                    UI_LIBRARY.drawGradientSquare(space.centerX-space.size, space.centerY-space.size,
                        space.centerX + space.size, space.centerY+space.size, "#ffffff", new Color().setHSV(data.hue, 1, 1), "#000000", "#000000");
                    
                    let hoverInWheel = {
                        x: (mouse.x - space.centerX-space.size) / -(space.size*2),
                        y: (mouse.y - space.centerY-space.size) / -(space.size*2),
                    };

                    let isInside = (hoverInWheel.x >= 0 && hoverInWheel.x <= 1) && (hoverInWheel.y >= 0 && hoverInWheel.y <= 1) || data.movingInsideGizmo;

                    hoverInWheel.x = Math.min(1, Math.max(0, hoverInWheel.x));
                    hoverInWheel.y = Math.min(1, Math.max(0, hoverInWheel.y));

                    if(isInside && mouse.down) {
                        data.sat = (1-hoverInWheel.x);
                        data.val = (hoverInWheel.y);
                        data.movingInsideGizmo = true;
                        data.color.setHSV(data.hue, data.sat, data.val);
                    }
                    if(!mouse.down)
                        data.movingInsideGizmo = false;

                    let satLightGizmo = {
                        x: space.centerX-space.size + (space.size * 2 * (data.sat)),
                        y: space.centerY-space.size + (space.size * 2 * (1-data.val)),
                        radius: 10
                    }
                    UI_LIBRARY.drawRectCoords(satLightGizmo.x-satLightGizmo.radius, satLightGizmo.y-satLightGizmo.radius,
                        satLightGizmo.x+satLightGizmo.radius, satLightGizmo.y+satLightGizmo.radius, 0, COLORS.colorPickerHueRotate);

                    return !isInside;
                }

                function handleColorPreview(wheelHeight) {
                    UI_LIBRARY.drawRectCoords(
                        x1+10, 
                        wheelHeight, 
                        (x2+x1)/2,
                        wheelHeight + 40,
                        0, new DrawShapeOption(data.color).setRoundedCorners(20, 0, 0, 20));

                    UI_LIBRARY.drawRectCoords(
                        (x2+x1)/2,
                        wheelHeight, 
                        x2-10,
                        wheelHeight + 40,
                        0, new DrawShapeOption(data.initColor).setRoundedCorners(0, 20, 20, 0));

                    if(mouse.isHoveringOver((x2+x1)/2,
                        wheelHeight, 
                        x2-10,
                        wheelHeight + 40,) && mouse.clickDown) {
                            data.color.setR(data.initColor.r);
                            data.color.setG(data.initColor.g);
                            data.color.setB(data.initColor.b);
                            let hsv = data.color.getHSV();
                            data.hue = hsv.hue;
                            data.sat = hsv.sat;
                            data.val = hsv.val;
                        }

                }
                
            }, (reason, data) => {

            }));
        }
    },

    editorGUIToggle: function(id, label, isOn, isEditable, x1, y1, x2, y2) {
        let labelOffset = UI_WIDGET.editorGUILabelPre(label, x1, y1, x2, y2, 2);
        return UI_WIDGET.toggle(id, isOn, isEditable, x1+labelOffset, y1, x1+labelOffset+(y2-y1), y2);
    },

    toggle: function(id, isOn, isEditable, x1, y1, x2, y2) {
        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 0, id);
        let click = mouse.isToolFirstUp(id);

        if(click && hover && isEditable)
            isOn = !isOn;

        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.toggleBoxEmpty.setAlpha(isEditable ? 0.8 : 0.5));
        if(isOn)
            UI_LIBRARY.drawRectCoords(x1+2, y1+2, x2-2, y2-2, 0, COLORS.toggleBoxFull.setAlpha(isEditable ? 0.8 : 0.5));

        return {
            isOn: isOn
        };
    },

    /**
     * 
     * @param {String} text 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {DrawTextOption} optionalTextDraw 
     * @param {DrawShapeOption} optionalBackgroundDraw 
     * @param {ImageAsset} optionalIcon
     */
    button: function(text, x1, y1, x2, y2, optionalTextDraw, optionalBackgroundDraw, optionalIcon) {
        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 0, "button" + text);
        let click = mouse.isToolFirstUp("button" + text);

        if(optionalTextDraw == null)
            optionalTextDraw = new DrawTextOption(25, "default", "#ffffffa2", optionalIcon == null ? "center" : "left", "center");

        if(optionalBackgroundDraw == null)
            optionalBackgroundDraw = hover ? COLORS.buttonHoverBackground : COLORS.buttonDefaultBackground;

        let iconSpace = 0;

        if(optionalIcon != null)
            iconSpace = (y2-y1);
        
        if(optionalBackgroundDraw != null)
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, optionalBackgroundDraw);

        UI_LIBRARY.drawText(text, x1+iconSpace+5, y1, x2, y2, optionalTextDraw);

        if(optionalIcon != null) {
            UI_LIBRARY.drawImage(optionalIcon, x1+3, y1+3, x1+iconSpace-3, y2-3, 0, new DrawImageOption());
        }

        return click && hover;
    },
    
    editorGUIAssetComponent: function(id, label, current, type, isEditable, x1, y1, x2, y2) {
        let options = assets.getAssetsOfType("engine", type);
        let index = options.indexOf(current);
        options = options.map((x) => {
            return new DropdownItem(x.id, x.name, x).setOnRender((x1, y1 ,x2, y2) => {
                x.renderPreview(x1, y1, x2, y2);
            });
        });

        let labelOffset = UI_WIDGET.editorGUILabelPre(label, x1, y1, x2, y2, 2);
        return UI_WIDGET.dropdown(id, options, index, isEditable, x1+labelOffset, y1, x2, y2);
    },
    
    /**
     * 
     * @param {String} id 
     * @param {DropdownItem[]} options 
     * @param {Number} selectedIndex 
     * @param {boolean} isEditable 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     */
    dropdown: function(id, options, selectedIndex, isEditable, x1, y1, x2, y2) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.stringEditorTextBackground.setAlpha(isEditable ? 1 : 0.5));
        if(selectedIndex > -1 && options[selectedIndex] != null) {
            options[selectedIndex].render(x1, y1, x2, y2, false, false);
        }

        let hover = isEditable && mouse.isHoveringOver(x1, y1, x2, y2, 0);
        let click = mouse.isToolFirstUp(id);


        UI_LIBRARY.drawEllipse(x2-(y2-y1) / 2, (y1+y2)/2, (y2-y1) / 2, (y2-y1) / 2, hover ? COLORS.hoverDropdownHandle : COLORS.normalDropdownHandle);

        if(click && hover) {
            UI_WIDGET.popUpDropdownList(id, options, selectedIndex, x1, y1, x2, y2, (i) => {
            });
        }

        let applied = false;
        if(widgetCacheData[id] != null) {
            selectedIndex = widgetCacheData[id].selectedIndex;
            delete widgetCacheData[id];
            applied = true;
            NeedsReRendering();
        }
        
        return {
            selectedIndex: selectedIndex,
            applied: applied,
            selected: options[selectedIndex]
        }
    },
    /**
     * 
     * @param {String} id 
     * @param {DropdownItem[]} options 
     * @param {Number} selectedIndex 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     */
    popUpDropdownList: function(id, options, selectedIndex, x1, y1, x2, y2, onSelect = (index) => {}) {
        let itemHeight = 45;

        mouse.clickUp = false;
        editor.createModal(new EditorModal(id, (x2-x1), itemHeight * options.length, {
            selectedIndex: selectedIndex
        }, (x1, y1, x2, y2, data) => {
            for(let i = 0; i < options.length; i++) {
                let y= y1 + (itemHeight * i);
                let hoveringMe = mouse.isHoveringOver(x1, y, x2, y+itemHeight);
                let click = mouse.clickUp;
                options[i].render(x1, y, x2, y+itemHeight, hoveringMe, i == selectedIndex);
           

                if(click && hoveringMe) {
                    onSelect(i);
                    data.selectedIndex = i;
                    editor.closeActiveModal();
                }
            }
        }, (reason, data) => {
            widgetCacheData[id] = data;
        }).setDesiredXY(x1, y2, 0));
    },

    /**
     * renders the inside content as a scroll field
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {Vector2} scrollPos 
     * @param {Number} contentWidth 
     * @param {Number} contentHeight 
     * @param {Function(Number, Number)} onRender 
     * @returns 
     */
    scrollView: function(x1, y1, x2, y2, scrollPos, contentWidth, contentHeight, onRender = (xOffset, yOffset) => {}) {
        let horizontalOverflow = contentWidth > (x2-x1);
        let verticalOverflow = contentHeight > (y2-y1);

        let hovering = mouse.isHoveringOver(x1, y1, x2, y2);

        if(horizontalOverflow || verticalOverflow) {
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption("alpha").makeMask());

            if(hovering) {
                if(verticalOverflow)
                    scrollPos.y += mouse.getScrollVelocity() * -90;
                if(horizontalOverflow) 
                    scrollPos.x += mouse.getScrollVelocity() * -90;
                

                // handle overflow for y
                if(scrollPos.y > 0)
                    scrollPos.y = 0;

                let bottom = scrollPos.y + contentHeight;
                if(bottom < y2-y1)
                    scrollPos.y = (y2-y1) - contentHeight;

                // handle overflow for x
                // TODO
            }
        } else {
            scrollPos.x = 0;
            scrollPos.y = 0;
        }

        onRender(scrollPos.x, scrollPos.y);

        if(horizontalOverflow || verticalOverflow)
            UI_LIBRARY.restore();

        return scrollPos;
    }
}
