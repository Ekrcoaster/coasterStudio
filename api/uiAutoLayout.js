class UIAutoLayout {
    /**@type {UIAutoLayoutElement[]} */
    elements;

    enabled;
    indent;

    constructor() {
        this.elements = [];
        this.enabled = true;
        this.indent = 0;
    }

    /**
     * @callback UIAutoLayoutNumberField gets the number
     * @returns {Number}
     */
    /**
     * @param {UIAutoLayoutNumberField} number 
     * @param {StringFieldOption} option */
    numberField(label, number = () => {}, option, callback = (number) => {}) {
        this.elements.push(new UIAutoLayoutElement(this.indent, ["id", label, number, this.enabled, "x1", "y1", "x2", "y2", option], UI_WIDGET.editorGUINumber, (res) => {
            if(res.applied)
                callback(res.text);
        }));
    }

    /**
     * @callback UIAutoLayoutVector2Field gets the vector 2
     * @returns {Vector2}
     */
    /**
     * @param {UIAutoLayoutVector2Field} vector
     * @param {StringFieldOption} option */
    vector2Field(label, vector, option, callback = (vector) => {}) {
        this.elements.push(new UIAutoLayoutElement(this.indent, ["id", label, vector, this.enabled, "x1", "y1", "x2", "y2", option], UI_WIDGET.editorGUIVector2, (res) => {
            if(res != vector())
                callback(res);
        }));
    }

     /**
     * @callback UIAutoLayoutColorField gets the color
     * @returns {Color}
     */
    /**
     * @param {UIAutoLayoutColorField} color */
    colorField(label, color, callback = (color) => {}) {
        this.elements.push(new UIAutoLayoutElement(this.indent, ["id", label, color, this.enabled, "x1", "y1", "x2", "y2"], UI_WIDGET.editorGUIColor, (col) => {
            if(col != color())
                callback(col);
        }));
    }

    /**
     * @callback UIAutoLayoutBoolField gets the bool
     * @returns {boolean}
     */
    /**
     * @param {UIAutoLayoutBoolField} isOn */
    boolField(label, isOn, callback = (isOn) => {}) {
        this.elements.push(new UIAutoLayoutElement(this.indent, ["id", label, isOn, this.enabled, "x1", "y1", "x2", "y2"], UI_WIDGET.editorGUIToggle, (col) => {
            if(col.isOn != isOn())
                callback(col.isOn);
        }));
    }

    /**
     * @callback UIAutoLayoutAssetComponentField gets the asset component
     * @returns {boolean}
     */
    /**
     * @param {UIAutoLayoutAssetComponentField} assetObj */
    assetComponentField(label, assetObj, type, callback = (asset) => {}) {
        this.elements.push(new UIAutoLayoutElement(this.indent, ["id", label, assetObj, type, this.enabled, "x1", "y1", "x2", "y2"], UI_WIDGET.editorGUIAssetComponent, (res) => {
            if(res.applied)
                callback(res.selected?.obj);
        }));
    }

    /**
     * @callback UIAutoLayoutStringField gets the string
     * @returns {Number}
     */
    /**
     * @param {UIAutoLayoutStringField} number 
     * @param {StringFieldOption} option */
    stringField(label, text = () => {}, option, callback = (text) => {}) {
        this.elements.push(new UIAutoLayoutElement(this.indent, ["id", label, text, this.enabled, "x1", "y1", "x2", "y2", option], UI_WIDGET.editorGUIString, (res) => {
            if(res.applied)
                callback(res.text);
        }));
    }

    renderSpace(x1, y1, x2) {
        let y = y1;
        for(let i = 0; i < this.elements.length; i++) {
            let height = this.elements[i].render(x1, y, x2);
            y += height;
        }
    }

    calculateHeight() {
        let total = 0;
        for(let i = 0; i < this.elements.length; i++)
            total += this.elements[i].calculateSize();
        return total;
    }
}

class UIAutoLayoutElement {

    params;
    renderFunction;
    callback;
    id;

    padding;
    indent;

    constructor(indent, params, renderFunction, callback) {
        this.indent = indent;
        this.params = params;
        this.renderFunction = renderFunction;
        this.callback = callback;
        this.id = "uIAutoLayout" + UTILITY.generateCode(48);
        this.padding = 5;
    }

    calculateSize() {
        return 40+this.padding*2;
    }

    render(x1, y1, x2) {
        let height = this.calculateSize();
        x1 += this.calculateIndent();
        let newParams = [];
        for(let i = 0; i < this.params.length; i++) {
            if(this.params[i] == "x1") newParams.push(x1);
            else if(this.params[i] == "y1") newParams.push(y1+this.padding);
            else if(this.params[i] == "x2") newParams.push(x2);
            else if(this.params[i] == "y2") newParams.push(y1 + this.calculateSize()-this.padding);
            else if(this.params[i] == "id") newParams.push(this.id);

            else if(typeof(this.params[i]) == "function" && this.params[i].prototype == null) {
                newParams.push(this.params[i]());
            }

            else {
                newParams.push(this.params[i]);
            }
        }
        let res = this.renderFunction(...newParams);
        this.callback(res);
        return height;
    }

    calculateIndent() {
        return 20 * this.indent;
    }
}