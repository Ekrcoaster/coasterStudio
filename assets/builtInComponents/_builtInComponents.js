const BUILD_IN_COMPONENTS = {
    "Rotator": " class Rotator extends Component {\nNumber degPerSecond = 90;\nonUpdate() {\nthis.gameObject.transform.localAngle += engine.deltaTime * this.degPerSecond;\n}\n }"
}