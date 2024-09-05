class SceneRendererTools {

    x1;y1;x2;y2;width;height;
    screenX;screenY;screenScale;

    pixelTileSize;

    /**@type {Matrix} */
    matrix;

    constructor() {
        this.pixelTileSize = 64;
    }

    _setScreenView(x1, y1, x2, y2, width, height, screenX, screenY, screenScale) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.width = width;
        this.height = height;
        this.screenX = screenX;
        this.screenY = screenY;
        this.screenScale = screenScale;
    }

    _coordToScreenSpace(x, y, width, height) {
        
        let result = this._getMatrix().multiplyNew(new Matrix([[x], [y], [1]]));
        x = result.getElement(0, 0);
        y = result.getElement(1, 0);

        x *= this.getRealPixelTileSize();
        y *= this.getRealPixelTileSize();
        width *= this.getRealPixelTileSize();
        height *= this.getRealPixelTileSize();
        let center =new Vector2(this.x1 + this.width / 2, this.y1 + this.height/2);
        return {
            x: x + center.x,
            y: y + center.y,
            width: width,
            height: height,
        }
    }

    getRealPixelTileSize() {
        return this.pixelTileSize * this.screenScale;
    }

    _screenSpaceToCoord(x, y, width, height) {
        let center = new Vector2(this.x1 + this.width / 2, this.y1 + this.height/2);
        x -= center.x;
        y -= center.y;
        x /= this.getRealPixelTileSize();
        y /= this.getRealPixelTileSize();
        width /= this.getRealPixelTileSize();
        height /= this.getRealPixelTileSize();

        let result = this._getMatrix().inverseNew().multiplyNew(new Matrix([[x], [y], [1]]));
        x = result.getElement(0, 0);
        y = result.getElement(1, 0);

        return {
            x: x,
            y: y,
            width: width,
            height: height
        }
    }

    _getMatrix() {
        if(this.matrix == null)
            return new Matrix().setAsTransformMatrix(this.screenX, this.screenY, 0, 1, 1, 0, 0);
        return this.matrix;
    }

    /**@param {Matrix} matrix  */
    _setMatrix(matrix) {
        this.matrix = matrix;
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
        staticUISpace.ui.drawText(text, center.x, center.y, center.x + center.width, center.y + center.height, draw);
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
            let hover = staticUISpace.mouse.isHoveringOver(centerSquare.x1, centerSquare.y1, centerSquare.x2, centerSquare.y2, 0, hoverID);
            let down = staticUISpace.mouse.isToolDown(hoverID);

            // if we are being grabbed, set the active tool and calculate the new position
            if(hover && down) {
                staticUISpace.mouse.setActiveTool(hoverID);
                // handle the offset
                let old = position;
                position = new Vector2(t._screenSpaceToCoord(staticUISpace.mouse.x, staticUISpace.mouse.y));
                let offset = staticUISpace.mouse.activeToolInitData[hoverID] || position.subtractNew(old);
                staticUISpace.mouse.activeToolInitData[hoverID] = offset;
                position.subtract(offset);
            } else {
                staticUISpace.mouse.removeActiveTool(hoverID);
            }
    
            // then draw the square
            staticUISpace.ui.drawRectCoords(centerSquare.x1, centerSquare.y1, 
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
            let hover = staticUISpace.mouse.isHoveringOver(space.x1, space.y1, space.x2, space.y2, 0, hoverID);
            let down = staticUISpace.mouse.isToolDown(hoverID);
            
            // if we are being grabbed, set the active tool and apply
            if(hover && down) {
                staticUISpace.mouse.setActiveTool(hoverID);
                let old = position;
                position = new Vector2(t._screenSpaceToCoord(staticUISpace.mouse.x, staticUISpace.mouse.y));
                let offset = staticUISpace.mouse.activeToolInitData[hoverID] || position.subtractNew(old);
                staticUISpace.mouse.activeToolInitData[hoverID] = offset;
                position.subtract(offset);
                if(isX)
                    position.y = old.y;
                else
                    position.x = old.x;
            } else {
                staticUISpace.mouse.removeActiveTool(hoverID);
            }

            // then draw the arrow
            if(isX) {
                let arrowSideWidth = (space.y2-space.y1) * arrowSideWidthPercent;
                let arrowWidth = (space.y2-space.y1);
                staticUISpace.ui.drawPolygon([
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
                staticUISpace.ui.drawPolygon([
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

    gizmoRotation(id, position, angle, size = 1) {
        let screenSpace = this._coordToScreenSpace(position.x, position.y);

        let radius = 150*size;
        let mouseDist = staticUISpace.mouse.distanceTo(screenSpace.x, screenSpace.y);
        let hover = (mouseDist > radius-10 && mouseDist < radius+10 && staticUISpace.mouse.activeTool == null) || staticUISpace.mouse.activeTool == id;
        let down = staticUISpace.mouse.isToolDown(id);
        
        staticUISpace.ui.drawEllipse(screenSpace.x, screenSpace.y, radius*2, radius*2, (hover) ? COLORS.rotateGizmoHover : COLORS.rotateGizmoNormal);

        if(hover && down) {
            staticUISpace.mouse.setActiveTool(id);

            let newAngle = staticUISpace.mouse.angleTo(screenSpace.x, screenSpace.y);
            let offset = staticUISpace.mouse.activeToolInitData[id] || (newAngle - angle);
            if(offset < -180)
                offset += 360;
            if(offset > 180)
                offset -= 360;
            staticUISpace.mouse.activeToolInitData[id] = offset;
            angle = newAngle - offset;
        } else {
            staticUISpace.mouse.removeActiveTool(id);
        }

        return angle;        
    }

    gizmoScale(id, position, scale, size = 1) {
        let screenSpace = this._coordToScreenSpace(position.x, position.y);

        let space = {
            x1: screenSpace.x + 50*size * scale.x,
            y1: screenSpace.y + 50*size * scale.y
        }
        space.x2 = space.x1 + 30;
        space.y2 = space.y1 + 30;

        let hover = staticUISpace.mouse.isHoveringOver(space.x1, space.y1, space.x2, space.y2, 0, id);
        let down = staticUISpace.mouse.isToolDown(id);

        staticUISpace.ui.drawRectCoords(space.x1, space.y1, space.x2, space.y2, 0, hover ? COLORS.moveGizmoCenterHover : COLORS.moveGizmoCenterNormal);

        if(hover && down) {
            staticUISpace.mouse.setActiveTool(id);

            let og = staticUISpace.mouse.activeToolInitData[id] || scale;
            staticUISpace.mouse.activeToolInitData[id] = og;

            scale = new Vector2(staticUISpace.mouse.getDownDistanceSeperate()).scale(1 /this.pixelTileSize).add(og);
            if(staticUISpace.keyboard.isShiftDown)
                scale.x = scale.y;

        } else {
            staticUISpace.mouse.removeActiveTool(id);
        }

        return scale;    
    }

    /**@param {{x: 0, y: 0}[]} points @param {DrawShapeOption} draw */
    polygon(points, draw) {
        let convertedPoints = [];
        for(let i = 0; i < points.length; i++) {
            let space = this._coordToScreenSpace(points[i].x, points[i].y);
            convertedPoints.push({x: space.x, y: space.y});
        }

        staticUISpace.ui.drawPolygon(convertedPoints, draw);
    }
    /**@param {ImageAsset} image @param {{x: 0, y: 0}[]} points @param {DrawImageOption} draw */
    image(image, x1, y1, x2, y2, rotation, draw) {
        let leftTop = this._coordToScreenSpace(x1, y1);
        let bottomRight = this._coordToScreenSpace(x2, y2);

        staticUISpace.ui.drawImage(image, leftTop.x, leftTop.y, bottomRight.x, bottomRight.y, rotation, draw);
    }
}