class InspectorWindow extends EditorWindow {

    constructor() {
        super("Inspector");
    }

    render(x1, y1, x2, y2, width, height) {
        const t = this;

        if(editor.selectedGameObjects.length == 0) return;
        let active = editor.selectedGameObjects[0];

        let y = y1;
        y += drawHeader(y);

        y += 10;
        for(let i = 0; i < editor.selectedComponentsCache.length; i++) {
            let res = UI_WIDGET.inspectorComponent("inspector"+this.container?.id, x1+5, y, x2-5, editor.selectedComponentsCache[i], editor.selectedEditorComponentsCache[i]);
            y += res.height;
        }

        if(UI_WIDGET.button("Add Component", x1+10, y+10, x2-10, y+40)) {
            let components = assets.getAssetsOfType("engine/", ComponentAsset);
            let options = [];
            for(let i = 0; i < components.length; i++) {
                options.push(new DropdownItem(i, components[i].scriptName(), components[i]));
            }

            UI_WIDGET.popUpDropdownList("addComponent" + t.container?.id, options, -1, x1+10, y+10, x2-10, y+40, (index) => {
                options[index].obj.addComponent(editor.selectedGameObjects[0]);
                editor._updateSelected();
            });
        }

        function drawHeader(y) {
            let height = 40;
            //UI_LIBRARY.drawRectCoords(x1, y, x2, y+height, 0, COLORS.windowDarkerBackground());

            // create the toggle for the isActive
            let nameAndEnableHeight = 35;
            let toggle = UI_WIDGET.toggle(t.container.id+"obToggle", active.isActive, !active.isHeader, x1+5, y+5, x1+nameAndEnableHeight, y+nameAndEnableHeight);
            if(toggle.isOn != active.isActive && active.id != editor.activeScene.header.id)
                active.setActive(toggle.isOn);

            // create the string field for the object name
            let newName = UI_WIDGET.editorGUIString(t.container.id+"objName", "", active.name, active.id != editor.activeScene.header.id, x1+5+nameAndEnableHeight, y+5, x2-5, y+nameAndEnableHeight, new StringFieldOption("any").setTextLengthRestraints(1, 64));
            if(newName.applied)
                active.name = newName?.text;
            return height;
        }
    }
}