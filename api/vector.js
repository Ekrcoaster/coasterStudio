class Vector2 {
    x;
    y;

    constructor(x, y) {
        if(typeof(x) == "object") {
            y = x.y;
            x = x.x;
        }
        this.x = x || 0;
        this.y = y || 0;
    }

    /**@param {Vector2} vector*/
    addNew(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    /**@param {Vector2} vector*/
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**@param {Vector2} vector*/
    subtractNew(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    /**@param {Vector2} vector*/
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
}