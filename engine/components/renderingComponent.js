class RenderingComponent extends Component {

    /**@type {Bounds} */
    bounds;

    /**@param {SceneRendererTools} tools */
    render(tools) {}

    isInside(x, y, padding = 0) {
        return this.getBounds().isInside(x, y, padding);
    }

    /**@returns {Bounds} */
    getBounds() {return this.bounds;}
}