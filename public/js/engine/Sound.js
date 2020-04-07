/* jshint expr: true */
import Resource from "./Resource";

/**
 * @see https://github.com/Luminighty/jelloscript/wiki/Sound
 */
export default class Sound extends Resource {

    constructor(path, loop = false) {
        super(path, "audio");
        /** @private */
		this._loop = loop;
    }

    /**
     * Plays the sound from a specified time
     * @param {Number} time The time in seconds
     */
    play(time=0) {
		this.element.currentTime = time;
		this.element.play()
		.catch(_ => {
			setTimeout(() => {
				this.play(time);
			}, 10);
		});
	}
	
	/**
	 * Plays the sound once with a cloned instance. Then unloads it
	 * @param {Number} volume The volume for the audio
	 * @param {Number} time The start time
	 */
	playOnce(volume, time=0) {
		/** @type HTMLAudioElement */
		const clone = this.element.cloneNode();
		clone.volume = (volume) ? volume : this.volume;
		clone.currentTime = time;
		clone.loop = false;
		const runTime = clone.duration - time;
		clone.play()
		.catch(_ => {
			setTimeout(() => {
				this.playOnce(volume, time);	
			}, 10);
		});
		setTimeout(() => { clone.remove(); }, runTime);
	}

    /** Shorthand for sound.paused = false; */
    resume() {this.paused = false;}

    /** @type {Boolean} */
    get paused() { return this.element.paused; }
    set paused(value) {
        const element = this.element;
        (value) ? element.pause() : element.play();
    }

    /** @type {Boolean} */
    get muted() {return this.element.muted;}
    set muted(value) {this.element.muted = value;}
    
    /** @type [ 0.0 ; 1.0 ] */
    get volume() {return this.element.volume; }
    set volume(value) {this.element.volume = value;}

    /** @type {HTMLAudioElement} */
    get element() {return super.element;}

    /** @type {Number} */
    get duration() {return this.element.duration;}

    /** @type {Boolean} */
    get loop() {return this._loop;}
    set loop(value) {
        this._loop = value;
        this.element.loop = value;
	}

	/** 
	 * The current playback time in seconds
	 * @returns {Number} */
	get currentTime() {return this.element.currentTime; }
	set currentTime(time) {this.element.currentTime = time;}

    load() {
		super.load();
		/** @type {HTMLAudioElement} */
        const element = this.element;
        element.preload = "auto";
        element.loop = this.loop;
		element.controls = false;
    }

}
