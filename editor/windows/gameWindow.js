class GameWindow extends EditorWindow {

    /**@type {SceneRendererTools} */
    tools;

    barColor;

    constructor() {
        super("Preview");

        this.tools = new SceneRendererTools();
        this.barColor = new DrawShapeOption("#ff0000");
    }

    render(x1, y1, x2, y2, width, height) {
        let scene = editor.activeScene;
        
        staticUISpace.ui.drawRectCoords(x1, y1, x2, y2, 0, new DrawShapeOption(scene.controller.backgroundColor));
        if(scene.activeCamera == null) {
            staticUISpace.ui.drawText("No Active Camera", x1, y1, x2, y2, new DrawTextOption(35, "default", "#ffffff", "center", "center"));
        }
        let cam = scene.activeCamera;
        let camPos = cam.transform.getWorldPosition();
        let camScale = cam.transform.getWorldScale();

        let cWidth = cam.width * camScale.x;
        let cHeight = cam.height * camScale.y;

        let xScale = (x2-x1) / cWidth;
        let yScale = (y2-y1) / cHeight;
        let scale = 1;

        let topBarHeight = 0;
        let leftBarHeight = 0;

        let camAspectRatio = cWidth / cHeight;

        // fit to width
        if(xScale < yScale) {
            scale = xScale;
            //topBarHeight = (height - cam.height) * (yScale - xScale) * camAspectRatio;
            leftBarHeight = 0;

        // fit to height
        } else {
            scale = yScale;

            topBarHeight = 0;
        }

        this.tools._setScreenView(x1, y1, x2, y2, width, height, 0, 0, scale);
        this.tools._setMatrix(cam.transform.getLocalToWorldMatrix().inverseNew());

        // render all of the onSceneRenders for each component in the scene
        for(let id in editor.allComponentsCache) {
            // ensure the object is active
            if(editor.allComponentsCache[id].target instanceof RenderingComponent && editor.allComponentsCache[id].target.gameObject.activeInHierarchy)
                editor.allComponentsCache[id].target.render(this.tools);
        }

        if(topBarHeight > 2) {
            staticUISpace.ui.drawRectCoords(x1, y1, x2, y1+topBarHeight, 0, this.barColor);
            staticUISpace.ui.drawRectCoords(x1, y2-topBarHeight, x2, y2, 0, this.barColor);
        }

        if(leftBarHeight > 2) {
            staticUISpace.ui.drawRectCoords(x1, y1, x1+leftBarHeight, y2, 0, this.barColor);
            staticUISpace.ui.drawRectCoords(x2-leftBarHeight, y1, x2, y2, 0, this.barColor);
        }
    }
}