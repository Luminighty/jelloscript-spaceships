/**
 * Similarly to the Events in Node.js this class stores typed listeners with any number of arguments
 */
class EventHandler {

	constructor() {
		/** @type {Object.<string, CallableFunction[]>} */
		this.listeners = {};
	}

	/**
	 * Calls the listeners attached to the event
	 * @param {String} type 
	 * @param {any} args 
	 */
	call(type, ...args) {
		if (this.listeners[type] === undefined)
			return;
		const lists = this.listeners[type];
		for (const list of lists) {
			list(...args);
		}
	}

	/**
	 * Adds a listener to the event
	 * @param {String} type 
	 * @param {CallableFunction} callback 
	 */
	on(type, callback) {
		if (this.listeners[type] === undefined)
			this.listeners[type] = [];
		this.listeners[type].push(callback);
	}

	/**
	 * @callback ForeachCallback
	 * @param {CallableFunction} listener 
	 */

	/**
	 * Iterates through the listeners and passes them as parameters for the callback
	 * @param {String} type 
	 * @param {ForeachCallback} callback 
	 */
	forEach(type, callback) {
		if (this.listeners[type] === undefined)
			return;
		for (const list of this.listeners[type]) {
			callback(list);	
		}
	}
}

/** @typedef {Object} KeyboardControls
 * @property {Object.<String, String>} Buttons
 * @property {Object.<String, Object.<String, String>>} Axes
 */

/**
 * @typedef {Object} PlayerControl
 * @property {String} id
 * @property {Inputs} inputs
 * @property {InputMethods} type
 */

/**
 * @typedef {Object} Inputs
 * @property {import("../Input").Axis} Axes
 * @property {import("../Input").Button} Buttons
 */


/**
 * @public
 * @class
 * @abstract
 * The abstract class used for storing the state of inputs per controller
 */
class Input {
	/** Initializes a new Input */
	constructor() {
		/**
		 * The current states for the Input
		 * @private
		 * @readonly
		 * @type {Number}
		 */
		this.state = 0;
		/** 
		 * @private
		 */
		this._listeners = new EventHandler();
	}

	/**
	 * Calls the attached listeners with the same type
	 * Note: This won't set the Input's state. 
	 * @param {String} type 
	 */
	callListener(type, ...param) {
		this._listeners.call(type, ...param);
	}
}

/**
 * @public
 * @class
 * An input extended for representing Button presses
 */
class Button extends Input {
	
	/** Initializes a new Button input */
	constructor() {
		super();
	}

	/** 
	 * Returns true during the frame the user pressed the button
	 * @public
	 * @type Boolean 
	 */
	get isPressed() {return this.state == 1;}
	/** 
	 * Return true while the button is held down
	 * @public
	 * @type Boolean 
	 */
	get isDown() {return this.state > 0;}
	/** 
	 * Return true during the frame the user released the button
	 * @public
	 * @type Boolean 
	 */
	get isUp() {return this.state < 0;}

	/**
	 * Adds an event listener that's called whenever the button is pressed.
	 * @param {CallableFunction} callback 
	 * @public
	 */
	onPressed(callback) {
		return this._listeners.on(Button.listenerTypes.Pressed, callback);
	}

	/**
	 * Adds an event listener that's called whenever the button is released.
	 * @param {CallableFunction} callback 
	 * @public
	 */
	onReleased(callback) {
		return this._listeners.on(Button.listenerTypes.Released, callback);
	}
}

Button.listenerTypes = {Pressed: 0, Released: 1};

class Axis extends Input {
	
	/** Initializes a new Axis input*/
	constructor() {
		super();
		/**
		 * @private
		 * @readonly
		 * @type {Number}
		 */
		this.dead = 0.0;

		/**
		 * Used for keyboard values
		 * @private
		 * @readonly
		 * @type {Number}
		 */
		this.toValue = 0;
	}

