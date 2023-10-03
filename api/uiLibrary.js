class DrawShapeOption {
    fillColor = "";
    outlineColor = "";
    outlineWidth = 0;

    roundedCorners = [];
    highQualityRendering = true;

    isMask;

    constructor(fillColor = "", outlineColor = "", outlineWidth = 0) {
        this.fillColor = fillColor;
        this.outlineColor = outlineColor;
        this.outlineWidth = outlineWidth || 0;
        this.roundedCorners = [];
        this.highQualityRendering = true;
        this.isMask = false;
    }

    /**@param {...Number} radius*/
    setRoundedCorners(radius) {
        this.roundedCorners = [];
        for(let arg in arguments)
            this.roundedCorners.push(arguments[arg])
        
        return this;
    }

    makeLowQuality() {
        this.highQualityRendering = false;
        return this;
    }

    makeMask() {
        this.isMask = true;
        return this;
    }

    getFillColor() { return this.fillColor || "lime"; }
    shouldFill() { return this.fillColor != null; }

    getStrokeStyle() { return this.outlineColor; }
    getStrokeWidth() { return this.outlineWidth; }
    setStrokeWidth(width) {this.outlineWidth = width; }
    shouldStroke() { return this.outlineWidth > 0; }
    getRoundedCorners() {
        if(this.roundedCorners.length == 0)
            return [0];
        return this.roundedCorners;
    }
}

class DrawTextOption {
    /**@typedef {("default")} FontTypes */
    /**@typedef {("left"|"center"|"right")} HorizontalAlignTypes */
    /**@typedef {("top"|"center"|"bottom")} VerticalAlignTypes */
    size;
    /**@type {FontTypes} */
    font;

    fillColor;
    
    /**@type {HorizontalAlignTypes} */
    horizontalAlign;
    /**@type {VerticalAlignTypes} */
    verticalAlign;

    debugBoxes = false;

    /**
     * @param {FontTypes} font 
     * @param {HorizontalAlignTypes} horizontalAlign
     * @param {VerticalAlignTypes} verticalAlign
     * */
    constructor(size = 25, font = "default", fillColor = "white", horizontalAlign = "left", verticalAlign = "center") {
        this.size = size;
        this.font = font;
        this.fillColor = fillColor;
        this.horizontalAlign = horizontalAlign;
        this.verticalAlign = verticalAlign;
        this.debugBoxes = false;
    }

    drawDebug() {
        this.debugBoxes = true;
        return this;
    }

    getFont() {
        if(this.font == "default")
            return "Courier";
        return this.font;
    }

    getFontForCTX() {
        return this.size + "px " + this.getFont();
    }
}

class DrawLineOption {
    color;
    width;
    /**@type {CanvasLineCap} */
    cap;

    constructor(color = "black", width = 3) {
        this.color = color;
        this.width = width;
        this.cap = "round";
    }

    getStrokeStyle() {return this.color}
    getStrokeWidth() {return this.width}
    getLineCap() {return this.cap;}
    /**@type {CanvasLineCap} */
    setLineCap(cap) {this.cap = cap;}
}

class Filter { }

