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
}