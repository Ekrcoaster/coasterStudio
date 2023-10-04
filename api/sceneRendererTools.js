class SceneRendererTools {
    /**@type {SceneWindow} */
    sceneWindow;

    x1;y1;x2;y2;width;height;

    /**@param {SceneWindow} sceneWindow */
    constructor(sceneWindow) {
        this.sceneWindow = sceneWindow;
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
        x += this.sceneWindow.screenX;
        y += this.sceneWindow.screenY;
        x *= this.sceneWindow.getRealPixelTileSize();
        y *= this.sceneWindow.getRealPixelTileSize();
        width *= this.sceneWindow.getRealPixelTileSize();
        height *= this.sceneWindow.getRealPixelTileSize();
        let center =new Vector2(this.x1 + this.width / 2, this.y1 + this.height/2);
        return {
            x: x + center.x,
            y: y + center.y,
            width: width,
            height: height,
        }
    }

    _screenSpaceToCoord(x, y) {
        let center =new Vector2(this.x1 + this.width / 2, this.y1 + this.height/2);
        x -= center.x;
        y -= center.y;
        x /= this.sceneWindow.getRealPixelTileSize();
        y /= this.sceneWindow.getRealPixelTileSize();
        x -= this.sceneWindow.screenX;
        y -= this.sceneWindow.screenY;

        return {
            x: x,
            y: y
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
        UI_LIBRARY.drawText(text, center.x, center.y, center.x + center.width, center.y + center.height, draw.drawDebug());
    }

    /**
     * @param {Vector2} position
     * @param {Vector2} offsetPosition
     *  */
    gizmoMove(id, position, offsetPosition, size = 1) {
        let screenSpace = this._coordToScreenSpace(position.x+offsetPosition.x, position.y+offsetPosition.y);
        let centerSquare = {
            x1: screenSpace.x-10 * size,
            y1: screenSpace.y-10 * size,
            x2: screenSpace.x+10 * size,
            y2: screenSpace.y+10 * size
        }

        let hoverID = "move" + id;
        let hover = mouse.isHoveringOver(centerSquare.x1, centerSquare.y1, centerSquare.x2, centerSquare.y2, 0, hoverID);
        let down = mouse.isToolDown(hoverID);
        if(hover && down) {
            mouse.setActiveTool(hoverID);

            position = new Vector2(this._screenSpaceToCoord(mouse.x, mouse.y));

        } else {
            mouse.removeActiveTool(hoverID);
        }
        //UI_LIBRARY.drawRectCoords(centerSquare.x1, centerSquare.y1, centerSquare.x2, centerSquare.y2, 0, new DrawShapeOption("#ffffff"));

        return position;
    }

    /**@param {{x: 0, y: 0}[]} points @param {DrawShapeOption} draw */
    polygon(points, draw) {
        let convertedPoints = [];
        for(let i = 0; i < points.length; i++) {
            let space = this._coordToScreenSpace(points[i].x, points[i].y);
            convertedPoints.push({x: space.x, y: space.y});
        }

        UI_LIBRARY.drawPolygon(convertedPoints, draw);
    }
}