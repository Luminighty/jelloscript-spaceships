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


/**
 * Gravity: The speed the axis will fall back to 0
 * Sensivity: The speed the axis will reach 1, -1
 * dead: The minimum value the axis needs in order to return anything other than 0
 * minimumChange: The minimum value difference needed for an axis in order to call the inputReceived event
 * radius: The axis radius for touch inputs above which the axis value will be capped 1 (for touch inputs)
 * { GAMEPAD: 0, KEYBOARD: 1, TOUCH: 2 }
 */
/** @typedef {Object} axisConfig */
const axisConfig = {
	0: {	// Gamepad
		dead: 0.15,
		minimumChange: 0.001,
	},
	1: {	// Keyboard
		gravity: 0.3,
		sensivity: 0.5,
		dead: 0.1,
		minimumChange: 0.001,
	},
	2: {	// Touch
		dead: 0.1,
		radius: 50,
		minimumChange: 0.001,
	}
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

/**
 * Calculates a position between the two values moving no farther than the distance specified by maxDelta
 * @param {Number, Vector2} current The start position to move from
 * @param {Number, Vector2} target The target position to move towards
 * @param {Number, Vector2} maxDelta The maximum distance to move
 * @returns {Number, Vector2} The new position
 */
function moveTowards(current, target, maxDelta) {
	if (typeof current === "number")
		return moveTowardsInt(current, target, maxDelta);
	if (current instanceof Vector2)
		return Vector2.moveTowards(current, target, maxDelta);
	throw new TypeError(`Unsupported parameter types! (${typeof current}, ${typeof target})`);
}


function moveTowardsInt(value, to, stepSize) {
	let dif = to - value;
	const sign = Math.sign(dif);
	if (dif * sign > stepSize)
		dif = stepSize * sign;
	return value + dif;
}

/**
 * Generates a unique Id
 */
const generateId = (function () {
	let id = Date.now();
	return function() {
		return `${id++}`;
	};
}());

/**
 * A collection of inputs based on the different kinds of input methods. 
 * Every player will have one instance of this class
 * @abstract
 * @public
 * @class
 */
class Controller {

	/**
	 * 
	 * @param {Object.<String, (String|Number)>} buttons 
	 * @param {Object.<String, AxisKeys>} axes 
	 */
	constructor(buttons, axes, isLocal = true) {
		/** @private @readonly @type {String} */
		this._id = generateId();
		/** 
		 * Used to map the button key names to the physical keys
		 * @type {Object.<String, (String|Number)>}
		 * @example
		 * 	this.buttonKeys = {'A': "LeftArrow", 'B': "X" }
		 *  */
		this.buttonKeys = buttons;
		/** 
		 * Used to map the axis names to the physical keys/axises
		 * @type {Object.<String, (String|Number)>}
		 * @example
		 * this.axisKeys = {'Horizontal': {positive: "RightArrow", negative: "LeftArrow"}}
		 *  */
		this.axisKeys = axes;
		this.enabled = true;
		/** @private */
		this._isLocal = isLocal;
		/** @private */
		this.eventHandler = new EventHandler();
		this.setListeners();


		/** @type {Buttons} buttons */
		this.buttons = {};
		for (const key in buttons) {
			if (buttons.hasOwnProperty(key)) {
				const btn = new Button();
				this.buttons[key] = btn;
				btn.onPressed(() => {
					this.callInputReceived(key, 1, true);
				});
				btn.onReleased(() => {
					this.callInputReceived(key, -1, true);
				});
			}
		}
		/** @type {Axes} axes */
		this.axes = {};
		for (const key in axes) {
			if (axes.hasOwnProperty(key)) {
				const axis = new Axis();				
				axis.dead = axisConfig[this.type].dead;
				axis.onChanged((value) => {
					this.callInputReceived(key, value, false);
				});
				this.axes[key] = axis;
			}
		}
		controllers[this.id] = this;


		newControllerHandler.call("default", this.input, this.id, this.type, this.isLocal);

	}

	/** 
	 * True if the controller is using local controls. Otherwise it's being controlled over the network
	 * @type {Boolean}
	 */
	get isLocal() { return this._isLocal; }

	/**
	 * Updates the state of inputs by calling their corresponding update method
	 */
	update() {
		for (const key in this.buttons) {
			if (this.buttons.hasOwnProperty(key)) {
				const button = this.buttons[key];
				const buttonKey = this.buttonKeys[key];
				this.updateButton(button, buttonKey);
			}
		}
		for (const key in this.axes) {
			if (this.axes.hasOwnProperty(key)) {
				const axis = this.axes[key];
				const axisKey = this.axisKeys[key];
				this.updateAxis(axis, axisKey);
			}
		}
	}

	/**
	 * Updates the state of the button
	 * @param {Button} button
	 * @param {String|Number} key
	 */
	updateButton(button, key) {
		if (button.state == 1 || button.state == -1)
			button.state++;
	}

	/** 
	 * Updates the state of the axis
	 * @param {Axis} axis 
	 * @param {String|Number} key */
	updateAxis(axis, key) {
		if (axis.state * axis.toValue < 0)
			axis.state = 0;
		const conf = axisConfig[this.type];
		let multiplier = (axis.toValue == 0) ? conf.gravity : conf.sensivity;
		const newState = moveTowards(axis.state, axis.toValue, Math.abs(axis.state - axis.toValue) * multiplier);
		if (Math.abs(newState - axis.state) > axisConfig[this.type].minimumChange) {
			axis.state = newState;
			if (this.isLocal)
				axis.callListener(Axis.listenerTypes.Changed, axis.state);
		}
	}

	/** 
	 * The unique identifier for the controller
	 * @type {String} */
	get id() { return this._id; }

	/** 
	 * 
	 * @type {Number} */
	get type() {}

	/**
	 * Updates the physical button key assigned to the button
	 * @param {String} buttonKey 
	 * @param {String|Number} key 
	 */
	setButtonKey(buttonKey, key) { this.buttonKeys[buttonKey] = key; }

	/**
	 * Updates the physical button assigned to the axis
	 * @param {String} buttonKey 
	 * @param {Number} key 
	 */
	setAxisKey(axisKey, key) { this.axisKeys[axisKey] = key; }

	/** 
	 * Sets the DOM listeners for the Controller
	 * @protected
	 */
	setListeners() {}

	/** 
	 * @type import("./InputManager").Inputs 
	 * Additionally returns the controller itself as Controller, however it is not advised to use it
	*/
	get input() {
		return {
			Buttons: this.buttons,
			Axes: this.axes,
			Controller: this,
		};
	}

	/** 
	 * Returns a button from a physical key
	 * or null if not found
	 * @param {String|Number} key
	 * @returns {Button}
	 */
	getButton(key) {
		for (const buttonName in this.buttonKeys) {
			if (this.buttonKeys.hasOwnProperty(buttonName)) {
				const buttonKey = this.buttonKeys[buttonName];
				if (buttonKey == key)
					return this.buttons[buttonName];
			}
		}
		return null;
	}

	/** 
	 * Returns an axis from a physical key
	 * or null if not found
	 * @param {String|Number} key
	 * @returns {Axis}
	 */
	getAxis(key) {
		for (const axisName in this.axisKeys) {
			if (this.axisKeys.hasOwnProperty(axisName)) {
				const axisKey = this.axisKeys[axisName];
				if (axisKey == key)
					return this.axes[axisName];
			}
		}
		return null;
	}

	/** Returns the current state of the controller */
	get states() {
		/** @type {Object.<string, number>} */
		const axes = {};
		/** @type {Object.<string, number>} */
		const buttons = {};
		for (const key in this.axes) {
			if (this.axes.hasOwnProperty(key)) {
				/** @type {Axis} */
				const axis = this.axes[key];
				axes[key] = axis.state;
			}
		}
		for (const key in this.buttons) {
			if (this.buttons.hasOwnProperty(key)) {
				/** @type {Button} */
				const btn = this.buttons[key];
				buttons[key] = btn.state;
			}
		}

		return {
			axes: axes,
			buttons: buttons
		};
	}

	/**
	 * @callback ControllerStateCallback
	 * @param {String} key The key for identifying the input
	 * @param {Number} state The new state value for the input
	 * @param {Boolean} isButton The type of the input (True if it's a button, False if it's an axis)
	 */

	/** 
	 * Adds an event listener that's called whenever the controller receives input
	 * @param {ControllerStateCallback} callback 
	 */
	onInputReceived(callback) {
		this.eventHandler.on("input", callback);
	}

	/** 
	 * Calls the onInputReceived listeners
	 * @protected
	 * @param {String} key
	 * @param {Number} state
	 * @param {Boolean} isButton
	 */
	callInputReceived(key, state, isButton) {
		this.eventHandler.call("input", key, state, isButton);
	}
}

/** @type {Object.<string, Controller>} Controllers */
const controllers = {};

/**
 * Loops through every controller and calls the callback if the filter returns true
 * @param {controllerCallback} callback 
 * @param {controllerFilterCallback} filter If null then calls the callback for every controller
 */
function foreachController(callback, filter = null) {
	for (const key in controllers) {
		if (controllers.hasOwnProperty(key)) {
			const controller = controllers[key];
			if (filter && filter(controller))
				continue;
			callback(controller.input, controller.id, controller.type, controller.isLocal);
		}
	}
}


/**
 * The method called for filtering controllers
 * 
 * @callback controllerFilterCallback
 * @param {Controller} input
 * @returns {Boolean} Returns TRUE if the controller should NOT be used
 */


/**
 * The method called when a new controller was attached
 * 
 * @callback controllerCallback
 * @param {import("./InputManager").Inputs} input
 * @param {String} id controller id
 * @param {Number} type controller type (gamepad | keyboard | Touch)
 * @param {Boolean} isLocal Whenever the controller is a local or a remote controller
 */

 /**
  * Stores the listeners attached for the controller events
  */
const newControllerHandler = new EventHandler();

/**
 * Adds a listener that is called whenever a new Controller was attached
 * @param {controllerCallback} listener 
 */
function OnNewControllerListener(listener) {
	newControllerHandler.on("default", listener);
}

/** Calls the Controller Getter and returns the results */
function GetControllerState(id) {
	const contr = controllers[id];
	if (contr && contr.stateGetter)
		return contr.stateGetter();
	return {};
}

/** Calls the Controller Setter */
function SetControllerState(id, data) {
	const contr = controllers[id];
	if (contr && contr.stateSetter)
		contr.stateSetter(data);
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

/**
 * @callback LobbyCallback
 * @param {Lobby[]} lobbies
 */


/**
 * @typedef {Object} Lobby
 * @property {Number} id The ID for the lobby
 * @property {String} lobbyName The display name for a lobby.
 * @property {Number} connectionLimit The maximum number users can connect to a lobby
 * @property {any} data Optional data (description, lobby type, ect.)
 */


/** Converts the inputs to only have their states */
let inputToValues = function(inputs) {};
/** Sends a new controller to the server. Only if it's a local controller */
let addController = function(inputs, id, type, isLocal) {};


if (typeof window.io !== 'undefined') {

	const socket = window.io(/*networkConfig.host*/);

	socket.on("connect", () => {
		console.log("connected");
	});

	/**
	 * A remote player representation for a controller
	 */
	class NetworkController extends Controller {
		constructor(buttons, axes, type, id, data) {
			super(buttons, axes, false);
			this.networkId = id;
			NetworkController.networkToIdMap[this.networkId] = this.id;
			/** @type {Number} */
			this._type = type;
			for (const key in buttons) {
				if (buttons.hasOwnProperty(key)) {
					const state = buttons[key];
					this.buttons[key].state = state;
				}
			}

			for (const key in axes) {
				if (axes.hasOwnProperty(key)) {
					const state = axes[key];
					this.axes[key].state = state;
					this.axes[key].dead = axisConfig[this.type].dead;
				}
			}
		}

		get type() {return (this._type) ? this._type : 0; }

		setListeners() {
			socket.on("update controller", (id, key, value, isButton) => {
				if(id != this.networkId)
					return;
				
				const input = (isButton) ? this.buttons : this.axes;
				if (isButton && (input[key].state < 1 || value != 1)) {
					const listenerType = (value == 1) ? Button.listenerTypes.Pressed : Button.listenerTypes.Released;
					input[key].callListener(listenerType);
				}
				input[key].state = value;
			});
		}

		/** The axis gets updated from the listeners */
		updateAxis(axis, key) {}

	}

	NetworkController.networkToIdMap = {};


	inputToValues = function(inputs) {
		/** @type {Object.<string, number>} */
		const axes = {};
		/** @type {Object.<string, number>} */
		const buttons = {};
		for (const key in inputs.Axes) {
			if (inputs.Axes.hasOwnProperty(key)) {
				/** @type {Axis} */
				const axis = inputs.Axes[key];
				axes[key] = axis.state;
			}
		}
		for (const key in inputs.Buttons) {
			if (inputs.Buttons.hasOwnProperty(key)) {
				/** @type {Button} */
				const btn = inputs.Buttons[key];
				buttons[key] = btn.state;
			}
		}
		return {axes, buttons};
	};

	addController = function(inputs, id, type, isLocal) {
		if (!isLocal)
			return;
		
		const {axes, buttons} = inputToValues(inputs);
		const data = GetControllerState(id);
		socket.emit("new controller", {axes, buttons, id, type, data});
		inputs.Controller.onInputReceived((key, state, isButton) => {
			socket.emit("update controller", id, key, state, isButton);
		});
	};

	// On new controller we add it to the lobby
	OnNewControllerListener(addController);

	socket.on("get state", (sendState) => {
		sendState(getState());
	});

	socket.on("set state", (state) => {
	});



	let getState = function () { return {}; };


	socket.on("update lobbies", (lobbies) => {
		events.call("lobby refresh", lobbies);
	});

	/** @deprecated Don't really have to call this */
	socket.on("new connection", () => {
		console.log("New connection");
	});

	socket.on("new controller", (buttons, axes, type, id, data) => {
		new NetworkController(buttons, axes, type, id, data);
		SetControllerState(NetworkController.networkToIdMap[id], data);
	});

	socket.on("get controllers", () => {
		foreachController(addController);
	});


	const events = new EventHandler();

	socket.on("get controller state", (id, response) => {
		console.log("get controller state", id);
		
		const data = GetControllerState(id);
		response(data);
	});

	socket.on("messaging", (type, args) => {
		events.call(`messaging ${type}`, ...args);
	});
}
