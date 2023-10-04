class Color {
    r;
    g;
    b;
    a;

    isInvalid;

    constructor(stringColor = "") {
        if(typeof(stringColor) == "object") {
            this.r = stringColor.r || 255;
            this.g = stringColor.g || 255;
            this.b = stringColor.b || 255;
            this.a = stringColor.a || 1;
            this.isInvalid = false;

        } else {
            this.r = 255;
            this.g = 255;
            this.b = 255;
            this.a = 1;
            this.setColor(stringColor);
        }
    }

    setColor(stringColor) {
        this.isInvalid = true;
        
        if(stringColor.startsWith("#")) {
            this.r = parseInt(stringColor.slice(1, 3), 16);
            this.g = parseInt(stringColor.slice(3, 5), 16);
            this.b = parseInt(stringColor.slice(5, 7), 16);
            if(stringColor.length > 7)
                this.a = parseInt(stringColor.slice(7, 9), 16)/255;
            else
                this.a = 1;

            this.isInvalid = false;
        }
    }

    toHex() {
        return `#${number(this.r)}${number(this.g)}${number(this.b)}${number(this.a*255)}`

        function number(b) {
            let res = b.toString(16);
            if(res.length == 1)
                return "0"+res;
            return res;
        }
    }

    toRGBA() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    clone() {
        return new Color({r: this.r, g: this.g, b: this.b, a: this.a});
    }
    
    setR(r) {
        this.r = r;
        return this;
    }

    setG(g) {
        this.g = g;
        return this;
    }

    setB(b) {
        this.b = b;
        return this;
    }

    setAlpha(a) {
        this.a = a;
        return this;
    }
    
    getHSL() {
        let r = this.r / 255;
        let g = this.g / 255;
        let b = this.b / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {
            "h": h*360,
            "s": s,
            "l": l
        }
    }

    setHSL(h, s, l) {
        h /= 360;
        if (s === 0) {
            this.r = this.g = this.b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            this.r = Math.round(hue2rgb(p, q, h + 1 / 3)*255);
            this.g =  Math.round(hue2rgb(p, q, h)*255);
            this.b =  Math.round(hue2rgb(p, q, h - 1 / 3)*255);
        }
    }

    setHue(h) {
        let hsl = this.getHSL();
        this.setHSL(h, hsl.s, hsl.l);
    }
}

class DrawShapeOption {
    /**@type {Color} */
    fillColor;
    /**@type {Color} */
    outlineColor;
    outlineWidth = 0;

    roundedCorners = [];
    highQualityRendering = true;

    isMask;

    constructor(fillColor = "lime", outlineColor = "", outlineWidth = 0) {
        if(typeof(this.outlineColor) == "number") throw "outline color cannot be a number!"
        this.fillColor = new Color(fillColor);
        this.outlineColor = new Color(outlineColor);
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

    getFillColor() { return this.fillColor.toRGBA();}
    shouldFill() { return !this.fillColor.isInvalid; }
    setFillColor(fillColor) {this.fillColor = fillColor;}

    getStrokeStyle() { return this.outlineColor.toRGBA(); }
    getStrokeWidth() { return this.outlineWidth; }
    setStrokeWidth(width) {this.outlineWidth = width; }
    shouldStroke() { return this.outlineWidth > 0; }
    getRoundedCorners() {
        if(this.roundedCorners.length == 0)
            return [0];
        return this.roundedCorners;
    }

    setAlpha(alpha) {
        this.fillColor.setAlpha(alpha);
        this.outlineColor.setAlpha(alpha);
        return this;
    }
}

class DrawTextOption {
    /**@typedef {("default")} FontTypes */
    /**@typedef {("left"|"center"|"right")} HorizontalAlignTypes */
    /**@typedef {("top"|"center"|"bottom")} VerticalAlignTypes */
    size;
    /**@type {FontTypes} */
    font;

    /**@type {Color} */
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
    constructor(size = 25, font = "default", fillColor = "#ffffff", horizontalAlign = "left", verticalAlign = "center") {
        this.size = size;
        this.font = font;
        this.fillColor = new Color(fillColor);
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

    getColor() { return this.fillColor.toRGBA();}

    getFontForCTX() {
        return this.size + "px " + this.getFont();
    }

    setAlpha(alpha) {
        this.fillColor.setAlpha(alpha);
        return this;
    }
}

class DrawLineOption {
    /**@type {Color} */
    color;
    width;
    /**@type {CanvasLineCap} */
    cap;

    constructor(color = "black", width = 3) {
        this.color = new Color(color);
        this.width = width;
        this.cap = "round";
    }

    getStrokeStyle() {return this.color.toRGBA()}
    getStrokeWidth() {return this.width}
    getLineCap() {return this.cap;}
    /**@type {CanvasLineCap} */
    setLineCap(cap) {this.cap = cap;}
}

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

        UI_UTILITY.compileFilters(filters);
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
                if(isNaN(points[i].x) || isNaN(points[i].y))
                    console.trace("Point " + i + "is nan! X:" + isNaN(points[i].x));
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
    /** Draws a polygon with the given points
     * @param {{x: Number, y: Number}[]} points 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawEllipse: function (x, y, width, height, shape, filters = []) {
        if (shape == null) shape = new DrawShapeOption();

        UI_UTILITY.compileFilters(filters);
        ctx.strokeStyle = shape.getStrokeStyle();
        ctx.lineWidth = shape.getStrokeWidth();
        ctx.fillStyle = shape.getFillColor();

        let path = new Path2D();
        path.ellipse(x, y, width/2, height/2, 0, 0, Math.PI*2);

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
        ctx.fillStyle = draw.getColor();
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
    },
    /**@param {Filter[]} filters */
    compileFilters: function(filters = []) {
        let build = "";
        for(let i = 0; i < filters.length; i++) {
            build += filters[i].toString() + " ";
        }
        ctx.filter = build.trim();
    },
    getAngleBetweenPoints: function(pointAX, pointAY, pointBX, pointBY) {
        let mousePos = {
            x: pointBX - pointAX,
            y: pointBY - pointAY
        }
        
        return Math.atan2(mousePos.x, mousePos.y)* (180/Math.PI);
    }
}