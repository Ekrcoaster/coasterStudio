/**@typedef {{x: Number, y: Number}} Point */

class CUIElement {
    id;

    x;
    y;

    /**@type {CUIElement} */
    parent;

    /**@type {CUIElement[]} */
    children = [];

    interactable = true;

    hoveringTime;
    hoveringMultiplier;
    hoveringMultiplierTime;

    /**@type {Bounds} */
    bounds;

    constructor(x, y) {
        this.id = Math.round(Math.random() * 9999999999999999).toString(16);
        this.x = x;
        this.y = y;
        this.hoveringTime = 0;
        this.hoveringMultiplier = 0;
        this.hoveringMultiplierTime = 0.08;
        this.bounds = new Bounds();
        this.interactable = true;
    }

    /**@param {CUICanvasSpace} info*/
    draw(info) {
        this.onDraw(info);
        this.children.forEach(child => {
            child.draw(info);
        });
    }

    /**@param {CUIElement} parent */
    setParent(parent) {
        if(this.parent != null) {
            this.parent._removeChild(this);
            this.parent = null;
        }

        if(parent != null) {
            parent._addChild(this);
            this.parent = parent;
        }
        return this;
    }

    /**@param {CUICanvasSpace} info*/ 
    onDraw(info) {
        if(!this.interactable) return;
        if(info.isRayTip(this)) {
            this.hoveringTime += info.getDeltaTime();
            this.hoveringMultiplier = Math.min(this.hoveringTime/this.hoveringMultiplierTime, 1);
        } else {
            this.hoveringTime = Math.min(this.hoveringTime, this.hoveringMultiplierTime);
            if(this.hoveringTime > info.getDeltaTime()) this.hoveringTime -= info.getDeltaTime();
            else this.hoveringTime = 0;
            this.hoveringMultiplier = info.utility.lerp(0, 1, Math.min(this.hoveringTime/this.hoveringMultiplierTime, 1));
        }
    }

    getX() {
        if(this.parent == null)
            return this.x;
        return this.parent._transformChildX(this.x);
    }

    getY() {
        if(this.parent == null)
            return this.y;
        return this.parent._transformChildY(this.y);
    }

    isInside(x, y) {
        return this.bounds.isInside(x-this.getX(), y-this.getY());
    }

    raycast(x, y, list) {
        if(this.interactable && this.isInside(x, y)) {
            list.push(this);
        }
        for(let i = 0; i < this.children.length; i++) {
            this.children[i].raycast(x, y, list);
        }
    }

    _transformChildX(x) {
        return this.getX() + x;
    }

    _transformChildY(y) {
        return this.getY() + y;
    }

    _removeChild(child) {
        let index = this.children.indexOf(child);
        if(index > -1)
            this.children.splice(index, 1);
    }

    _addChild(child) {
        let index = this.children.indexOf(child);
        if(index == -1)
            this.children.push(child);
    }
}
