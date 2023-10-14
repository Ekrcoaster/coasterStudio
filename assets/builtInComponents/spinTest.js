class SpinTest extends Component {
    
    onUpdate() {
        this.gameObject.transform.localAngle += engine.deltaTime * 90;
    }
}