class Filter { 
    toString() {}
}

class DropShadowFilter extends Filter {
    /**@type {Color} */
    color;
    blurRadius;
    xOffset;
    yOffset;

    /**
     * 
     * @param {Color} color 
     * @param {Number} blurRadius 
     * @param {Number} xOffset 
     * @param {Number} yOffset 
     */
    constructor(color, blurRadius, xOffset, yOffset) {
        this.color = color;
        this.blurRadius = blurRadius;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    toString() {
        return `drop-shadow(${this.color.toRGBA()} ${this.blurRadius}px ${this.xOffset}px ${this.yOffset}px)`;
    }
}