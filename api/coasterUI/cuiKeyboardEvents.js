

class Keyboard {
    /**@typedef {("A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z"|"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"!"|"@"|"#"|"$"|"%"|"^"|"&"|"*"|"SPACE"|"SHIFT"|"CTRL"|"ALT"|"DELETE"|"ARROWLEFT"|"ARROWRIGHT"|"ARROWUP"|"ARROWDOWN"|"ENTER")} KeyboardKeyType */
    
    /**@type {Set<KeyboardKeyType>} */
    down = new Set();

    /**@type {Set<KeyboardKeyType>} */
    downFirst = new Set();

    /**@type {Set<KeyboardKeyType>} */
    upFirst = new Set();

    isShiftDown;
    isCtrlDown;
    isAltDown;
    isCapsLockDown;

    keyDownQueue = [];
    keyUpQueue = [];
    constructor() {
        this.down = new Set();
        this.downFirst = new Set();
        this.upFirst = new Set();

        this.isShiftDown = false;
        this.isCtrlDown = false;
        this.isAltDown = false;
        this.isCapsLockDown = false;
        
        this.keyDownQueue = [];
        this.keyUpQueue = [];

    }

    tick() {
        this.downFirst = new Set();
        this.upFirst = new Set();

        let needsRendering = false;
        // handle all of the waiting down keys
        for(let i = 0; i < this.keyDownQueue.length; i++) {
            this.onKey(this.keyDownQueue[i], true);
            needsRendering = true;
        }
        this.keyDownQueue = [];

        // handle all of the waiting up keys
        for(let i = 0; i < this.keyUpQueue.length; i++) {
            this.onKey(this.keyUpQueue[i], false);
            needsRendering = true;
        }
        this.keyUpQueue = [];


        return needsRendering;
    }

    onKey(key, down) {
        key = this.convertKey(key);

        if(down) this.down.add(key);
        else this.down.delete(key);
        
        if(key == "CTRL") this.isCtrlDown = down;
        if(key == "ALT") this.isAltDown = down;
        if(key == "SHIFT") this.isShiftDown = down;

        if(down) {
            this.downFirst.add(key);
        } else {
            this.upFirst.add(key);
        }
    }

    convertKey(key) {
        key = key.toUpperCase();
        if(key == "META") key = "CONTROL";
        if(key == "CONTROL") key = "CTRL";
        if(key == "BACKSPACE") key = "DELETE";
        if(key == "RETURN") key = "ENTER";
        return key;
    }

    getAlphabeticNumbericSymbolic(key) {
        let allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()_+-=[]\\{}|;':\",./<>? ";
        if(allowed.indexOf(key) == -1) {
            if(key == "SPACE")
                return " ";
            return "";
        }

        if(!this.isShiftDown && !this.isCapsLockDown)
            return key.toLowerCase();
        return key;
    }
}