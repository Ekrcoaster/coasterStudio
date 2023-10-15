class SceneController extends Component {

    /**@type {Color} */
    backgroundColor;

    constructor(gameObject) {
        super("SceneController", gameObject);
        this.backgroundColor = new Color("#000000");
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }

    saveSerialize() {
        return {
            ...super.saveSerialize(),
            backgroundColor: this.backgroundColor
        }
    }

    loadSerialize(data) {
        super.loadSerialize(data);
        this.setBackgroundColor(data.backgroundColor);
    }
}