class DrawShapeOption {
    fillColor = "";
    outlineColor = "";
    outlineWidth = 0;

    roundedCorners = [];
    highQualityRendering = true;

    constructor(fillColor = "", outlineColor = "", outlineWidth = 0) {
        this.fillColor = fillColor;
        this.outlineColor = outlineColor;
        this.outlineWidth = outlineWidth || 0;
        this.roundedCorners = [];
        this.highQualityRendering = true;
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

        drawRoundPoly(0);

        // if we are drawing an outline, then go back to the first point and draw a line (so all sides have a line)
        if (shape.shouldStroke()) {
            //ctx.lineTo(points[0].x, points[0].y);
            ctx.stroke();
        }

        if (shape.shouldFill())
            ctx.fill();

        function drawRoundPoly(t) {
            const lerp = (a, b, x) => {
                if(x > 1) x = 1;
                if(x < 0) x = 0;
                return a + (b - a) * x;
            }
            const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            const lerp2D = (p1, p2, t) => ({
                x: lerp(p1.x, p2.x, t),
                y: lerp(p1.y, p2.y, t)
            })

            ctx.moveTo(points[0].x, points[0].y);
            ctx.beginPath();

            let allRadiuses = shape.getRoundedCorners();
            let skipRounding = allRadiuses.length == 1 && allRadiuses[0] == 0;

            let highQuality = shape.highQualityRendering;

            // go through and draw each point
            let last = points[points.length - 1];
            let lastIndex = points.length - 1;
            for (let i = 0; i < points.length; i++) {
                if(skipRounding) {
                    ctx.lineTo(points.x, points.y);
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
                    ctx.lineTo(lastLerp.x, lastLerp.y);
                    ctx.bezierCurveTo(points[i].x, points[i].y, points[i].x, points[i].y, nextLerp.x, nextLerp.y);
                    ctx.lineTo(nextLerp.x, nextLerp.y);
                } else {
                    ctx.lineTo(lastLerp.x, lastLerp.y);
                    ctx.lineTo(nextLerp.x, nextLerp.y);
                }

                last = points[i];
                lastIndex = i;
            }
            ctx.closePath();
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
    }
}

const UI_UTILITY = {
    isInside: function (x, y, x1, y1, x2, y2, padding = 0) {
        if (x2 < x1) throw "x2 is less than x1 when trying to calculate isInside";
        if (y2 < y1) throw "y2 is less than y1 when trying to calculate isInside";

        return x >= x1 - padding && x <= x2 + padding &&
            y >= y1 - padding && y <= y2 + padding;
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
        let width = 5;
        let length = 30;
        let avg = (start + end) / 2;
        let x1 = axis - width;
        let x2 = axis + width;
        let y1 = avg - length;
        let y2 = avg + length;

        if (type == "x-axis") {
            x1 = avg - length;
            x2 = avg + length;
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

    windowTabLabel: function (id, name, x1, y1, y2, active) {
        let myLength = 100;
        let x2 = x1 + myLength;
        let color = COLORS.windowTabDefault;

        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 10, id);
        let down = mouse.isToolDown(id) && hover;

        if (hover)
            color = COLORS.windowTabHover;
        if (down || active)
            color = COLORS.windowTabActive;

        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2 + (active || down ? 20 : 0), 0, color);


        return {
            hover: hover,
            isDown: down,
            myLength: myLength
        }
    }
}

const COLORS = {
    background: "#131313",

    windowResizeHandleDefault: new DrawShapeOption("#07070731"),
    windowResizeHandleHover: new DrawShapeOption("#3b3b3bfe"),
    windowResizeHandlePress: new DrawShapeOption("#b0b0b0fe"),

    windowTabDefault: new DrawShapeOption("#363636", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabHover: new DrawShapeOption("#636363", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabActive: new DrawShapeOption("#9e9e9e", "#4c4c4c", 3).setRoundedCorners(10, 10, 0, 0),
}