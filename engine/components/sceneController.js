class SceneController extends Component {

    /**@type {Color} */
    backgroundColor;

    constructor(gameObject) {
        super("Scene Controller", gameObject);
        this.backgroundColor = new Color("#000000");
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }
}