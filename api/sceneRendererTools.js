class SceneRendererTools {
    /**@type {SceneWindow} */
    sceneWindow;

    x1;y1;x2;y2;width;height;

    toolCache;

    /**@param {SceneWindow} sceneWindow */
    constructor(sceneWindow) {
        this.sceneWindow = sceneWindow;
        this.toolCache = {};
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
        let center = new Vector2(this.x1 + this.width / 2, this.y1 + this.height/2);
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
    gizmoMove(id, position, size = 1) {
        const t = this;
        let screenSpace = this._coordToScreenSpace(position.x, position.y);
        let centerSquare = {
            x1: screenSpace.x-10 * size,
            y1: screenSpace.y-10 * size,
            x2: screenSpace.x+10 * size,
            y2: screenSpace.y+10 * size
        }

        renderCenter();
        renderDir(true);
        renderDir(false);
        
        function renderCenter() {
            // setup the grabbing
            let hoverID = "moveXY" + id;
            let hover = mouse.isHoveringOver(centerSquare.x1, centerSquare.y1, centerSquare.x2, centerSquare.y2, 0, hoverID);
            let down = mouse.isToolDown(hoverID);

            // if we are being grabbed, set the active tool and calculate the new position
            if(hover && down) {
                mouse.setActiveTool(hoverID);
                // handle the offset
                let old = position;
                position = new Vector2(t._screenSpaceToCoord(mouse.x, mouse.y));
                let offset = t.toolCache[hoverID] || position.subtractNew(old);
                t.toolCache[hoverID] = offset;
                position.subtract(offset);
            } else {
                mouse.removeActiveTool(hoverID);
                if(t.toolCache[hoverID])
                    delete t.toolCache[hoverID];
            }
    
            // then draw the square
            UI_LIBRARY.drawRectCoords(centerSquare.x1, centerSquare.y1, 
                centerSquare.x2, centerSquare.y2, 0, hover ? COLORS.moveGizmoCenterHover : COLORS.moveGizmoCenterNormal);
        }

        function renderDir(isX) {
            let arrowMargin = 10;
            let arrowLength = 100;
            let arrowSideWidthPercent = 0.25;
            // figure out the arrow space
            let space = {
                x1: centerSquare.x2 + arrowMargin,
                y1: centerSquare.y1,
                x2: centerSquare.x2 + arrowMargin + arrowLength,
                y2: centerSquare.y2
            }

            // recalculate the space for y
            if(!isX) {
                space = {
                    x1: centerSquare.x1,
                    y1: centerSquare.y2 + arrowMargin,
                    x2: centerSquare.x2,
                    y2: centerSquare.y2 + arrowMargin + arrowLength,
                }
            }

            // setup the grab stutff
            let hoverID = "move" + (isX ? "x" : "y") + id;
            let hover = mouse.isHoveringOver(space.x1, space.y1, space.x2, space.y2, 0, hoverID);
            let down = mouse.isToolDown(hoverID);
            
            // if we are being grabbed, set the active tool and apply
            if(hover && down) {
                mouse.setActiveTool(hoverID);
                let old = position;
                position = new Vector2(t._screenSpaceToCoord(mouse.x, mouse.y));
                let offset = t.toolCache[hoverID] || position.subtractNew(old);
                t.toolCache[hoverID] = offset;
                position.subtract(offset);
                if(isX)
                    position.y = old.y;
                else
                    position.x = old.x;
            } else {
                mouse.removeActiveTool(hoverID);
                if(t.toolCache[hoverID])
                    delete t.toolCache[hoverID];
            }

            // then draw the arrow
            if(isX) {
                let arrowSideWidth = (space.y2-space.y1) * arrowSideWidthPercent;
                let arrowWidth = (space.y2-space.y1);
                UI_LIBRARY.drawPolygon([
                    {x: space.x1, y: space.y1 +arrowSideWidth},
                    {x: space.x2-arrowWidth, y: space.y1 +arrowSideWidth},
                    {x: space.x2-arrowWidth, y: space.y1},
                    {x: space.x2, y: (space.y1+space.y2)/2},
                    {x: space.x2-arrowWidth, y: space.y2},
                    {x: space.x2-arrowWidth, y: space.y2-arrowSideWidth},
                    {x: space.x1, y: space.y2 -arrowSideWidth},
                ], hover ? COLORS.moveGizmoXHover : COLORS.moveGizmoXNormal);
            } else {
                let arrowSideWidth = (space.x2-space.x1) * arrowSideWidthPercent;
                let arrowWidth = (space.x2-space.x1);
                UI_LIBRARY.drawPolygon([
                    {x: space.x1 + arrowSideWidth, y: space.y1},
                    {x: space.x1 + arrowSideWidth, y: space.y2 - arrowWidth},
                    {x: space.x1, y: space.y2 - arrowWidth},
                    {x: (space.x1 + space.x2)/2, y: space.y2},
                    {x: space.x2, y: space.y2 - arrowWidth},
                    {x: space.x2 - arrowSideWidth, y: space.y2 - arrowWidth},
                    {x: space.x2 - arrowSideWidth, y: space.y1},
                ], hover ? COLORS.moveGizmoYHover : COLORS.moveGizmoYNormal);
            }
        }
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