	/** 
	 * Return the current value of the axis. A number between [-1,1]
	 * @public
	 * @type Number 
	 */
	get value() {return (Math.abs(this.state) > this.dead) ? this.state : 0;}

	/**
	 * Adds an event listener that's called whenever the axis' value changed at least with
	 *  the minimum value (set in the input config)
	 * @param {CallableFunction} callback 
	 * @public
	 */
	onChanged(callback) {
		return this._listeners.on(Axis.listenerTypes.Changed, callback);
	}
}
/** 
 * The types of listeners that's supported for the axis input
 * Use the onChanged method instead
 */
Axis.listenerTypes = {Changed: 0};

/**
 * @public
 * @class
 */
class Vector2 {

	/**
	 * Creates a Vector2 variable
	 * @param {Number, Array} x Possible values: The X coordinate; [X, Y]; {x: X, y: Y}
	 * @param {Number} y The Y coordinate
	 */
	constructor(x,y) {
		if (y == null) {
			if (Array.isArray(x))
				x = {x:x[0], y:x[1]};
			y = x.y;
			x = x.x;
		}
		this.x = x;
		this.y = y;
	}

	/**
	 * @param {Number} index 
	 * @returns {Number} (index mod 2 == 0) ? x : y
	 */
	get(index) {
		index %= 2;
		return (index == 0) ? this.x : this.y;
	}
	/**
	 * Clones the vector
	 * @returns {Vector2} clone
	 */
	clone() {
		return new Vector2(this.x, this.y);
	}

	/**
	 * Adds two Vectors together
	 * @param {Vector2} other The other vector to add from the original
	 * @returns {Vector2} a NEW vector2
	 */
	add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
	/**
	 * Substracts two Vectors together (this - other)
	 * @param {Vector2} other The other vector to substract from the original
	 * @returns {Vector2} a NEW vector2
	 */
	substract(other) { return this.add(new Vector2(other).negate()); }
	/**
	 * Returns the negate of this vector (-this.x, -this.y)
	 * @returns {Vector2} a NEW vector2
	 */
	negate() { return new Vector2(-this.x, -this.y); }
	/**
	 * Multiplies the vector with the number
	 * @param {Number} number 
	 */
	multiply(number) { return new Vector2(this.x * number, this.y * number); }
	/**
	 * Divides the vector with the number
	 * @param {Number} number 
	 */
	divide(number) {return new Vector2(this.x / number, this.y / number);}

	/**
	 * Rounds the components of the vector
	 * @returns {Vector2} a NEW vector2
	 */
	round() {return new Vector2(Math.round(this.x), Math.round(this.y)); }

	/**
	 * Floors the components of the vector
	 * @returns {Vector2} a NEW vector2
	 */
	floor() {return new Vector2(Math.floor(this.x), Math.floor(this.y)); }

	/** The magnitude of this vector
	 * @returns {Number} magnitude
	 */
	get magnitude() { return Math.sqrt(this.sqrMagnitude);}
	/** The magnitude of this vector squared (Faster than magnitude, because doesn't use square root)
	 * @returns {Number} magnitude
	  */
	get sqrMagnitude() { return this.x * this.x + this.y * this.y; }
	/** Returns this vector with a magnitude of 1
	 * @returns {Vector2}
	  */
	get normalized() { const magnitude = this.magnitude; return (magnitude > 0) ? this.divide(magnitude) : Vector2.zero;}


	/**
	 * Calculates the dot product of two vectors: (a.x * b.x) + (a.y * b.y) 
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 * @returns {Number} dot product
	 */
	static dot(a, b) {return a.x * b.x + a.y * b.y;}
	/**
	 * Calculates the angle between two vectors
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 * @returns {Number} angle in radians
	 */
	static angle(a, b) {
		const m = a.magnitude * b.magnitude;
		return (m != 0) ? Math.acos(Vector2.dot(a,b) / m) : 0;
	}