const UI_LIBRARY = {

    /** Renders a rect using x1, y1, x2, y2
     * @param {Number} rotation 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawRectCoords: function (x1, y1, x2, y2, rotation, shape, filters = []) {
        return this.drawPolygon([
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 }
        ], shape, filters);
    },

    /** Draws a polygon with the given points
     * @param {{x: Number, y: Number}[]} points 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawPolygon: function (points, shape, filters = []) {
        if (points.length < 3) {
            console.trace("ERROR: Attempting to draw polygon with less than 3 points!");
            return;
        }
        if (shape == null) shape = new DrawShapeOption();

        ctx.strokeStyle = shape.getStrokeStyle();
        ctx.lineWidth = shape.getStrokeWidth();
        ctx.fillStyle = shape.getFillColor();

        //ctx.moveTo(points[0].x, points[0].y);
        //ctx.beginPath();
        //for (let i = 0; i < points.length; i++)
        //    ctx.lineTo(points[i].x, points[i].y);

        let path = drawRoundPoly();

        // if we are drawing an outline, then go back to the first point and draw a line (so all sides have a line)
        if (shape.shouldStroke()) {
            //ctx.lineTo(points[0].x, points[0].y);
            ctx.stroke(path);
        }

        if (shape.shouldFill())
            ctx.fill(path);
        
        if(shape.isMask) {
            ctx.save();
            ctx.clip(path);
        }
            
        function drawRoundPoly() {
            let path = new Path2D();
            const lerp = (a, b, x) => {
                if(x > 1) x = 1;
                if(x < 0) x = 0;
                return a + (b - a) * x;
            }
            const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            const lerp2D = (p1, p2, t) => ({
                x: lerp(p1.x, p2.x, t),
                y: lerp(p1.y, p2.y, t)
            });

            path.moveTo(points[0].x, points[0].y);
            
            let allRadiuses = shape.getRoundedCorners();
            let skipRounding = allRadiuses.length == 1 && allRadiuses[0] == 0;

            let highQuality = shape.highQualityRendering;

            // go through and draw each point
            let last = points[points.length - 1];
            let lastIndex = points.length - 1;
            for (let i = 0; i < points.length; i++) {
                if(skipRounding) {
                    path.lineTo(points[i].x, points[i].y);
                }
                // find the radius
                let radius = allRadiuses[Math.min(allRadiuses.length - 1, i)];

                // calculate the last lerp line
                let lastLineLength = distance(last, points[i]);
                let lastLerp = lerp2D(points[i], last, radius / lastLineLength);

                // calculate the next lerp line
                let next = i == points.length - 1 ? points[0] : points[i+1];
                let nextLineLength = distance(next, points[i]);
                let nextLerp = lerp2D(points[i], next, radius / nextLineLength);

                // draw
                if(highQuality) {
                    path.lineTo(lastLerp.x, lastLerp.y);
                    path.bezierCurveTo(points[i].x, points[i].y, points[i].x, points[i].y, nextLerp.x, nextLerp.y);
                    path.lineTo(nextLerp.x, nextLerp.y);
                } else {
                    path.lineTo(lastLerp.x, lastLerp.y);
                    path.lineTo(nextLerp.x, nextLerp.y);
                }

                last = points[i];
                lastIndex = i;
            }
            path.closePath();
            return path;
        }

            function myRoundPolly(radius) {
                const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
            
                const lerp = (a, b, x) => a + (b - a) * x
            
                const lerp2D = (p1, p2, t) => ({
                    x: lerp(p1.x, p2.x, t),
                    y: lerp(p1.y, p2.y, t)
                })
            
                const numPoints = points.length
            
                let corners = []
                for (let i = 0; i < numPoints; i++) {
                    let lastPoint = points[i]
                    let thisPoint = points[(i + 1) % numPoints]
                    let nextPoint = points[(i + 2) % numPoints]
            
                    let lastEdgeLength = distance(lastPoint, thisPoint)
                    let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
                    let start = lerp2D(
                        thisPoint,
                        lastPoint,
                        lastOffsetDistance / lastEdgeLength
                    )
            
                    let nextEdgeLength = distance(nextPoint, thisPoint)
                    let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
                    let end = lerp2D(
                        thisPoint,
                        nextPoint,
                        nextOffsetDistance / nextEdgeLength
                    )
            
                    corners.push([start, thisPoint, end])
                }
            
                ctx.moveTo(corners[0][0].x, corners[0][0].y)
                for (let [start, ctrl, end] of corners) {
                    ctx.lineTo(start.x, start.y)
                    ctx.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y)
                }
            
                ctx.closePath()
            }
    },
    /**
     * 
     * @param {String} text 
     * @param {Number} x 
     * @param {Number} y 
     * @param {DrawTextOption} draw 
     */
    drawText: function(text, x1, y1, x2, y2, draw) {
        if(draw == null) throw "Draw cannot be null for text!";
        let space = UI_UTILITY.measureText(text, draw);

        // draw the space box
        if(draw.debugBoxes) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(x1, y1, x2-x1, y2-y1);
        }

        let xOffset = 0;
        let yOffset = 0;

        if(draw.horizontalAlign == "center")
            xOffset = Math.max(0, ((x2-x1) - space.width)/2);
        else if(draw.horizontalAlign == "right")
            xOffset = Math.max(0, ((x2-x1) - space.width));

        if(draw.verticalAlign == "center")
            yOffset = Math.max(0, ((y2-y1) - space.height)/2);
        else if(draw.verticalAlign == "bottom")
            yOffset = Math.max(0, ((y2-y1) - space.height));

        // draw the text box
        if(draw.debugBoxes) {
            ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            ctx.fillRect(xOffset+x1, y1+yOffset, x2-x1-xOffset*2, y2-y1-yOffset*2);
        }

        ctx.font = draw.getFontForCTX();
        ctx.fillStyle = draw.fillColor;
        ctx.fillText(text, x1+xOffset, y1+yOffset, x2-x1);

        return {
            width: space.width,
            height: space.height,
            xOffset: xOffset,
            yOffset: yOffset,
            getLocalXOffsetOfLetter: (index) => {
                return UI_UTILITY.measureText(text.substring(0, index), draw).width + xOffset;
            }
        }
    },
    /**
     * 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {DrawLineOption} draw 
     */
    drawLine: function(x1, y1, x2, y2, draw) {
        if(draw == null) draw = new DrawLineOption();

        ctx.strokeStyle = draw.getStrokeStyle();
        ctx.lineWidth = draw.getStrokeWidth();
        ctx.lineCap = draw.getLineCap();
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    },
    restore() {
        ctx.restore();
    }
}

