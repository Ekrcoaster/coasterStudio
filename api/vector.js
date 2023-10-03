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
}