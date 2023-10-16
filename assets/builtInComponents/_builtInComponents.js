const BUILD_IN_COMPONENTS = {
    "Rotator": "class Rotator extends Component {\n\tNumber degPerSecond = 90;\n\tonUpdate() {\n\t\tthis.gameObject.transform.localAngle += engine.deltaTime * this.degPerSecond;\n\t}\n}"
}