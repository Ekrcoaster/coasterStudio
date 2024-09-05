class CUIText extends CUIElement {
    /**@type {DrawTextOption} */
    options;

    text;
    width;
    height;

    constructor(text, x, y, width, height) {
        super(x, y);
        this.text = text;
        this.width = width;
        this.height = height;
        this.bounds.addPoint(x, y);
        this.bounds.addPoint(x+width, y+height);
        this.interactable = false;
    }

    /**@param {DrawLineOption} options */
    setDrawOptions(options) {
        this.options = options;
        return this;
    }

    /**@param {CUICanvasSpace} info*/
    onDraw(info) {
        super.onDraw(info); 
        info.ui.drawText(this.text, this.getX(), this.getY(), this.getX() + this.width, this.getY() + this.height, this.options);
    }
}