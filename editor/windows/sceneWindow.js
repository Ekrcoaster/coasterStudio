class SceneWindow extends EditorWindow {

    screenX;
    screenY;
    screenScale;

    /**@type {SceneRendererTools} */
    tools;

    downScreenX;
    downScreenY;

    pixelTileSize = 64;

    constructor() {
        super("Scene");
        this.screenX = 0;
        this.screenY = 0;
        this.screenVelocityX = 0;
        this.screenVelocityY = 0;
        this.screenScale = 1;
        this.pixelTileSize = 64;
        this.tools = new SceneRendererTools(this);
    }

    render(x1, y1, x2, y2, width, height) {
        UI_LIBRARY.drawRectCoords(x1, y1, x2, y2, 0, COLORS.sceneBackgroundColor);

        // setup the tool
        this.tools._setScreenView(x1, y1, x2, y2, width, height);

        this.renderGrid(x1, y1, x2, y2);

        // render all of the onSceneRenders for each component in the scene
        for(let id in editor.allComponentsCache) {
            // ensure the object is active
            if(editor.allComponentsCache[id].target.gameObject.activeInHierarchy)
                editor.allComponentsCache[id].onSceneRender(editor.allComponentsCache[id].target.transform, this.tools);
        }

        // now render all of the selected components
        for(let i = 0; i < editor.selectedEditorComponentsCache.length; i++) {
            if(editor.selectedEditorComponentsCache[i].target.gameObject.activeInHierarchy && editor?.selectedComponentsCache[i] != null)
                editor.selectedEditorComponentsCache[i].onSelectedSceneRender(editor?.selectedComponentsCache[i]?.transform, this.tools);
        }

        let hover = mouse.isHoveringOver(x1, y1, x2, y2, 0, "scene" + this.container?.id);
        let down = mouse.isToolDown("scene" + this.container?.id);
        
        // handle dragging 
        if(down && hover) {
            // save the screens' og position when clicked
            if(mouse.clickDown) {
                this.downScreenX = this.screenX;
                this.downScreenY = this.screenY;
                mouse.setActiveTool("scene" + this.container?.id);
            }

            // then calculate the new position based on how much it moved
            let downDistances = mouse.getDownDistanceSeperate();
            let sensitivity = 1/this.getRealPixelTileSize();
            this.screenX = this.downScreenX + downDistances.x * sensitivity;
            this.screenY = this.downScreenY + downDistances.y * sensitivity;
        } else {
            mouse.removeActiveTool("scene" + this.container?.id);
        }

        if(hover) {
            this.changeScale(mouse.getScrollVelocity());
        }
    }

    changeScale(amt) {
        if(amt == 0) return;
        let mousePos = this.tools._screenSpaceToCoord(mouse.x, mouse.y);

        this.screenScale += mouse.getScrollVelocity();

        if(this.screenScale <= 0.3)
            this.screenScale = 0.3;

        //this.screenX -= mousePos.x * mouse.getScrollVelocity();
        //this.screenY -= mousePos.y * mouse.getScrollVelocity();
    }

    renderGrid(x1, y1, x2, y2) {

        let topLeft = this.tools._screenSpaceToCoord(x1, y1);
        let bottomRight = this.tools._screenSpaceToCoord(x2, y2);

        // draw the horizontal lines
        for(let x = Math.floor(topLeft.x); x <= Math.ceil(bottomRight.x); x += 1) {
            let space = this.tools._coordToScreenSpace(x, 0, 0, 0);
            UI_LIBRARY.drawLine(space.x, y1, space.x, y2, COLORS.sceneGridColor);
        }

        // draw the vertical lines
        for(let y = Math.floor(topLeft.y); y <= Math.ceil(bottomRight.y); y += 1) {
            let space = this.tools._coordToScreenSpace(0, y, 0, 0);
            UI_LIBRARY.drawLine(x1, space.y, x2, space.y, COLORS.sceneGridColor);
        }
        
        let center = this.tools._coordToScreenSpace(0, 0, 0, 0);
        UI_LIBRARY.drawRectCoords(center.x-10, center.y-10, center.x+10, center.y+10, 45, COLORS.sceneGridCenterColor)
    }

    getRealPixelTileSize() {
        return this.pixelTileSize * this.screenScale;
    }

    tick() {
        
    }
}