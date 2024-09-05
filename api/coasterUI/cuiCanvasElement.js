/**
 * @callback CUICanvasDrawEvent
 * @param {CUICanvas} self
 * @param {CUICanvasSpace} info
 * */

class CUICanvas extends CUIElement {
    /**@type {CUICanvasDrawEvent} */
    onRenderCallback;
    /**
     * 
     * @param {CUICanvasDrawEvent} onRenderCallback 
     */
    constructor(x, y, width, height, onRenderCallback) {
        super(x, y, width, height);
        this.onRenderCallback = onRenderCallback;
    }

    /**@param {CUICanvasSpace} info*/
    onDraw(info) {
        super.onDraw(info);
        this.onRenderCallback(this, info);
    }
}