	/** 
	 * Shorthand for new Vector(0,0)
	 * @returns {Vector2}  */
	static get zero()  { return new Vector2( 0, 0); }
	/** Shorthand for new Vector(1,1)
	 * @returns {Vector2}  */
	static get one()   { return new Vector2( 1, 1); }
	/** Shorthand for new Vector(1,0) 
	 * @returns {Vector2}  */
	static get right() { return new Vector2( 1, 0); }
	/** Shorthand for new Vector(-1,0) 
	 * @returns {Vector2}  */
	static get left()  { return new Vector2(-1, 0); }
	/** Shorthand for new Vector(0,1) 
	 * @returns {Vector2}  */
	static get up()    { return new Vector2( 0, 1); }
	/** Shorthand for new Vector(0,-1) 
	 * @returns {Vector2}  */
	static get down()  { return new Vector2( 0,-1); }

	/**
	 * Calculates a position between the two values moving no farther than the distance specified by maxDelta
	 * @param {Vector2} current The start position to move from
	 * @param {Vector2} target The target position to move towards
	 * @param {Vector2} maxDelta The maximum distance to move
	 * @param {Boolean} isSqrMagnitued If the delta should be squared (when true it's faster)
	 * @returns {Vector2} The new position
	 */
	static moveTowards(current, target, maxDelta, isSqrMagnitued) {
		const delta = target.substract(current);
		const distance = (isSqrMagnitued) ? delta.sqrMagnitude : delta.magnitude;
		if (maxDelta > distance || distance == 0)
			return target;
		return current.add(delta.divide(distance));
	}
	
	/**
	 * Returns a new vector made out of the minimum of both vector's components
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 */
	static min(a, b) {
		return new Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y));
	}
	
	/**
	 * Returns a new vector made out of the maximum of both vector's components
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 */
	static max(a, b) {
		return new Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
	}

	/**
	 * Checks whenever two vector are equal
	 * @param {Rect} other 
	 * @returns {Boolean}
	 */
	equals(other) {
		other = new Vector2(other);
		return other != null && other.x == this.x && other.y == this.y;
	}

}

/* -------------------------------------
  				  CANVAS
   ------------------------------------- */
const canvasConfig = {
	/** The query used for finding the canvas */
	canvasQuery: "#mainCanvas",
	/** The element that stores the UI elements */
	uiContainerQuery: "#UIContainer",
	/** Canvas size in pixels */
	size: {x: 640, y: 360},
	/** Canvas ratio */
	ratio: {x: 16, y: 9},
	/** How much does the canvas fill of the screen in percentage */
	fillPercentage: 1,
	/** Whenever each pixel should be forced to be a whole number or not 
	 * Mostly used for pixelart games */
	forceIntegerScaling: true,
	/** Upscaling used for the rendering */
	scale: {x: 1, y: 1},
	/** Rounds the position and size for rendering */
	pixelPerfectPosition: true,
	/** See: https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering */
	imageRendering: "pixelated"
};

class Resource {

    /**
     * @param {String} path The physical file path
     * @param {String} tag The element tag
     */
    constructor(path, tag) {
        /** @private */
        this._element = null;
        /** @public */
        this.path = path;
        /** @private */
		this._tag = tag;
    }

    /** 
     * Returns the HTML element
     * @public
	 * @type {HTMLElement}
	 */
    get element() {
        if (this._element == null) this.load();
        return this._element;
    }

    /** Unloads the element */
    unload() {this._element.remove();}

    /** 
     * Loads the element
     */
    load() { 
        this._element = document.createElement(this._tag);
        this._element.src = this.path;
        this._element.style.display = "none";
    }

}

class Sprite extends Resource {
        
