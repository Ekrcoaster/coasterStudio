class DebugWindow extends EditorWindow {

    constructor() {
        super("Debug");
    }

    render(x1, y1, x2, y2, width, height) {
        staticUISpace.ui.drawRectCoords((x1+x2)/2-300, (y1+y2)/2-50, (x1+x2)/2+300, (y1+y2)/2+50, 0, new DrawShapeOption("#ff00ff51"))
        
        let res = staticUISpace.ui.drawRichText([
            new RichTextToken("Hello", "#ffffff", 35).setAfterMargin(50),
            new RichTextToken(" this is a ", "#ffff00",15),
            new RichTextToken("fun test  ", "#00ffff"),
            new RichTextToken("wowtest",null, 35)
        ], (x1+x2)/2-300, (y1+y2)/2-50, (x1+x2)/2+300, (y1+y2)/2+50, new DrawTextOption(25, "default", "#ffffff", "center", "center"));

        console.log(res.getTokenAtX(staticUISpace.mouse.x));
    }
}