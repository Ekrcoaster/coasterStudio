
class Color {
    r;
    g;
    b;
    a;

    multiplyColor = 1;
    addColor = 1;

    isInvalid;

    constructor(stringColor = "") {
        if(typeof(stringColor) == "object") {
            this.r = stringColor.r;
            this.g = stringColor.g;
            this.b = stringColor.b;
            this.a = stringColor.a;
            if(this.r == null) this.r = 255;
            if(this.g == null) this.g = 255;
            if(this.b == null) this.b = 255;
            if(this.a == null) this.a = 1;
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
        let col = this.processColor();
        return `#${number(col.r)}${number(col.g)}${number(col.b)}${number(col.a*255)}`

        function number(b) {
            let res = b.toString(16);
            if(res.length == 1)
                return "0"+res;
            return res;
        }
    }

    toRGBA() {
        let col = this.processColor();
        return `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a})`;
    }

    processColor() {
        return {
            r: this.r * this.multiplyColor + this.addColor,
            g: this.g * this.multiplyColor + this.addColor,
            b: this.b * this.multiplyColor + this.addColor,
            a: this.a
        }
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

    setMultiply(mul) {
        this.multiplyColor = mul;
        return this;
    }

    setAdd(num) {
        this.addColor = num;
        return this;
    }
    
    /**@returns {{hue: 0, sat: 0, val: 0}} */
    getHSV() {
        let col = this.processColor();
        let r = col.r / 255;
        let g = col.g / 255;
        let b = col.b / 255;

    
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
    
        let h, s, v;
    
        if (delta === 0) {
            h = 0;
        } else if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
    
        h = Math.round(h * 60);
        if (h < 0) {
            h += 360;
        }
    
        s = max === 0 ? 0 : delta / max;
        v = max;
    
        return { hue: h, sat:s, val:v };
    }
    
    setHSV(hue, sat, val) {
        let h = hue % 360;
        let c = val * sat;
        let x = c * (1-Math.abs(((h / 60) % 2) - 1));
        let m = val - c;
        
        let r, g, b;
        if(h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if(h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if(h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if(h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if(h < 300) {
            r = x;
            g = 0;
            b = c;
        } else {
            r = c;
            g = 0;
            b = x;
        }

        this.r = Math.round((r+m) * 255);
        this.g = Math.round((g+m) * 255);
        this.b = Math.round((b+m) * 255);
    
        return this;
    }
    
    /**
     * @param {Color} other 
     * @param {Number} time 
     * @returns 
     */
    lerp(other, time) {
        return staticUISpace.utility.lerpColor(this, other, time);
    }

    toJSON() {
        return {r: this.r, g: this.g, b: this.b, a: this.a, multiplyColor: this.multiplyColor}
    }
}

// this doenst work??
class Gradient {
    /**@type {("linear"|"radial")} */
    type;
    /**@type {Number} */
    angle;

    /**@type {{pos: 0, color: Color}[]} */
    colorStops = [];

    /**@param {("linear"|"radial")} type */
    constructor(type, angle = 0) {
        this.type = type;
        this.angle = angle;
    }

    /**@param {Number} pos @param {Color} color */
    addColorStop(pos, color) {
        this.colorStops.push({pos: pos, color: new Color(color)});
        return this;
    }

    createGradient(x1, y1, x2, y2, r) {
        if(this.type == "linear") {
            let grad = this.ctx.createLinearGradient(x1, y1, x2, y2);
            for(let i = 0; i < this.colorStops.length; i++)
                grad.addColorStop(this.colorStops[i].pos, this.colorStops[i].color.toRGBA());
            return grad;
        } else {
            let grad = this.ctx.createRadialGradient(x1, y1, r, x2, y2);
            for(let i = 0; i < this.colorStops.length; i++)
                grad.addColorStop(this.colorStops[i].pos, this.colorStops[i].color.toRGBA());
            return grad;
        }

        function transformAngle(x) {

        }
    }
}

class DrawShapeOption {
    /**@type {Color} */
    fillColor;
    /**@type {Color} */
    outlineColor;
    outlineWidth = 0;

    /**@type {Gradient} */
    fillGradient;
    /**@type {Gradient} */
    outlineGradient;

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
        this.fillGradient = null;
        this.outlineGradient = null;
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

    getFillColor(x1, y1, x2, y2, r) {
        if(this.fillGradient)
            return this.fillGradient.createGradient(x1, y1, x2, y2, r);
        return this.fillColor.toRGBA();
    }
    shouldFill() { return !this.fillColor.isInvalid && this.fillGradient == null; }
    setFillColor(fillColor) {this.fillColor = fillColor;}

    getStrokeStyle(x1, y1, x2, y2, r) { 
        if(this.outlineGradient)
            return this.outlineGradient.createGradient(x1, y1, x2, y2, r);
        return this.outlineColor.toRGBA(); 
    }
    getStrokeWidth() { return this.outlineWidth; }
    setStrokeWidth(width) {this.outlineWidth = width; return this;}
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

    /**@param {Gradient} gradient  */
    setFillGradient(gradient) {
        this.fillGradient = gradient;
        return this;
    }

    /**@param {Gradient} gradient  */
    setOutlineGradient(gradient) {
        this.outlineGradient = gradient;
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
    constructor(size = 22, font = "default", fillColor = "#ffffff", horizontalAlign = "left", verticalAlign = "center") {
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
            return "Nato Sans Moto";
        return this.font;
    }

    getColor() { return this.fillColor.toRGBA();}

    getFontForCtx() {
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

class DrawImageOption {
    /**@type {{x: 0, y: 0}[]} */
    uvs = []

    constructor() {
        this.uvs = [
            {x: 0, y: 0},
            {x: 1, y: 1}
        ]
    }

    setTopLeftUV(x, y) {
        this.uvs[0].x = x;
        this.uvs[0].y = y;
        return this;
    }

    setBottomRightUV(x, y) {
        this.uvs[1].x = x;
        this.uvs[1].y = y;
        return this;
    }
}

class RichTextToken {
    text;
    /**@type {Color} */
    color;
    size;
    font;
    afterMargin = 0;

    /**@param {Color} color @param {FontTypes} font */
    constructor(text, color, size, font) {
        this.text = text;
        this.color = color;
        this.size = size;
        this.font = font;
        this.afterMargin = 0;
    }
    
    setAfterMargin(margin) {
        this.afterMargin = margin;
        return this;
    }

    calculateSize(lastSize, lastFont) {
        if(this.size != null) lastSize = this.size;
        if(this.font != null) lastFont = this.font;

        let space = staticUISpace.utility.measureText(this.text, new DrawTextOption(lastSize, lastFont));
        
        return {
            width: space.width,
            height: space.actualHeight,
            lastSize: lastSize,
            lastFont: lastFont
        }
    }
}

class UILibrary {
    /**@type {CanvasRenderingContext2D} */
    ctx;
    canvas;

    /**@type {UIUtility} */
    utility;

    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.utility = new UIUtility(ctx, canvas);
    }
    /** Renders a rect using x1, y1, x2, y2
     * @param {Number} rotation 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawRectCoords (x1, y1, x2, y2, rotation, shape, filters = []) {
        return this.drawPolygon([
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 }
        ], shape, filters);
    }

    /** Draws a polygon with the given points
     * @param {{x: Number, y: Number}[]} points 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawPolygon (points, shape, filters = []) {
        if (points.length < 3) {
            console.trace("ERROR: Attempting to draw polygon with less than 3 points!");
            return;
        }
        if (shape == null) shape = new DrawShapeOption();

        this.utility.compileFilters(filters);
        let bounds = {x1: 0, y1: 0, x2: 0, y2: 0};
        if(shape.fillGradient != null || shape.outlineGradient != null) {
            bounds = this.utility.calculateBounds(points);
        }
        this.ctx.strokeStyle = shape.getStrokeStyle(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
        this.ctx.lineWidth = shape.getStrokeWidth();
        this.ctx.fillStyle = shape.getFillColor(bounds.x1, bounds.y1, bounds.x2, bounds.y2);

        //this.ctx.moveTo(points[0].x, points[0].y);
        //this.ctx.beginPath();
        //for (let i = 0; i < points.length; i++)
        //    this.ctx.lineTo(points[i].x, points[i].y);

        let path = drawRoundPoly();

        // if we are drawing an outline, then go back to the first point and draw a line (so all sides have a line)
        if (shape.shouldStroke()) {
            //this.ctx.lineTo(points[0].x, points[0].y);
            this.ctx.stroke(path);
        }

        if (shape.shouldFill())
            this.ctx.fill(path);
        
        if(shape.isMask) {
            this.ctx.save();
            this.ctx.clip(path);
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
                if((isNaN(points[i].x) || isNaN(points[i].y)))
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
            
                this.ctx.moveTo(corners[0][0].x, corners[0][0].y)
                for (let [start, ctrl, end] of corners) {
                    this.ctx.lineTo(start.x, start.y)
                    this.ctx.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y)
                }
            
                this.ctx.closePath()
            }
    }
    /** Draws a polygon with the given points
     * @param {{x: Number, y: Number}[]} points 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawEllipse (x, y, width, height, shape, filters = []) {
        if (shape == null) shape = new DrawShapeOption();

        this.utility.compileFilters(filters);
        this.ctx.strokeStyle = shape.getStrokeStyle();
        this.ctx.lineWidth = shape.getStrokeWidth();
        this.ctx.fillStyle = shape.getFillColor();

        let path = new Path2D();
        path.ellipse(x, y, width/2, height/2, 0, 0, Math.PI*2);

        // if we are drawing an outline, then go back to the first point and draw a line (so all sides have a line)
        if (shape.shouldStroke()) {
            //this.ctx.lineTo(points[0].x, points[0].y);
            this.ctx.stroke(path);
        }

        if (shape.shouldFill())
            this.ctx.fill(path);
        
        if(shape.isMask) {
            this.ctx.save();
            this.ctx.clip(path);
        }
    }
    /**
     * 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {Color} topLeft 
     * @param {Color} topRight 
     * @param {Color} bottomLeft 
     * @param {Color} bottomRight 
     */
    drawGradientSquare(x1, y1, x2, y2, topLeft, topRight, bottomLeft, bottomRight) {
        topLeft = new Color(topLeft);
        topRight = new Color(topRight);
        bottomLeft = new Color(bottomLeft);
        bottomRight = new Color(bottomRight);
        for(let y = y1; y < y2; y++) {
            let percent = (y-y1)/(y2-y1);
            let left = this.utility.lerpColor(topLeft, bottomLeft, percent).toRGBA();
            let right = this.utility.lerpColor(topRight, bottomRight, percent).toRGBA();
            this.ctx.fillStyle = this.ctx.createLinearGradient(x1, y1, x2, y1);
            this.ctx.fillStyle.addColorStop(0, left);
            this.ctx.fillStyle.addColorStop(1, right);
            this.ctx.beginPath();
            this.ctx.fillRect(x1, y, (x2-x1), 1);
            this.ctx.fill();
        }
    }
    /**
     * 
     * @param {ImageAsset} imageAsset 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {DrawImageOption} draw
     */
    drawImage(imageAsset, x1, y1, x2, y2, angle, draw) {
        if(draw == null) draw = new DrawImageOption();
        if(!imageAsset.isLoaded) { return; };
        if(imageAsset.image == null)
            throw "Image's image is null!";

        let firstCorner = {
            x: draw.uvs[0].x * imageAsset.width,
            y: draw.uvs[0].y * imageAsset.height
        }
        this.ctx.translate((x1+x2)/2, (y1+y2)/2);
        this.ctx.rotate(-angle * DEGREE_TO_RADIANS);
        this.ctx.translate((x1+x2)/-2, (y1+y2)/-2);
        this.ctx.drawImage(imageAsset.image, 
            firstCorner.x,
            firstCorner.y,
            draw.uvs[1].x * (imageAsset.width - firstCorner.x),
            draw.uvs[1].y * (imageAsset.height - firstCorner.y),
            x1, y1, (x2-x1), (y2-y1));
        this.ctx.resetTransform();
            
    }
    /**
     * 
     * @param {String} text 
     * @param {Number} x 
     * @param {Number} y 
     * @param {DrawTextOption} draw 
     */
    drawText(text, x1, y1, x2, y2, draw) {
        if(draw == null) throw "Draw cannot be null for text!";
        let space = this.utility.measureText(text, draw);

        // draw the space box
        if(draw.debugBoxes) {
            this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            this.ctx.fillRect(x1, y1, x2-x1, y2-y1);
        }

        let xOffset = 0;
        let yOffset = 0;

        if(draw.horizontalAlign == "center")
            xOffset = Math.max(0, ((x2-x1) - space.width)/2);
        else if(draw.horizontalAlign == "right")
            xOffset = Math.max(0, ((x2-x1) - space.width));

        if(draw.verticalAlign == "center")
            yOffset = Math.max(0, ((y2-y1) - space.coasterHeight) /2);
        else if(draw.verticalAlign == "bottom")
            yOffset = Math.max(0, ((y2-y1) - space.coasterHeight));

        // draw the text box
        if(draw.debugBoxes) {
            this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            this.ctx.fillRect(xOffset+x1, y1+yOffset, x2-x1-xOffset*2, y2-y1-yOffset*2);
        }

        this.ctx.font = draw.getFontForCtx();
        this.ctx.fillStyle = draw.getColor();
        this.ctx.fillText(text, x1+xOffset, y1+yOffset, x2-x1);

        const t = this;

        return {
            width: space.width,
            height: space.height,
            xOffset: xOffset,
            yOffset: yOffset,
            getXAtChar: (index) => {
                return t.utility.measureText(text.substring(0, index), draw).width + xOffset;
            },
            getCharAtX: (globalX) => {
                let local = globalX - (x1+xOffset);
                let width = space.width;
                return Math.round(Math.max(0, Math.min(1, local / width)) * text.length)
            }
        }
    }
    /**
     * 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {DrawLineOption} draw 
     */
    drawLine(x1, y1, x2, y2, draw) {
        if(draw == null) draw = new DrawLineOption();

        this.ctx.strokeStyle = draw.getStrokeStyle();
        this.ctx.lineWidth = draw.getStrokeWidth();
        this.ctx.lineCap = draw.getLineCap();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    restore() {
        this.ctx.restore();
    }

    /**
     * 
     * @param {RichTextToken[]} tokens 
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     * @param {DrawTextOption} draw 
     */
    drawRichText(tokens, x1, y1, x2, y2, draw) {
        let space = this.utility.measureRichText(tokens, draw);

        let xOffset = 0;
        let yOffset = 0;

        if(draw.horizontalAlign == "center")
            xOffset = Math.max(0, ((x2-x1) - space.width)/2);
        else if(draw.horizontalAlign == "right")
            xOffset = Math.max(0, ((x2-x1) - space.width));

        if(draw.verticalAlign == "center")
            yOffset = Math.max(0, ((y2-y1) - space.height) /2);
        else if(draw.verticalAlign == "bottom")
            yOffset = Math.max(0, ((y2-y1) - space.height));

        for(let i = 0; i < tokens.length; i++) {
            let sp = space.individual[i];
            let copy = new DrawTextOption(sp.lastSize, sp.lastFont, sp.lastColor, "center", "center");
            this.drawText(tokens[i].text, sp.x+x1+xOffset, sp.y+y1+yOffset, sp.x+sp.width+x1+xOffset, sp.y + sp.height+y1+yOffset, copy);
        }

        return {
            space: space,
            getTokenAtX(globalX) {
                // figure out the local X according to this
                let local = globalX - (x1+xOffset);

                // then, go token by token and find the one that the local X is inside of 
                for(let i = 0; i < tokens.length; i++) {
                    if(local >= space.individual[i].x && local <= space.individual[i].x + space.individual[i].width + tokens[i].afterMargin) {
                        return {
                            token: tokens[i],
                            charIndex: calculateCharIndex(i),
                            getXAtChar: (char) => {return getXAtChar(i, char);},
                            valid: true
                        }
                    }
                        
                }

                // if the position is less than
                if(local < 0) {
                    return {
                        token: tokens[0],
                        charIndex: calculateCharIndex(0),
                        getXAtChar: (char) => {return getXAtChar(0, char);},
                        valid: false
                    }
                }

                return {
                    token: tokens[tokens.length - 1],
                    charIndex: calculateCharIndex(tokens.length - 1),
                    getXAtChar: (char) => {return getXAtChar(tokens.length - 1, char);},
                    valid: false
                }

                function calculateCharIndex(i) {
                    // calculate the character and return
                    // THIS ONLY WOKRS IF MONOSPACE
                    let tokenLocal = local - space.individual[i].x;
                    let tokenWidth = space.individual[i].width;

                    return Math.round(Math.max(0, Math.min(1, tokenLocal / tokenWidth)) * tokens[i].text.length);
                }

                
            },
            getXAtToken(globalCharIndex) {
                for(let i = 0; i < tokens.length; i++) {
                    if(globalCharIndex - tokens[i].text.length <= 0)
                        return getXAtChar(i, globalCharIndex);
                    globalCharIndex -= tokens[i].text.length;
                }
                return getXAtChar(tokens.length - 1, globalCharIndex);
            }
        };
        
        function getXAtChar(i, char) {
            if(char == Infinity)
                return space.individual[i].x + space.individual[i].width + tokens[i].afterMargin;

            // THIS ONLY OWRKS FOR MONOSPACE
            let temp = space.individual[i].x + Math.min(1, tokens[i].text.length == 0 ? 0 : (char / tokens[i].text.length)) * space.individual[i].width;
            return temp;
        }
    }
}

class UIUtility {
    /**@type {CanvasRenderingContext2D} */
    ctx;
    canvas;

    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    isInside (x, y, x1, y1, x2, y2, padding = 0) {
        if (x2 < x1) throw "x2 is less than x1 when trying to calculate isInside";
        if (y2 < y1) throw "y2 is less than y1 when trying to calculate isInside";

        return x >= x1 - padding && x <= x2 + padding &&
            y >= y1 - padding && y <= y2 + padding;
    }
    /**
    * @param {String} text 
    * @param {DrawTextOption} draw 
    */
    measureText(text, draw) {
        if(draw == null) throw "Draw cannot be null for text!";
        this.ctx.font = draw.getFontForCtx();
        let data = this.ctx.measureText(text);

        return {
            "width": data.width, 
            "fontHeight": data.fontBoundingBoxAscent + data.fontBoundingBoxDescent,
            "actualHeight": data.actualBoundingBoxAscent + data.actualBoundingBoxDescent,
            "coasterHeight": data.fontBoundingBoxDescent - data.fontBoundingBoxAscent
        }
    }
    /**@param {Filter[]} filters */
    compileFilters(filters = []) {
        let build = "";
        for(let i = 0; i < filters.length; i++) {
            build += filters[i].toString() + " ";
        }
        this.ctx.filter = build.trim();
    }
    getAngleBetweenPoints(pointAX, pointAY, pointBX, pointBY) {
        let mousePos = {
            x: pointBX - pointAX,
            y: pointBY - pointAY
        }
        
        return Math.atan2(mousePos.x, mousePos.y)* (180/Math.PI);
    }
    calculateBounds(points) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for(let i = 0; i < points.length; i++) {
            if(points[i].x < minX)
                minX = points[i].x;

            if(points[i].y < minY)
                minY = points[i].y;

            if(points[i].x > maxX)
                maxX = points[i].x;

            if(points[i].y > maxY)
                maxY = points[i].y;
        }

        return {
            x1: minX,
            y1: minY,
            x2: maxX,
            y2: maxY
        }
    }
    lerp(a, b, amt) {
        return a + (b-a)*amt;
    }
    /**
     * lersp between 2 colors
     * @param {Color} a 
     * @param {Color} b 
     * @param {Number} amount 
     */
    lerpColor(a, b, amount) { 
        const t = this;
        return new Color({
            r: t.lerp(a.r, b.r, amount),
            g: t.lerp(a.g, b.g, amount),
            b: t.lerp(a.b, b.b, amount),
            a: t.lerp(a.a, b.a, amount)
        });
    }
    distance(x1, y1, x2, y2) {
        return Math.sqrt(((y2 - y1) ** 2) + ((x2 - x1) ** 2));
    }
    /**@param {RichTextToken[]} tokens @param {DrawTextOption} draw  */
    measureRichText(tokens, draw) {

        let width = 0;
        let height = 0;

        let lastColor = draw.fillColor;
        let lastSize = draw.size;
        let lastFont = draw.font;

        let individual = [];

        for(let i = 0; i < tokens.length; i++) {
            let oldW = width;
            let oldH = height;
            let size = tokens[i].calculateSize(lastSize, lastFont);
            width += size.width;
            if(size.height > height)
                height = size.height;

            // update the last properties
            if(tokens[i].color != null) lastColor = tokens[i].color;    // color is updated here cause it has nothing to do with measuring text
            lastSize = size.lastSize;
            lastFont = size.lastFont;

            size = {
                ...size,
                lastColor: lastColor,
                x: oldW,
                y: 0
            }

            individual.push(size);
            width += tokens[i].afterMargin;
        }

        return {
            width: width,
            height: height,
            individual: individual
        }
    }

    /**
     * This converts the rich text type <?   > to tokens. Each brick (<? >) is a token
     * (⌱ can also be replaced with ?, this is so that a user can't accidentally create a rich text if not wanted)
     * the <? > format is as follows, each type seperated by space:
     *  - c=#ffffff       set the color
     *  - s=25              set the size
     *  - f=default         set the font
     *  - m=10              set the after margin
     * 
     * For example:
     *  - <? c=#ff00ff s=25 >
     *  - <?f=default>
     *  - <?c=#ff00ff>
     *  - <? s=10 >
     * @param {String} text
     * @param {Boolean} onlyAcceptUnicode if true, <⌱ > is only valid
     */
    richTextPlainToTokens(text, onlyAcceptUnicode = false) {
        let tempTokens = [];

        let tempInside = "";
        let tokenToFill = new RichTextToken("");
        tempTokens.push(tokenToFill)
        for(let i = 0; i < text.length; i++) {
            // check if the string matches the <⌱ or <?
            if(text[i] == "<" && ((text[i+1] == "?" && !onlyAcceptUnicode) || text[i+1] == "⌱")) {
                tempInside = "<";
            } else if(tempInside.length > 0) {
                if(text[i] == ">") {
                    tokenToFill = interpretCollected(tempInside);
                    tempTokens.push(tokenToFill);
                    tempInside = "";
                } else {
                    tempInside += text[i];
                }
            } else {
                if(tokenToFill)
                    tokenToFill.text += text[i];
            }
        }

        return tempTokens;
        
        function interpretCollected(inside = "") {
            let strip = inside.substring(2);
            if(strip.length <= 2) return null;
            let split = strip.split(" ");
            if(split.length == 0) return null;

            let token = new RichTextToken("");

            // split up the inside and parse
            for(let i = 0; i < split.length; i++) {
                if(split[i].length == 0) continue;

                let key = split[i][0];
                let val = split[i].substring(2);

                switch(key) {
                    case "c":
                        token.color = val;
                    break;
                    case "s":
                        token.size = parseInt(val);
                    break;
                    case "f":
                        token.font = val;
                    break;
                    case "m":
                        token.afterMargin = parseInt(val);
                    break;
                }
            }

            return token;
        }
    }
}