    /**
     * @param {String} path Physical file path
     * @param {[Number, Number]} size [Width, Height] 
     * @param {[Number, Number]} offset [OffsetX, OffsetY] default: [0, 0]
     * @param {[Number, Number]} pivot [PivotX, PivotY] default: [0.5, 0.5]
     * @param {dictionary} labels {"LABELNAME" : {x: OffsetX, y: OffsetY}, ...}
     * Offset as tiles, NOT PIXELS
     */
    constructor(path, size, offset=[0,0], pivot=[0.5,0.5], labels={}) {
        super(path, "img");
		/** @public */
        this.path = path;
		/** 
		 * @public
		 * @type {Vector2}
		 */
        this.size = new Vector2(size);
		/** 
		 * @public
		 * @type {Vector2}
		 */
		this.offset = new Vector2(offset);
		/**
		 * @public
		 * @type {Vector2}
		 */
		this.pivot = new Vector2(pivot);
		/** 
		 * @public
		 * @type {SpriteLabel}
		 */
		this.labels = labels;
		/** @private */
        this._element = null;
    }

    /**
	 * @public
	 * Get a sprite from the sprite sheet
	 * @param {Number} x
	 * @param {Number} y 
	 * @returns {Rect}
	 */
    getSpriteRect(x = 0, y = 0) {
        return {
            x: (this.offset.x + this.size.x) * x,
            y: (this.offset.y + this.size.y) * y,
            w: this.size.x,
            h: this.size.y
        };
    }

    /**
	 * @public
	 * Get a sprite from the sprite sheet using the label
	 * @param {SpriteLabel} label
	 * @param {Number} offsetX Tile offset
	 * @param {Number} offsetY Tile offset
	 * @returns {Rect}
	 */
    getSpriteFromLabel(label, offsetX=0, offsetY=0) {
        const l = this.labels[label.toUpperCase()];
		return this.getSpriteRect(l.x+offsetX, l.y+offsetY);
    }

    /** @type {HTMLImageElement} */
    get element() {return super.element; }

    load() {
        super.load();
    }
}

/* jshint expr: true */

