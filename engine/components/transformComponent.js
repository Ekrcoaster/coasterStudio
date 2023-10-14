class Transform extends Component {
    /**@type {Vector2} */
    localPosition;
    localAngle;
    /**@type {Vector2} */
    localScale;
    /**@type {Vector2} */
    localSheer;

    _worldPosition;

    constructor(gameObject) {
        super("Transform", gameObject);
        this.localPosition = new Vector2();
        this.localAngle = 0;
        this.localScale = new Vector2(1, 1);
        this.localSheer = new Vector2(0, 0);
        this._updateTransform();
    }

    onUpdate() {
        this.localAngle += 90 * engine.deltaTime;
    }

    /**@param {Vector2} position */
    setLocalPosition(position) {
        if(position == this.localPosition) return;
        this.localPosition = position;
        this._updateTransform();
    }

    setLocalAngle(angle) {
        if(angle == this.localAngle) return;
        this.localAngle = angle;
        this._updateTransform();
    }
    /**@param {Vector2} scale */
    setLocalScale(scale) {
        if(scale == this.localScale) return;
        this.localScale = scale;
        this._updateTransform();
    }
    /**@param {Vector2} sheer */
    setLocalSheer(sheer) {
        if(sheer == this.localSheer) return;
        this.localSheer = sheer;
        this._updateTransform();
    }

    /**@param {Vector2} position */
    localToWorldSpace(position) {
        let res = this.getLocalToWorldMatrix().multiplyNew(new Matrix([[position.x], [position.y], [1]]));
        return new Vector2(res.getElement(0, 0), res.getElement(1, 0));
    }


    /**@returns {Matrix} */
    getLocalToWorldMatrix() {
        let myself = new Matrix().setAsTransformMatrix(this.localPosition.x, this.localPosition.y, this.localAngle, this.localScale.x, this.localScale.y, this.localSheer.x, this.localSheer.y);
        if(this.gameObject.parent != null)
            myself = this.gameObject.parent.transform.getLocalToWorldMatrix().multiply(myself);
    
        return myself;
    }

    getWorldToLocalMatrix() {
        let myself = new Matrix().setAsInverseTransformMatrix(this.localPosition.x, this.localPosition.y, this.localAngle, this.localScale.x, this.localScale.y, this.localSheer.x, this.localSheer.y);
        if(this.gameObject.parent != null)
            myself = this.gameObject.parent.transform.getWorldToLocalMatrix().multiply(myself).inverse();
    
        return myself;
    }

    getWorldPosition() {
        return this.localToWorldSpace(new Vector2());
    }

    _updateTransform() {
        return;
        // then make sure all of the children have been updated
        for(let i = 0; i < this.gameObject.children.length; i++)
            this.gameObject.children[i].transform._updateTransform();
    }

    worldToLocalSpace(position) {
        if(this.gameObject.parent == null) return position;

        let res = this.gameObject.parent.transform.getLocalToWorldMatrix().inverse().multiplyNew(new Matrix([[position.x], [position.y], [1]]));
        return new Vector2(res.getElement(0, 0), res.getElement(1, 0));
    }

    /**
     * @param {Vector2} pos 
     */
    setWorldPosition(pos) {
        this.setLocalPosition(this.worldToLocalSpace(pos));
    }

    /**@param {SceneRendererTools} tools */
    onGizmosSelected(tools) {
        if(this.gameObject.isHeader) return;
        this.setWorldPosition(tools.gizmoMove(this.id + "move", this.getWorldPosition()));

        this.setLocalAngle(tools.gizmoRotation(this.id + "rotate", this.getWorldPosition(), this.localAngle));
        this.setLocalScale(tools.gizmoScale(this.id + "scale", this.getWorldPosition(), this.localScale));
    }

    getWorldRotation() {
        if(this.gameObject.parent == null) return this.localAngle;
        return this.gameObject.parent.transform.getWorldRotation() + this.localAngle;
    }

    getWorldScale() {
        if(this.gameObject.parent == null) return this.localScale;
        return new Vector2(this.gameObject.parent.transform.getWorldScale()).multiply(this.localScale)
    }
}