const UI_UTILITY = {
    isInside: function (x, y, x1, y1, x2, y2, padding = 0) {
        if (x2 < x1) throw "x2 is less than x1 when trying to calculate isInside";
        if (y2 < y1) throw "y2 is less than y1 when trying to calculate isInside";

        return x >= x1 - padding && x <= x2 + padding &&
            y >= y1 - padding && y <= y2 + padding;
    },
    /**
    * @param {String} text 
    * @param {DrawTextOption} draw 
    */
    measureText: function(text, draw) {
        if(draw == null) throw "Draw cannot be null for text!";
        ctx.font = draw.getFontForCTX();
        let data = ctx.measureText(text);

        return {
            "width": data.width, 
            "height": data.fontBoundingBoxDescent - data.fontBoundingBoxAscent
        }
    }
}

let widgetCacheData = {}

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
        let newName = UI_WIDGET.editableText("edit"+id, obj.name, true, x1+offset, y1, x2, y1+height, textColor, ["NOT_EMPTY"], "doubleClick");

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
     * @param {("...regexhere..."|"NUMBERS_ONLY"|"ALPHABET_ONLY"|"NOT_EMPTY")[]} rules
     * @param {("standard"|"doubleClick")} clickMethod
     * */
    editableText: function(id, text, isEditable, x1, y1, x2, y2, draw, rules = [], clickMethod = "standard") {
        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 0, id);
        let meta = widgetCacheData[id] || {};

        let appliedChange = false;
        // even if we want a double click, if we are active we should still cancel from a single outside click
        if(meta.isActive) clickMethod = "standard";
        let click = (clickMethod == "standard" ? mouse.isToolFirstUp(id) : mouse.isToolDoubleClick(id)) && isEditable;

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

        let space = UI_LIBRARY.drawText(tempText, x1, y1, x2, y2, draw);

        if(click && hover) {
            meta.isActive = true;
            meta.cursor = Math.round(Math.max(0, Math.min(1, (mouse.x - x1) / ((x1+space.width)-x1))) * tempText.length);
            if(meta.tempText == null) meta.tempText = text;
            if(keyboard.isShiftDown) {
                if(meta.select == -1)
                    meta.select = meta.cursor;
            } else {
                meta.select = -1;
            }
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
                if(canSaveText(meta.tempText))
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

        function canSaveText(tempText = "") {
            for(let i = 0; i < rules.length; i++) {
                switch(rules[i]) {
                    default:
                    if(!tempText.match(rules[i]))
                        return false;
                    break;

                    case "NUMBERS_ONLY":
                        let numbers = "0123456789";
                        for(let c = 0; c < tempText.length; c++) {
                            let index = numbers.indexOf(tempText[c]);
                            if(index == -1) return false;
                        }
                    break;
                    
                    case "ALPHABET_ONLY":
                        let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";
                        for(let c = 0; c < tempText.length; c++) {
                            let index = alphabet.indexOf(tempText[c]);
                            if(index == -1) return false;
                        }
                    break;
                    case "NOT_EMPTY":
                        if(tempText.length == "") return false;
                    break;
                }
            }

            return true;
        }
    },

    /**
     * @param {("...regexhere..."|"NUMBERS_ONLY"|"ALPHABET_ONLY"|"NOT_EMPTY")[]} rules
     * */
    editorGUIString: function(id, label, text, isEditable, x1, y1, x2, y2, rules = []) {
        let labelOffset = this.editorGUILabelPre(label, x1, y1, x2, y2);
        
        UI_LIBRARY.drawRectCoords(x1+labelOffset, y1, x2, y2, 0, COLORS.stringEditorTextBackground);
        return this.editableText(id, text, isEditable, x1+3+labelOffset, y1+3, x2-3, y2-3, COLORS.stringEditorText, ["NOT_EMPTY", ...rules]);
    },
    editorGUILabelPre: function(label, x1, y1, x2, y2, divide = 2) {
        if(label) {
            let labelOffset = (x2-x1)/divide;
            UI_LIBRARY.drawText(label, x1, y1, x2+labelOffset, y2, COLORS.inspectorLabel);
            return labelOffset;
        }
        return 0;
    },
    editorGUINumber: function(id, label, number, isEditable, x1, y1, x2, y2, rules = [], divide = 2) {
        let labelOffset = this.editorGUILabelPre(label, x1, y1, x2, y2, divide);
        
        UI_LIBRARY.drawRectCoords(x1+labelOffset, y1, x2, y2, 0, COLORS.stringEditorTextBackground);
        let res = this.editableText(id, number + "", isEditable, x1+3+labelOffset, y1+3, x2-3, y2-3, COLORS.stringEditorText, ["NUMBERS_ONLY", ...rules]);
        res.text = parseFloat(res.text);
        if(isNaN(res.text))
            res.text = 0;
        return res;
    },
    /**@param {Vector2} vector */
    editorGUIVector2: function(id, label, vector, isEditable, x1, y1, x2, y2, rules = []) {
        let spacing = 20;
        let half = (x2-x1)/2-spacing;
        let topSpacing = 0;
        let leftSpacing = 0;
        if(label) {
            topSpacing = (y2-y1)/2
            this.editorGUILabelPre(label, x1, y1, x2, y1+topSpacing*0.5, 1);
            leftSpacing = 25;
        }
        vector.x = this.editorGUINumber(id + "x", "X", vector.x, isEditable, x1+leftSpacing, y1+topSpacing, x1+half, y2, rules, 4)?.text;
        vector.y = this.editorGUINumber(id + "y", "Y", vector.y, isEditable, x1+half+spacing+leftSpacing, y1+topSpacing, x2, y2, rules, 4)?.text;
        return vector;
    },

    toggle: function(id, isOn, x1, y1, x2, y2) {
        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 0, id);
        let click = mouse.isToolFirstUp(id);

        if(click && hover)
            isOn = !isOn;

        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.toggleBoxEmpty);
        if(isOn)
            UI_LIBRARY.drawRectCoords(x1+2, y1+2, x2-2, y2-2, 0, COLORS.toggleBoxFull);

        return {
            isOn: isOn
        };
    }
}

