class InspectorWindow extends EditorWindow {

    /**@type {EditorComponent[]} */
    selectedComponentsCache = [];
    lastSelected = ""

    constructor() {
        super("Inspector");
    }

    render(x1, y1, x2, y2, width, height) {
        const t = this;

        if(editor.selectedGameObjects.length == 0) return;
        let active = editor.selectedGameObjects[0];

        /**@type {Component[]} */
        let components = [];
        for(let i = 0; i < active.components.length; i++)
            components.push(active.components[i]);

        // then, if we have selected something new, create the editor components
        let selectedHash = editor.selectedGameObjects.map((x) => {return x.id}).join("-");
        if(this.lastSelected != selectedHash) {
            this.lastSelected = selectedHash;
            this.createEditorComponents(components);
        }

        let y = y1;
        y += drawHeader(y);

        y += 10;
        for(let i = 0; i < components.length; i++) {
            let res = UI_WIDGET.inspectorComponent("inspector"+this.container.id, x1+5, y, x2-5, components[i], this.selectedComponentsCache[i]);
            y += res.height;
        }

        function drawHeader(y) {
            let height = 40;
            //UI_LIBRARY.drawRectCoords(x1, y, x2, y+height, 0, COLORS.windowDarkerBackground());

            // create the toggle for the isActive
            let nameAndEnableHeight = 35;
            let toggle = UI_WIDGET.toggle(t.container.id+"obToggle", active.isActive, x1+5, y+5, x1+nameAndEnableHeight, y+nameAndEnableHeight);
            if(toggle.isOn != active.isActive && active.id != editor.activeScene.header.id)
                active.setActive(toggle.isOn);

            // create the string field for the object name
            let newName = UI_WIDGET.editorGUIString(t.container.id+"objName", "", active.name, active.id != editor.activeScene.header.id, x1+5+nameAndEnableHeight, y+5, x2-5, y+nameAndEnableHeight);
            if(newName.applied)
                active.name = newName?.text;
            return height;
        }
    }

    /** @param {Component[]} components */
    createEditorComponents(components = []) {
        for(let i = 0; i < components.length; i++) {
            let editorScript = COMPONENT_REGISTER[components[i].name];
            if(editorScript == null) {
                console.error("No editor script found for component " + components[i].name);
                break;
            }

            let instance = null;
            eval(`instance = new ${editorScript}(components[i])`);
            this.selectedComponentsCache[i] = instance;
        }
    }
}