class Transform extends Component {
    /**@type {Vector2} */
    localPosition;
    localAngle;
    localScale;

    _worldPosition;

    constructor() {
        super("Transform");
        this.localPosition = new Vector2();
        this.localAngle = 0;
        this.localScale = new Vector2(1, 1);
    }

    /**@param {Vector2} position */
    setLocalPosition(position) {
        this.localPosition = position;
        this._updateTransform();
    }

    setLocalAngle(angle) {
        this.localAngle = angle;
        this._updateTransform();
    }
    /**@param {Vector2} position */
    setLocalScale(scale) {
        this.localScale = scale;
        this._updateTransform();
    }

    /**@param {Vector2} position */
    localToWorldSpace(position) {
        let transformed = new Vector2(position.x, position.y);

        transformed.x += this.localPosition.x;
        transformed.y -= this.localPosition.y;

        if(this.gameObject.parent != null)
            transformed = this.gameObject.parent.transform.localToWorldSpace(transformed);

        // transform scale
        transformed.x *= this.localScale.x;
        transformed.y *= this.localScale.y;

        // transform rotation
        let rad = this.localAngle * DEGREE_TO_RADIANS;
        let ogX = transformed.x;
        transformed.x = (transformed.x * Math.cos(rad)) - (transformed.y * Math.sin(rad));
        transformed.y = (ogX           * Math.sin(rad)) + (transformed.y * Math.cos(rad));

        return transformed;
    }

    getWorldPosition() {
        return this._worldPosition;
    }

    _updateTransform() {
        this._worldPosition = this.localToWorldSpace(new Vector2());
        // then make sure all of the children have been updated
        for(let i = 0; i < this.gameObject.children.length; i++)
            this.gameObject.children[i].transform._updateTransform();
    }
}