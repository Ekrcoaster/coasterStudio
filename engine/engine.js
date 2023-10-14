class Engine {

    /**@type {Scene} */
    activeScene;

    isPlaying;
    time;

    fps;
    lastTick;
    deltaTime;

    constructor(fps) {
        this.fps = fps;
        this.lastTick = null;
    }

    startPlaying() {
        if(this.activeScene == null) throw "No active scene to start!";
        this.isPlaying = true;
        this.time = 0;
        this.activeScene.init();
    }

    stopPlaying() {
        this.isPlaying = false;
    }

    tick() {
        if(!this.isPlaying) return;

        let now = Date.now();

        if(this.lastTick == null) {
            this.time += 1 / this.fps;
            this.deltaTime = 0;
        }
        else {
            this.deltaTime = (now - this.lastTick)/1000;
            this.time += this.deltaTime;
        }

        this.activeScene.onUpdate();

        this.lastTick = now;
    }
}