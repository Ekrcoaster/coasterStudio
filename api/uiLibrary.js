class DrawShapeOption {
    fillColor;
    outlineColor;
    outlineWidth;

    constructor(fillColor = "", outlineColor = "", outlineWidth = 0) {
        this.fillColor = fillColor;
        this.outlineColor = outlineColor;
        this.outlineWidth = outlineWidth || 0;
    }

    getFillColor() {return this.fillColor || "lime";}
    shouldFill() {return this.fillColor != null;}
    
    getStrokeStyle() {return this.outlineColor;}
    getStrokeWidth() {return this.outlineWidth;}
    shouldStroke() {return this.outlineWidth > 0;}
}

class Filter {}

const UI_LIBRARY = {

    /** Renders a rect using x1, y1, x2, y2
     * @param {Number} rotation 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawRectCoords: function (x1, y1, x2, y2, rotation, shape, filters = []) {
        return this.drawPolygon([
            {x: x1, y: y1},
            {x: x2, y: y1},
            {x: x2, y: y2},
            {x: x1, y: y2}
        ], shape, filters);
    },

    /** Draws a polygon with the given points
     * @param {{x: Number, y: Number}[]} points 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawPolygon: function(points, shape, filters = []) {
        if(points.length < 3) {
            console.trace("ERROR: Attempting to draw polygon with less than 3 points!");
            return;
        }
        if(shape == null) shape = new DrawShapeOption();

        ctx.strokeStyle = shape.getStrokeStyle();
        ctx.lineWidth = shape.getStrokeWidth();
        ctx.fillStyle = shape.getFillColor();

        ctx.moveTo(points[0].x, points[0].y);
        ctx.beginPath();
        for(let i = 0; i < points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);

        // if we are drawing an outline, then go back to the first point and draw a line (so all sides have a line)
        if(shape.shouldStroke()) {
            ctx.lineTo(points[0].x, points[0].y);
            ctx.stroke();   
        }

        if(shape.shouldFill())
            ctx.fill();
    }
}

const UI_UTILITY = {
    isInside: function (x, y, x1, y1, x2, y2, padding = 0) {
        if(x2 < x1) throw "x2 is less than x1 when trying to calculate isInside";
        if(y2 < y1) throw "y2 is less than y1 when trying to calculate isInside";

        return x >= x1-padding && x <= x2 + padding &&
                y >= y1-padding && y <= y2 + padding;
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
    windowResize: function(id, type, axis, start, end, wholeSpaceMin, wholeSpaceMax, mouseOffset) {
        let width = 5;
        let length = 30;
        let avg = (start + end)/2;
        let x1 = axis-width;
        let x2 = axis+width;
        let y1 = avg - length;
        let y2 = avg + length;

        if(type == "x-axis") {
            x1 = avg - length;
            x2 = avg + length;
            y1 = axis-width;
            y2 = axis+width;
        }

        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 10, id);
        let down = mouse.isToolDown(id) && hover;

        let color = new DrawShapeOption("black");
        if(down) {
            color = new DrawShapeOption("white");
            mouse.setActiveTool(id, {ogWholeSpaceMin: wholeSpaceMin, ogWholeSpaceMax: wholeSpaceMax});
        } else if(mouse.isHoveringOver(x1, y1, x2, y2, 10) && (mouse.activeTool == id || mouseOffset.activeTool == null)) {
            color = new DrawShapeOption("gray");
        } else {
            mouse.removeActiveTool(id);
        }

        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, color);

        let newPercent = 0;
        if(down) {
            newPercent = ((type == "x-axis" ? mouse.y-mouseOffset : mouse.x-mouseOffset) - mouse.activeToolInitData.ogWholeSpaceMin) / (mouse.activeToolInitData.ogWholeSpaceMax-mouse.activeToolInitData.ogWholeSpaceMin);
            if(newPercent > 1) newPercent = 1;
            if(newPercent < 0) newPercent = 0;
        }

        return {
            hover: hover,
            isDown: down,
            newPercent: newPercent
        }
    }
}