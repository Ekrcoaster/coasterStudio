class SceneWindow extends EditorWindow {

    screenX;
    screenY;
    screenScale;

    tools;

    constructor() {
        super("Scene");
        this.screenX = 0;
        this.screenY = 0;
        this.screenScale = 1;
        this.tools = new SceneRendererTools();
    }

    render(x1, y1, x2, y2, width, height) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.sceneBackgroundColor);

        this.tools._setScreenView(x1, y1, x2, y2, width, height);

        for(let id in editor.allComponentsCache) {
            editor.allComponentsCache[id].onSceneRender(editor.allComponentsCache[id].target.transform, this.tools);
        }

        for(let i = 0; i < editor.selectedEditorComponentsCache.length; i++) {
            editor.selectedEditorComponentsCache[i].onSelectedSceneRender(editor.selectedComponentsCache[i].transform, this.tools);
        }
    }
}

class SceneRendererTools {
    /**@type {SceneWindow} */
    sceneWindow;

    x1;y1;x2;y2;width;height;

    pixelTileSize;

    /**@param {SceneWindow} sceneWindow */
    constructor(sceneWindow) {
        this.sceneWindow = sceneWindow;
        this.pixelTileSize = 64;
    }

    _setScreenView(x1, y1, x2, y2, width, height) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.width = width;
        this.height = height;
    }

    _coordToScreenSpace(x, y, width, height) {
        x *= this.pixelTileSize;
        y *= this.pixelTileSize;
        width *= this.pixelTileSize;
        height *= this.pixelTileSize;
        let center =new Vector2(this.x1 + this.width / 2, this.y1 + this.height/2);
        return {
            x: x + center.x,
            y: y + center.y,
            width: width,
            height: height,
        }
    }

    /**
     * 
     * @param {String} text 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {DrawTextOption} draw 
     */
    text(text, x, y, width, height, draw) {
        let center = this._coordToScreenSpace(x, y, width, height);
        UI_LIBRARY.drawText(text, center.x, center.y, center.x + center.width, center.y + center.height, draw);
    }
}