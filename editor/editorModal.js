class EditorModal {

    /** 
     * @callback EditorModalOnRender
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @param {Object} data
     */

    /** 
     * @callback EditorModalOnClose
     * @param {("natural"|"force")} reason
     * @param {Object} data
     */

    id;
    x;
    y;
    width;
    height;
    /**@type {EditorModalOnRender} */
    onRender;
    /**@type {EditorModalOnClose} */
    onClose;
    data;

    /**
     * 
     * @param {String} id 
     * @param {Number} width 
     * @param {Number} height 
     * @param {EditorModalOnRender} onRender 
     * @param {EditorModalOnClose} onClose 
     * @param {Object} data 
     */
    constructor(id, width, height, data, onRender, onClose) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.onRender = onRender;
        this.onClose = onClose;
        this.data = data;
    }

    calculateDesiredPosition() {
        let x = mouse.x-this.width/2;
        if(x + this.width+20 > canvas.width)
            x -= (x + this.width+20) - canvas.width;

        let y = mouse.y;
        if(y + this.height+20 > canvas.height)
            y -= (y + this.height+20) - canvas.height;

        return {x: x, y: y}
    }

    render(x1, y1, x2, y2) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.windowModalBackground());
        this.onRender(x1, y1, x2, y2, this.data);
    }
}