class Sound extends Resource {

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

const sprites = {
    grass: new Sprite("./media/temp/grass.png", [16,16], [0,0], [0.5, 0.5], {
                        "DRY": {x:0, y:0},
                        "NORMAL": {x:0, y:3},
                        "WET": {x:0, y:6}
					}),
	player: new Sprite("./media/temp/player.png", [8,8], [1,0]),
	water: new Sprite("./media/temp/water.png", [16,16]),
	flame: new Sprite("./media/temp/flame.png", [4,4]),
	playership: new Sprite("./media/spaceship_player.png", [48,48], [0,0], [0.5, 0.5], {
		"PURPLE": {x: 0, y: 0},
		"BLUE":   {x: 1, y: 0},
		"GREEN":  {x: 2, y: 0},
	}),
	stars: new Sprite("./media/stars.png", [8,8]),
	thruster: new Sprite("./media/thruster.png", [8, 24], [0,0], [0.5, 0], {
		"NORMAL": {x: 0, y: 0},
		"BACK":   {x: 1, y: 0},
		"FORWARD":{x: 2, y: 0},
		"WIDE":   {x: 3, y: 0},
		"THIN":   {x: 6, y: 0},
		"NORMAL2":{x: 9, y: 0},
	}),
	missile: new Sprite("./media/missiles.png", [5, 8], [0,0], [0.5, 0], {
		"PURPLE": {x: 0, y: 0},
		"BLUE":   {x: 1, y: 0},
		"GREEN":  {x: 2, y: 0},
	}),
	enemies: {
		basic: new Sprite("./media/enemies_basic.png", [24, 24], [0,0], [0.5, 0.5], {
			"BASIC": {x: 0, y: 0},
			"SHOOT": {x: 1, y: 0},
		}),
	},
	particles: new Sprite("./media/particles.png", [1,1], [0,0], [0,0], {
		"THRUSTER": {x: 4, y: 2},
		"EXPLOSION": {x: 0, y: 0},
		"MISSILE_PURPLE": {x: 0, y: 2},
		"MISSILE_BLUE": {x: 1, y: 2},
		"MISSILE_GREEN": {x: 2, y: 2},
	}),
};

const sounds = {
	MUSIC: {
		bgm: new Sound("./media/sounds/spacey.wav", true),
	},
	SOUND: {
		temp: { test: new Sound("./media/temp/sound.wav"), },
		shoot: new Sound("./media/sounds/shoot.wav"),
		wrong: new Sound("./media/sounds/wrong.wav"),
		explosions: {
			normal: new Sound("./media/sounds/explosion.wav"),
			big: new Sound("./media/sounds/explosion_big.wav"),
		}
	}
};

/** @typedef {Buttons} Button */
const Buttons = {
	A: new Button(), 
	B: new Button()
};
/** @typedef {Axes} Axis */
const Axes = {
	Horizontal: new Axis(),
	Vertical: new Axis()
};

function $(query) {return document.querySelector(query);}

/** @type HTMLCanvasElement */
const canvasElement = $(canvasConfig.canvasQuery);


window.addEventListener("resize", (e) => {
	setCanvasSize();
});

function setCanvasSize() {
	
	const size = {
		x: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		y: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	};
	const ratio = canvasConfig.ratio;
	const fillPer = canvasConfig.fillPercentage;
	const ratioValue = ratio.x / ratio.y;
	const canvasSize = canvasConfig.size;
	
	let newSize = {x:0, y:0};

	/** @media (min-aspect-ratio:16/9) */
	if ((size.x / size.y) > ratioValue) {
		newSize.x = (size.y * fillPer) * ratioValue;
		newSize.y = (size.y * fillPer);
	} else {
		newSize.x = (size.x * fillPer);
		newSize.y = (size.x * fillPer) / ratioValue;
	}
	{
		newSize.x = toMultiplier(newSize.x, canvasSize.x, 0.5);
		newSize.y = toMultiplier(newSize.y, canvasSize.y, 0.5);
	}
	//console.log(newSize);
	
	canvasElement.style.height = `${newSize.y}px`;
	canvasElement.style.width = `${newSize.x}px`;
}

/**
 * @param {Number} value The original value
 * @param {Number} to The value the original value will be a multiplier of
 * @param {Number} divider If it's too small then it'll start dividing with this value
 */
function toMultiplier(value, to, divider) {
	value = parseInt(value);
	if (value < to && divider != null)
		return toMultiplier(value / divider, to) * divider;
	return value - (value % to);
}

// ------------ MOUSE START ------------
const Mouse = (function() {
	const Mouse = {
		position: Vector2.zero,
		/** @type {[Number]} */
		pressed: [],
		/** @param {Number} key */
		isPressed: function(key) {
			for (const btn of this.pressed)
				if (btn == key)
					return true;
			return false;
		},
		wheel: 0
	};


	/** @type {HTMLCanvasElement} */
	const canvas = document.body.querySelector(canvasConfig.canvasQuery);

	window.addEventListener("mousemove", (e) => {
		const rect = canvas.getBoundingClientRect();
		const size = canvasConfig.size;
		const scale = {x: rect.width / size.x, y: rect.height / size.y };

		const newPosition = {x: (e.clientX - rect.x) / scale.x, y: (e.clientY - rect.y) / scale.y};
		if ( isOutsideOfCanvas(newPosition))
			return;
		Mouse.position = new Vector2(newPosition.x, newPosition.y);
	});

	window.addEventListener("mousedown", (e) => {
		Mouse.pressed.push(e.button);
	});
	window.addEventListener("mouseup", (e) => {
		Mouse.pressed.splice(Mouse.pressed.indexOf(e.button), 1);
	});
	window.addEventListener("mousewheel", (e) => {
		Mouse.wheel = e.deltaY;
	});

	/**
	 * @param {Vector2} position 
	 * @returns {Boolean}
	 */
	function isOutsideOfCanvas(position) {
		return position.x < 0 || position.y < 0	|| position.x > canvasConfig.size.x || position.y > canvasConfig.size.y;
	}

	return Mouse;
}());
// ------------ MOUSE END ------------
