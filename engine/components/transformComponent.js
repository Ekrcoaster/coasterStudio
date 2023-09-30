class Transform extends Component {
    /**@type {Vector2} */
    localPosition;
    localAngle;
    localScale;

    constructor() {
        super("Transform");
        this.localPosition = new Vector2();
        this.localAngle = 0;
        this.localScale = new Vector2(1, 1);
    }
}