const COLORS = {
    background: "#1c1c1c",

    windowResizeHandleDefault: new DrawShapeOption("#07070700"),
    windowResizeHandleHover: new DrawShapeOption("#3b3b3bfe"),
    windowResizeHandlePress: new DrawShapeOption("#b0b0b0fe"),

    windowBackground: ()=>{ return new DrawShapeOption("#555555", "#2c2c2c", 3).setRoundedCorners(10)},
    windowDarkerBackground: () => { return new DrawShapeOption("#33343489", "#1a1a1a", 2).setRoundedCorners(10)},
    windowTabLabel: new DrawTextOption(25, "default", "#979797", "center", "center"),

    windowTabDefault: new DrawShapeOption("#363636", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabHover: new DrawShapeOption("#636363", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabActive: new DrawShapeOption("#555555", "#2c2c2c", 3).setRoundedCorners(10, 10, 0, 0),
    windowTabPotential: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),
    windowTabMoving: new DrawShapeOption("#6b758012").setRoundedCorners(10),
    windowTabInsert: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),

    hierarchyWindowGameObjectNormalText: new DrawTextOption(28, "default", "white", "left", "center"),
    hierarchyWindowGameObjectDisabledText: new DrawTextOption(28, "default", "#ffffff62", "left", "center"),
    hierarchyWindowSceneGameObjectBackground: new DrawShapeOption("#33343489", "black", 2),
    hierarchyWindowSceneGameObjectText: new DrawTextOption(28, "default", "#ffffff7d", "left", "center"),
    hierarchyWindowSelect: new DrawShapeOption("#2986ea5e"),

    inspectorComponentHeader: new DrawShapeOption("#33343489", "#24242489", 3),
    inspectorComponentHeaderText: new DrawTextOption(25, "default", "white", "left", "center"),
    inspectorComponentBox: new DrawShapeOption("#40404089", "#333333", 2).setRoundedCorners(10),
    inspectorLabel: new DrawTextOption(25, "default", "#ffffff7d", "left", "center"),

    textCursor: new DrawShapeOption("white"),
    textSelect: new DrawShapeOption("#2986ea5e"),

    stringEditorText: new DrawTextOption(25, "default", "#ffffff", "left", "center"),
    stringEditorTextBackground: new DrawShapeOption("#33343489", "black", 2).setRoundedCorners(5),

    normalDropdownHandle: new DrawShapeOption("gray"),
    hoverDropdownHandle: new DrawShapeOption("white"),

    toggleBoxEmpty: new DrawShapeOption("#212121", "#6b758012", 2).setRoundedCorners(10),
    toggleBoxFull: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),

    sceneBackgroundColor: new DrawShapeOption("#3a3a3a"),
    sceneGridColor: new DrawLineOption("#ffffff1b", 5),
    sceneGridCenterColor: new DrawShapeOption("#ffffff1b", 5)
}