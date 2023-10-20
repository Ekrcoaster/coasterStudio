const COLORS = {
    background: "#1c1c1c",

    windowResizeHandleDefault: new DrawShapeOption("#07070700"),
    windowResizeHandleHover: new DrawShapeOption("#3b3b3bfe"),
    windowResizeHandlePress: new DrawShapeOption("#b0b0b0fe"),

    windowBackground: ()=>{ return new DrawShapeOption("#555555", "#2c2c2c", 3).setRoundedCorners(10)},
    windowModalBackground: ()=>{ return new DrawShapeOption("#323232ef", "#2c2c2c", 5).setRoundedCorners(20)},
    windowDarkerBackground: () => { return new DrawShapeOption("#33343489", "#1a1a1a", 2).setRoundedCorners(10)},
    windowEvenDarkerBackground: () => { return new DrawShapeOption("#232323", "#131313", 2).setRoundedCorners(10)},
    windowTabLabel: new DrawTextOption(25, "default", "#979797", "center", "center"),

    windowTabDefault: new DrawShapeOption("#363636", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabHover: new DrawShapeOption("#636363", "#c5c5c5", 3).setRoundedCorners(10),
    windowTabActive: new DrawShapeOption("#555555", "#2c2c2c", 3).setRoundedCorners(10, 10, 0, 0),
    windowTabPotential: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),
    windowTabMoving: new DrawShapeOption("#6b758012").setRoundedCorners(10),
    windowTabInsert: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),

    hierarchyWindowGameObjectNormalText: new DrawTextOption(28, "default", "#ffffff", "left", "center"),
    hierarchyWindowGameObjectDisabledText: new DrawTextOption(28, "default", "#ffffff62", "left", "center"),
    hierarchyWindowSceneGameObjectBackground: new DrawShapeOption("#33343489", "#000000", 2),
    hierarchyWindowSceneGameObjectText: new DrawTextOption(28, "default", "#ffffff7d", "left", "center"),
    hierarchyWindowSelect: new DrawShapeOption("#2986ea5e"),

    inspectorComponentHeader: new DrawShapeOption("#33343489", "#24242489", 3),
    inspectorComponentHeaderText: new DrawTextOption(25, "default", "#ffffff", "left", "center"),
    inspectorComponentBox: new DrawShapeOption("#40404089", "#333333", 2).setRoundedCorners(10),
    inspectorLabel: new DrawTextOption(25, "default", "#ffffff7d", "left", "center"),

    textCursor: new DrawShapeOption("#ffffff"),
    textSelect: new DrawShapeOption("#2986ea5e"),

    stringEditorText: new DrawTextOption(25, "default", "#ffffff", "left", "center"),
    stringEditorTextBackground: new DrawShapeOption("#33343489", "#131313", 2).setRoundedCorners(10),

    normalDropdownHandle: new DrawShapeOption("#656565"),
    hoverDropdownHandle: new DrawShapeOption("#ffffff"),

    toggleBoxEmpty: new DrawShapeOption("#212121", "#6b758012", 2).setRoundedCorners(10),
    toggleBoxFull: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),

    sceneBackgroundColor: new DrawShapeOption("#3a3a3a"),
    sceneGridColor: new DrawLineOption("#ffffff1b", 5),
    sceneGridCenterColor: new DrawShapeOption("#ffffff1b", "#ffffff1b", 5),

    colorPickerHueRotate: new DrawShapeOption("#18181893", "#ffffff", 3),

    assetWindowAssetText: new DrawTextOption(25, "default", "#aaaaaa", "center", "center"),

    buttonDefaultBackground: new DrawShapeOption("#555555", "#2c2c2c", 3).setRoundedCorners(10),
    buttonHoverBackground: new DrawShapeOption("#878787", "#2c2c2c", 3).setRoundedCorners(10),

    dropdownCurrentText:  new DrawTextOption(25, "default", "#ffffff", "left", "center"),
    dropdownItemText:  new DrawTextOption(25, "default", "#ffffffd8", "left", "center"),
    dropdownHoverBackground: new DrawShapeOption("#9496995e").setRoundedCorners(10),
    dropdownSelectedBackground: new DrawShapeOption("#2986ea5e").setRoundedCorners(10),

    moveGizmoCenterNormal: new DrawShapeOption("#c0c0c0"),
    moveGizmoCenterHover: new DrawShapeOption("#ffffff"),
    moveGizmoXNormal: new DrawShapeOption("#be2828"),
    moveGizmoXHover: new DrawShapeOption("#ff2020"),
    moveGizmoYNormal: new DrawShapeOption("#3250b3"),
    moveGizmoYHover: new DrawShapeOption("#3f6cff"),
    rotateGizmoNormal: new DrawShapeOption("#00000000", "#a0a740", 5),
    rotateGizmoHover: new DrawShapeOption("#00000000", "#c5d022", 10),

    cameraColor: new DrawShapeOption("alpha", "#ffffff52", 5),

    playmodeTint: new DrawShapeOption("#398ce41c")
}