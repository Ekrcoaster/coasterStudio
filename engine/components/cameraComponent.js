class Camera extends Component {
    width;
    height;

    constructor(gameObject) {
        super("Camera", gameObject);
        this.width = 800;
        this.height = 600;
    }

    setWidth(width) {this.width = width;}
    setHeight(height) {this.height = height;}

    saveSerialize() {
        return {
            ...super.saveSerialize(),
            width: this.width,
            height: this.height
        }
    }

    loadSerialize(data) {
        super.loadSerialize(data);
        this.setWidth(data.width);
        this.setHeight(data.height);
    }
}