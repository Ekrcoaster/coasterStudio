class InspectorWindow extends EditorWindow {

    constructor() {
        super("Inspector");
    }

    text = "this is a test";

    render(x1, y1, x2, y2, width, height) {
        const t = this;

        this.text = UI_WIDGET.editableText("test", this.text, true, x1, y1, x2, y1+30, new DrawTextOption(25, "default", "white", "left", "center"), [
        ]).text;

        if(editor.selectedGameObjects.size == 0) return;
        let active = Array.from(editor.selectedGameObjects)[0];

        /**@type {Component[]} */
        let components = [];
        for(let i = 0; i < active.components.length; i++)
            components.push(active.components[i]);

        let y = y1+5;
        for(let i = 0; i < components.length; i++) {
            let res = UI_WIDGET.inspectorComponent("inspector"+this.container.id, x1+3, y, x2-3, components[i]);
            y += res.height;
        }
    }
}