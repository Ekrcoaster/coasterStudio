const BUILD_IN_COMPONENTS = {
    "Rotator": " class Rotator extends Component { [Number] degPerSecond = 90; onUpdate() { this.gameObject.transform.localAngle += engine.deltaTime * this.amt; } }"
}