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
    constructor(size, font, fillColor, horizontalAlign, verticalAlign) {
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
                    UI_LIBRARY.drawRectCoords(x1, y2, x2, y2+5+color.outlineWidth, 0, new DrawShapeOption(color.fillColor));

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
     * @returns 
     */
    hierarchyGameObject: function(id, obj, meta, x1, y1, x2, isScene, isSelected) {
        let height = isScene ? 40 : 30;

        if(isScene)
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y1+height, 0, COLORS.hierarchyWindowSceneGameObjectBackground);
        else if(isSelected)
            UI_LIBRARY.drawRectCoords(x1, y1, x2, y1+height, 0, COLORS.hierarchyWindowSelect);

        let hover = mouse.isHoveringOver(x1, y1, x2, y1+height, 0, id);
        let click = mouse.isToolFirstUp(id) && hover;

        let change = meta.drawChildren;
        let offset = isScene ? 2 : height+2;
        if(obj.children.length > 0) {
            let old = change;
            change = this.dropdownHandle("handle"+id, x1, y1, x1+(height), y1+height, meta.drawChildren, COLORS.hierarchyWindowGameObjectNormalDropdownHandle, COLORS.hierarchyWindowGameObjectHoverDropdownHandle);
            if(old != change)
                click = false;
        }

        UI_LIBRARY.drawText(obj.name, x1+offset, y1, x2, y1+height, isScene ? COLORS.hierarchyWindowSceneGameObjectText : COLORS.hierarchyWindowGameObjectNormalText);
        return {
            height: height,
            newExpandValue: change,
            click: click
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
    }
}

const COLORS = {
    background: "#1c1c1c",

    windowResizeHandleDefault: new DrawShapeOption("#07070700"),
    windowResizeHandleHover: new DrawShapeOption("#3b3b3bfe"),
    windowResizeHandlePress: new DrawShapeOption("#b0b0b0fe"),

    windowBackground: ()=>{ return new DrawShapeOption("#555555", "#2c2c2c", 3).setRoundedCorners(10)},
    windowTabLabel: new DrawTextOption(25, "default", "#979797", "center", "center"),

    windowTabDefault: new DrawShapeOption("#363636", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabHover: new DrawShapeOption("#636363", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabActive: new DrawShapeOption("#555555", "#2c2c2c", 3).setRoundedCorners(10, 10, 0, 0),
    windowTabPotential: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),
    windowTabMoving: new DrawShapeOption("#6b758012").setRoundedCorners(10),
    windowTabInsert: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),

    hierarchyWindowGameObjectNormalText: new DrawTextOption(28, "default", "white", "left", "center"),
    hierarchyWindowGameObjectNormalDropdownHandle: new DrawShapeOption("gray"),
    hierarchyWindowGameObjectHoverDropdownHandle: new DrawShapeOption("white"),
    hierarchyWindowSceneGameObjectBackground: new DrawShapeOption("#33343489", "black", 2),
    hierarchyWindowSceneGameObjectText: new DrawTextOption(28, "default", "#ffffff7d", "left", "center"),
    hierarchyWindowSelect: new DrawShapeOption("#2986ea5e")
}