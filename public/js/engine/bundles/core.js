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

/**
 * @enum {number}
 * @property {GAMEPAD} 0
 * @property {KEYBOARD} 1
 * @property {TOUCH} 2
 */
const InputMethods = { 
	/** @constant 0 */
	GAMEPAD: 0,
	/** @constant 1 */
	KEYBOARD: 1, 
	/** @constant 2 */
	TOUCH: 2 
};

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



/**
 * A box represented with 4 numbers. 
 *    x and y for the top left coordinates
 *    w and h for width and height
 * @public
 * @class
 */
class Rect {
	/**
	 * Initializes a Rect
	 * @param {Number} x Top left X position
	 * @param {Number} y Top left Y position
	 * @param {Number} w Width
	 * @param {Number} h Height
	 */
	constructor(x,y,w,h) {
		if (y == null) {
			if (Array.isArray(x))
				x = {x:x[0], y:x[1], w:x[2], h:x[3]};
			y = x.y;
			w = x.w;
			h = x.h;
			x = x.x;
		}
		this.position = new Vector2(x,y);
		this.size = new Vector2(w,h);
	}

	/**
	 * The position of the rect {x, y}
	 * @type {Vector2}
	 */
	get position() { return new Vector2(this.x, this.y); }
	/**
	 * Sets the position for the rect
	 * @param {Vector2} position The new position
	 */
	set position(position) { position = new Vector2(position); this.x = position.x; this.y = position.y; }
	/**
	 * The size of the rect {w, h}
	 * @type {Vector2}
	 */
	get size() { return new Vector2(this.w, this.h); }
	/**
	 * Sets the size for the rect
	 * @param {Vector2} size The new size
	 */
	set size(size) { size = new Vector2(size); this.w = size.x; this.h = size.y; }

	/** The smaller value on the X axis
	 * @type {Number}
	 */
	get minX() {return this.x;}
	/** The smaller value on the Y axis
	 * @type {Number}
	 */
	get minY() {return this.y;}
	/** The larger value on the X axis
	 * @type {Number}
	 */
	get maxX() {return this.x + this.w;}
	/** The larger value on the Y axis
	 * @type {Number}
	 */
	get maxY() {return this.y + this.h;}

	/** Top Left position in Vector2
	 * @type {Vector2}
	 */
	get topLeft() {return new Vector2(this.minX, this.minY);}
	/** Top Right position in Vector2
	 * @type {Vector2}
	 */
	get topRight() {return new Vector2(this.maxX, this.minY);}
	/** Bottom Left position in Vector2
	 * @type {Vector2}
	 */
	get bottomLeft() {return new Vector2(this.minX, this.maxY);}
	/** Bottom Right position in Vector2
	 * @type {Vector2}
	 */
	get bottomRight() {return new Vector2(this.maxX, this.maxY);}
	/** The center of the rect in Vector2
	 * @type {Vector2}
	 */
	get center() { return new Vector2(this.minX + this.w/2, this.minY + this.h/2); }

	/**
	 * Rounds the rect's components 
	 * @returns {Rect} a NEW rect */
	round() {return new Rect(Math.round(this.x), Math.round(this.y), Math.round(this.w), Math.round(this.h));}

	/**
	 * floors the rect's components 
	 * @returns {Rect} a NEW rect */
	floor() {return new Rect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.w), Math.floor(this.h));}

	/**
	 * Multiplies the rect with the number using type
	 * @param {Number} number Number to multiply with
	 * @param {Rect.MULTIPLY_TYPE} type Multiplication type
	 * @returns {Rect} a NEW rect
	 */
	multiply(number, type) {
		let p = this.position;
		let o = this.size;
		if (type !== Rect.MULTIPLY_TYPE.SIZE)
			p = p.multiply(number);
		if (type !== Rect.MULTIPLY_TYPE.POSITION)
			o = o.multiply(number);
		return new Rect(p.x, p.y, s.x, s.y);
	}

	/**
	 * Returns true if the rect contains the 'other' rect
	 * A rect contains the other one if the other one does not have any points outside the rect
	 * @param {Rect} other
	 * @returns {Boolean}
	 */
	contains(other) {
		const offset = {x:other.x-this.x, y:other.y-this.y};
		if(offset.x < 0 || offset.y < 0)
			return false;
		return other.w + offset.x <= this.w && other.h + offset.y <= this.h;
	}

	/**
	 * Returns true if the rect intersects the 'other' rect
	 * Two rects intersects eachother if they have shared points
	 * @param {Rect} other 
	 * @returns {Boolean}
	 */
	intersects(other) {
		return !(this.minX > other.maxX ||
				 this.minY > other.maxY ||
				 other.minX > this.maxX ||
				 other.minY > this.maxY);
	}
	/**
	 * Creates a rect with 2 position
	 * @constructor
	 * @param {Number} x1 
	 * @param {Number} y1 
	 * @param {Number} x2 
	 * @param {Number} y2 
	 * @returns {Rect}
	 */
	static initFromPositions(x1, y1, x2, y2) {
		const x = Math.min(x1, x2);
		const y = Math.min(y1, y2);
		const w = Math.abs(x1 - x2);
		const h = Math.abs(y1 - y2);
		return new Rect(x,y,w,h);
	}
	/** Shorthand for new Rect(0,0,0,0)
	 * @returns {Rect}
	 */
	static get zero() {return new Rect(0,0,0,0);}

	/**
	 * Checks whenever two rects are equal
	 * @param {Rect} other 
	 * @returns {Boolean}
	 */
	equals(other) {
		other = new Rect(other);
		return other != null && other.x == this.x && other.y == this.y && other.w == this.w && other.h == this.h;
	}
}
/**
 * @static
 * @readonly
 * @enum {number}
 * @
 */
Rect.MULTIPLY_TYPE = {
	/** Multiply BOTH the position and the size */
	BOTH: 0, 
	/** Multiply ONLY the position */
	POSITION: 1, 
	/** Multiply ONLY the size */
	SIZE: 2
};

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


 /** @returns If the browser is a mobile or tablet */
function mobileAndTabletCheck() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}


/**
 * Same as setTimeout, but uses ingame time
 * @param {CallableFunction} callback 
 * @param {Number} delay Tick count before callback
 * @returns {Number} Id used for clearGameTimeout
 */
function setGameTimeout(callback, delay) {
	const id = timers.id++;
	timers.timeouts[id] = {
		callback, delay, current_delay: delay,
	};
	return id;
}
/**
 * Stops the timeout from triggering
 * @param {Number} timeout The id returned from setGameTimeout
 */
function clearGameTimeout(timeout) {
	delete timers.timeouts[timeout];
}

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


 /** @type {[import("./engine/InputManager").KeyboardControls]} */
const DefaultKeyboardControls = [
	{
		Buttons: {
			A: "KeyX",
			//B: "KeyC"
		},
		Axes: {
			Horizontal: AxisKeys("ArrowRight", "ArrowLeft"),
			Vertical:   AxisKeys("ArrowDown"   , "ArrowUp")
		}
	},/*
	{
		Buttons: {
			A: "KeyF",
			B: "KeyG"
		},
		Axes: {
			Horizontal: AxisKeys("KeyD", "KeyA"),
			Vertical:   AxisKeys("KeyS"   , "KeyW")
		}
	}*/
];

/** @typedef {GamepadControls} GamepadControls */
const DefaultGamepadControls = {
	Buttons: {
		A: 0,
		B: 1
	},
	Axes: {
		Horizontal: 0,
		Vertical: 1
	}
};


/**
 * @typedef {Object} TouchInputLayout
 * @property {("Axis"|"Button")} type The touch input's type
 * @property {(string[]|string)} key The corresponding button or axes
 * @property {string} image The path to the button's or axis' image
 * @property {string} css The css the element will have
 */
const TouchInputs = [
	{
		type: "Axis",
		key: ["Horizontal", "Vertical"],
		image: "./media/input/axis.png",
		css: `
			left: 100px;
			bottom: 50px;
			position: absolute;
			background-color: #ffffff3d;
			border-radius: 9999px;
			z-index: 100;`
	},
	{
		type: "Button",
		key: "A",
		image: "./media/input/btn_a.png",
		css: `
			right: 50px;
			bottom: 50px;
			position: absolute;
			background-color: #ffffff3d;
			border-radius: 9999px;
			z-index: 100;`
	},/*
	{
		type: "Button",
		key: "B",
		image: "./media/input/btn_b.png",
		css: `
			right: 50px;
			bottom: 50px;
			position: absolute;
			background-color: #ffffff3d;
			border-radius: 9999px;
			z-index: 100;`
	}*/
];


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
 * @typedef {Object} AxisKeys
 * @property {(String|Number)} positive The key for the positive value
 * @property {(String|Number)} negative The key for the negative value
 */

 /** 
  * Shorthand for {positive: "positive", negative: "negative"}
  * @returns {AxisKeys} @constructor */
function AxisKeys(positive, negative) {
	return {positive: positive, negative: negative};
}

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

/**
 * The keyboard representation for a Controller
 */
class KeyboardController extends Controller {

	/**
	 * @param {Object.<String, (String|Number)} buttons 
	 * @param {Object.<String, AxisKeys} axes 
	 * 
	 * @example
	 *  const Buttons = { A: new Button(), B: new Button() };
	 *  const Axes = { Horizontal: new Axis()};
	 * 
	 * 	new KeyboardController(
	 * 		{ A: "X", B: "C"},
	 * 		{ Horizontal: AxisKeys("LeftArrow", "RightArrow"));
	 */
	constructor(buttons, axes) {
		super(buttons, axes);
		KeyboardPlayerIds.push(this._id);
	}

	/** 
	 * Returns InputMethods.KEYBOARD
	 * @type {Number}
	 */
	get type() { return InputMethods.KEYBOARD; }

	/**
	 * Updates the physical button assigned to the axis
	 * @param {String} axisKey The key used for the Inputs
	 * @param {String} positiveKey The Keycode for the positive value
	 */
	setAxisPositive(axisKey, positiveKey) { this.axisKeys[axisKey].positive = positiveKey; }

	/**
	 * Updates the physical button assigned to the axis
	 * @param {String} axisKey The key used for the Inputs
	 * @param {String} negativeKey The Keycode for the negative value
	 */
	setAxisNegative(axisKey, negativeKey) { this.axisKeys[axisKey].negative = negativeKey; }

	/**
	 * Updates the physical button assigned to the axis
	 * @param {String} axisKey The key used for the Inputs
	 * @param {String} positiveKey The Keycode for the positive value
	 * @param {String} negativeKey The Keycode for the negative value
	 */
	setAxisKey(axisKey, positiveKey, negativeKey) {
		super.setAxisKey(axisKey, {
			positive: positiveKey,
			negative: negativeKey
		});
	}

	/** 
	 * Returns an axis from a physical key with the value (-1, +1)
	 * or null if not found
	 * @returns {?{axis: Axis, value: Number}}
	 */
	getAxis(key) {
		for (const axisName in this.axisKeys) {
			if (this.axisKeys.hasOwnProperty(axisName)) {
				const axisKey = this.axisKeys[axisName];
				if (axisKey.positive == key)
					return {axis: this.axes[axisName], value: 1};
				if (axisKey.negative == key)
					return {axis: this.axes[axisName], value: -1};
			}
		}
		return null;
	}


	setListeners() {
		/**
		 * Updates the states based on the keydown(+1) and keyup(-1) events
		 * @param {KeyboardController} controller 
		 * @param {String} keycode 
		 * @param {Number} value 
		 */
		const updateKeyFromKeyboard = function(controller, keycode, value) {
			const btn = controller.getButton(keycode);

			/** Only set the state if we're releasing the button, or if we've just pressed it */
			if (btn != null && (value != 1 || btn.state < 1)) {
				btn.state = value;

				const listenerType = (value == 1) ? Button.listenerTypes.Pressed : Button.listenerTypes.Released;
				btn.callListener(listenerType);
				lastUsed(controller);
			}

			const axisValue = controller.getAxis(keycode);
			if (axisValue != null) {
				const axis = axisValue.axis;
				const sign = axisValue.value;
				/*
					Change the toValue if it recieved a new input
					OR
					on releasing the key AND the current input is the same as the one we're releasing
				*/
				if (value > 0 || axis.toValue * sign > 0)
					axis.toValue = (value > 0) ? sign : 0;
				
				lastUsed(controller);
			}
		};

		window.addEventListener("keydown", (e) => {
			updateKeyFromKeyboard(this, e.code, 1);
		});

		window.addEventListener("keyup", (e) => {
			updateKeyFromKeyboard(this, e.code, -1);
		});
	}
}

/**
 * The gamepad representation for a Controller
 */
class GamepadController extends Controller {

	/**
	 * @param {Number} gamepadIndex gamepad.index
	 * @param {Object.<String, Number} buttons 
	 * @param {Object.<String, Number} axes 
	 * 
	 * @example
	 *  const Buttons = { A: new Button(), B: new Button() };
	 *  const Axes = { Horizontal: new Axis()};
	 * 
	 * 	new GamepadController(event.gamepad.index,
	 * 		{ A: 0, B: 1},
	 * 		{ Horizontal: 0});
	 */
	constructor(gamepadIndex, buttons, axes) {
		super(buttons, axes);
		/** @type {Number} */
		this.index = gamepadIndex;
		/** @type {Gamepad} */
		this.gamepad = navigator.getGamepads()[gamepadIndex];
	}

	/**
	 * Returns InputMethods.GAMEPAD
	 * @type {Number}
	 */
	get type() { return InputMethods.GAMEPAD; }

	update() {
		this.gamepad = navigator.getGamepads()[this.index];
		super.update();
	}

	/** @param {Axis} axis */
	/** @param {Number} key */
	updateAxis(axis, key) {
		const newState = this.gamepad.axes[key];
		if (Math.abs(newState - axis.state) > axisConfig[this.type].minimumChange) {
			axis.state = this.gamepad.axes[key];
			axis.callListener(Axis.listenerTypes.Changed, axis.state);
		}
		if (Math.abs(axis.state) > 0.1)
			lastUsed(this);
	}


	/** 
	 * @param {Button} button
	 * @param {Number} key 
	 * */
	updateButton(button, key) {
		super.updateButton(button, key);
		if (this.gamepad.buttons[key].pressed && button.state <= 0) {
			button.state = 1;
			button.callListener(Button.listenerTypes.Pressed);
			lastUsed(this);
		}
		if (!this.gamepad.buttons[key].pressed && button.state > 0) {
			button.state = -1;
			button.callListener(Button.listenerTypes.Released);
			lastUsed(this);
		}
	}

}


/**
 * The touch representation for a Controller (used for phones and tablets)
 */
class TouchController extends Controller {

	/**
	 * 
	 * @param {import("../Input").TouchInputLayout} layout 
	 * @param {Object.<String, Number} buttons 
	 * @param {Object.<String, Number} axes 
	 * 
	 * @example
	 * 	const layout = [...];
	 *  const Buttons = { A: new Button(), B: new Button() };
	 *  const Axes = { Horizontal: new Axis()};
	 * 
	 * 	new TouchController(index, Buttons, Axes);
	 */
	constructor(layout, buttons, axes) {
		super(buttons, axes);
		this.layout = layout;
		this.setTouchListeners();
	}

	setTouchListeners() {

		/** @param {HTMLImageElement} element 
		 * @param {TouchController} controller
		 * */
		const addAxisTouch = function(controller, element, keys) {
			const startPosition = new Vector2(0,0);
			/** @type {Axis} */
			const horizontal = controller.axes[keys[0]];
			/** @type {Axis} */
			const vertical = controller.axes[keys[1]];

			element.addEventListener("touchstart", (e) => {
				e.preventDefault();
				startPosition.x = e.targetTouches[0].clientX;
				startPosition.y = e.targetTouches[0].clientY;
				lastUsed(controller);
			});
			element.addEventListener("touchmove", (e) => {
				e.preventDefault();
				const touch = e.targetTouches[0];
				let delta = new Vector2(touch.clientX, touch.clientY).substract(startPosition).divide(axisConfig[InputMethods.TOUCH].radius);
				if (delta.magnitude > 1)
					delta = delta.normalized;
				horizontal.state = delta.x;
				vertical.state = delta.y;
				
				horizontal.callListener(Axis.listenerTypes.Changed, horizontal.state);
				vertical.callListener(Axis.listenerTypes.Changed, vertical.state);
			});
			
			element.addEventListener("touchend", (e) => {
				e.preventDefault();
				horizontal.state = 0;
				vertical.state = 0;
				
				horizontal.callListener(Axis.listenerTypes.Changed, horizontal.state);
				vertical.callListener(Axis.listenerTypes.Changed, vertical.state);
			});
		};

		/** @param {HTMLImageElement} element 
		 * @param {TouchController} controller
		*/
		const addButtonTouch = function(controller, element, key) {
			element.addEventListener("touchstart", (e) => {
				e.preventDefault();
				/** @type {Button} */
				const btn = controller.buttons[key];
				btn.state = 1;
				btn.callListener(Button.listenerTypes.Pressed);
				lastUsed(controller);
			});
			element.addEventListener("touchend", (e) => {
				e.preventDefault();
				/** @type {Button} */
				const btn = controller.buttons[key];
				btn.state = -1;
				btn.callListener(Button.listenerTypes.Released);
			});
		};



		const listeners = {"axis": addAxisTouch, "button": addButtonTouch};
		for (const touchInput of this.layout) {
			/** @type {HTMLImageElement} */
			const element = document.createElement("img");
			element.src = touchInput.image;
			element.style.cssText = touchInput.css;
			document.body.appendChild(element);
			const addListener = listeners[touchInput.type.toLowerCase()];
			addListener(this, element, touchInput.key);
		}
	}

	updateAxis(axis) {}

	/**
	 * Returns InputMethods.TOUCH
	 * @type {Number}
	 */
	get type() { return InputMethods.TOUCH; }
}

/** @type {Object.<string, Controller>} Controllers */
const controllers = {};

/**
 * Stores the keyboard controller IDs
 * @type {String[]}
 */
const KeyboardPlayerIds = [];


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
 * Calls Controller.update() on every attached controller
 */
function updateControllers() {
	for (const key in controllers) {
		if (controllers.hasOwnProperty(key)) {
			const element = controllers[key];
			element.update();
		}
	}
}

/**
 * Adds a mobile touch layout for the game
 * @param {import("../Input").TouchInputLayout} layoutConfig
 * @param {Buttons} buttons
 * @param {Axes} axes
 * @param {Boolean} onlyPhone Whenever it should be added only when played on the phone (true by default) 
 */
function addTouchInput(layoutConfig, buttons, axes, onlyPhone = true) {
	if (!onlyPhone || mobileAndTabletCheck())
		new TouchController(layoutConfig, buttons, axes);
}

/**
 * Initializes every keyboard controller and sets the gamepad connected listener
 * Should be called after setting up the game's new controller listeners
 */
function initControllers(touchInputs, buttons, axes, onlyPhone) {
	if (!mobileAndTabletCheck()) {
		for (const keyboard of DefaultKeyboardControls) {
			new KeyboardController(keyboard.Buttons, keyboard.Axes);
		}
	} else {
		addTouchInput(touchInputs, buttons, axes, onlyPhone);
	}

	window.addEventListener("gamepadconnected", (e) => {
		/** @type {Gamepad} */
		const gamepad = e.gamepad;
		lastUsed(new GamepadController(
			gamepad.index, 
			DefaultGamepadControls.Buttons, 
			DefaultGamepadControls.Axes
		));
	});
}

/**
 * The last used controller. Stored for single player games, where multiple input methods are used as the same controller
 * @type {Controller}
 */
let lastUsedController = null;
/** 
 * Sets the controller passed as the parameter to be the last one used 
 * @param {Controller} controller
 */
function lastUsed(controller) {
	if (lastUsedController !== null && lastUsedController._id === controller._id)
		return;

	lastUsedController = controller;
	for (const key in controller.buttons) {
		if (controller.buttons.hasOwnProperty(key)) {
			const element = controller.buttons[key];
			Buttons[key] = element;
		}
	}

	for (const key in controller.axes) {
		if (controller.axes.hasOwnProperty(key)) {
			const element = controller.axes[key];
			Axes[key] = element; 
		}
	}
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

/* jshint expr: true */
//import Collider from "./Collider";

let currentId = 0;

class Component {

    constructor(gameObject, enabled = true) {
		/** @private */
		this._id = currentId++;
		/** 
		 * Gameobject to which the component is attached to
		 * @type {GameObject}
		 */
		this.gameObject = gameObject;
		/** @private */
		this._enabled = enabled;
		this.start();
	}

	/** @type {Boolean} */
	get enabled() {return this._enabled; }
	set enabled(enabled) {
		if(this._enabled != enabled)
			(enabled) ? this.onEnabled() : this.onDisabled();
		this._enabled = enabled;

	}

	/**
	 * unique id for every component instance 
	 * @type {Number} */
	get id() {return this._id;}
	/**
	 * @returns {Boolean} True if the component and the other component are the same. By default when their ID is the same
	 * @param {Component} other 
	 */
	equals(other) { return other != null && other.id == this.id; }

	/**
	 * Called when the component's state is set to enabled
	 * @public */
	onEnabled() {}
	/** 
	 * Called when the component's state is set to disabled
	 * @public
	 *  */
	onDisabled() {}
	/** 
	 * Called before the component gets destroyed
	 * @public
	 *  */
	onDestroy() {}
	/** 
	 * Called after the constructor
	 * @public 
	 * */
	start() {}
	/** 
	 * Called every frame
	 * @public 
	 * */
	update(tick) {}

	/**
	 * Called when the gameobject starts colliding with another collider
	 * @param {import("./Collider").Collider} other 
	 */
	onCollisionEnter(other) {}
	/**
	 * Called every frame when the gameobject collides with another collider
	 * @param {import("./Collider").Collider} other 
	 */
	onCollisionStay(other) {}
	/**
	 * Called when the gameobject stops colliding with another collider
	 * @param {import("./Collider").Collider} other 
	 */
	onCollisionExit(other) {}

	/**
	 * Called when the attached gameobject enters a trigger
	 * @param {import("./Collider").Collider} other 
	 */
	onTriggerEnter(other) {}
	/**
	 * Called every frame when the attached gameobject is in a trigger
	 * @param {import("./Collider").Collider} other 
	 */
	onTriggerStay(other) {}
	/**
	 * Called when the attached gameobject leaves a trigger
	 * @param {import("./Collider")} other 
	 */
	onTriggerExit(other) {}


	/**
	 * Destroys the gameObject
	 * @param {GameObject} object 
	 * @param {Number} delay Delay before deleting the gameObject
	 */
	static destroy(object, delay=0) {
		const gameObject = object.gameObject;
		const des = function() {
			if (toDestoryObjects[gameObject.id])
				clearGameTimeout(toDestoryObjects[gameObject.id]);
			delete toDestoryObjects[gameObject.id];
			const layer = gameObjects[gameObject.updateLayer];
			layer.splice(layer.indexOf(gameObject), 1);
			
			for (const component of gameObject.components)
				if (component != null)
					component.onDestroy();
			gameObject.onDestroy();
			//console.log(`${gameObject.constructor.name} destroyed`);
			
		};
		if (delay <= 0) {
			des();
		} else { toDestoryObjects[gameObject.id] = setGameTimeout(() => { des(); }, delay); }
	}

	/**
	 * Class-level equality check. Used if either objectA or objectB can be null
	 * @returns {Boolean} True if both are null or objectA.equals(objectB) is true
	 * @param {Component} objectA 
	 * @param {Component} objectB 
	 */
	static equals(objectA, objectB) {
		if (objectA == null)
			return objectB == null;
		return objectA.equals(objectB);
	}
}

/** @type {Object.<number, number>} */
const toDestoryObjects = {};

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

/* jshint expr: true */



/** @type [[GameObject]] */
let gameObjects = [];

let currentDebugs = {};

class Camera extends Component {
	constructor(isMainCamera = false) {
		super();
		if (Camera.main == null || isMainCamera)
			Camera.main = this;
	}

	/**
	 * Converts a position in world to the screen position
	 * @param {Vector2} position
	 * @returns {Vector2} 
	 */
	toScreenPosition(position) {
		const pos = this.gameObject.position;
		position = new Vector2(position);
		position.x -= pos.x - (canvasConfig.size.x / 2);
		position.y -= pos.y - (canvasConfig.size.y / 2);
		return position;
	}

	/**
	 * Converts a position on the screen to the world position
	 * @param {Vector2} position
	 * @returns {Vector2} 
	 */
	toWorldPosition(position) {
		const pos = this.gameObject.position;
		position = new Vector2(position);
		position.x += pos.x - (canvasConfig.size.x / 2);
		position.y += pos.y - (canvasConfig.size.y / 2);
		return position;
	}

	/**
	 * Calls toScreenPosition() on Camera.main
	 * If Camera.main is null then returns itself
	 * @param {Vector2} position 
	 * @returns {Vector2}
	 */
	static toScreenPosition(position) {
		if (Camera.main == null)
			return new Vector2(position);
		return Camera.main.toScreenPosition(position);
	}

	/**
	 * Calls toWorldPosition() on Camera.main
	 * If Camera.main is null then returns itself
	 * @param {Vector2} position 
	 * @returns {Vector2}
	 */
	static toWorldPosition(position) {
		if (Camera.main == null)
			return new Vector2(position);
		return Camera.main.toWorldPosition(position);
	}
}

/** @type {Camera} */
Camera.main = null;

function $(query) {return document.querySelector(query);}

/** @type HTMLCanvasElement */
const canvasElement = $(canvasConfig.canvasQuery);

/**
 * Starts the game
 * @param {Function} onStart Code to run when the game got initialized
 * @returns {number} The ID used for clearInterval()
 */
function main(onStart) {

	const canvas = canvasElement.getContext("2d");
	canvasElement.height = canvasConfig.size.y;
	canvasElement.width = canvasConfig.size.x;
	setCanvasSize();
	canvas.scale(canvasConfig.scale.x,canvasConfig.scale.y);
	canvas.imageSmoothingEnabled = !canvasConfig.pixelPerfectPosition;
	canvasElement.style.imageRendering = canvasConfig.imageRendering;

	let tick = 0;
	canvas.save();

	onStart();
	initControllers(TouchInputs, Buttons, Axes);

	return setInterval(() => {
		Update(tick);
		UpdateTimers();
		canvas.clearRect(0,0,canvasConfig.size.x, canvasConfig.size.y);
		Draw(canvas);
		DrawDebug(canvas);
		updateControllers();
		tick++;
	}, 1000/60);
}

const timers = {id: 0, intervals: {}, timeouts: {}};
function UpdateTimers() {
	if (timers.intervals)
	for (const id in timers.intervals) {
		if (timers.intervals.hasOwnProperty(id)) {
			const timer = timers.intervals[id];
			timer.current_delay--;
			if (timer.current_delay <= 0) {
				timer.current_delay = timer.delay;
				timer.callback();
			}
		}
	}
	const toDelete = [];
	if (timers.timeouts)
	for (const id in timers.timeouts) {
		if (timers.timeouts.hasOwnProperty(id)) {
			const timeout = timers.timeouts[id];
			timeout.current_delay--;
			if (timeout.current_delay <= 0) {
				timeout.callback();
				toDelete.push(id);
			}
		}
	}
	for (const id of toDelete) {
		delete timers.timeouts[id];
	}
}

function Update(tick) {
	for (let layer of gameObjects)
	if (layer != null)
	for (const gameObject of layer)
		if (gameObject.enabled)
			gameObject.tick(tick);
}

/**
 * @param {CanvasRenderingContext2D} canvas 
 */
function DrawDebug(canvas) {
	for (const key in currentDebugs) {
		const debug = currentDebugs[key];
		debug(canvas);
	}
}

/**
 * @param {CanvasRenderingContext2D} canvas 
 * @param {Number} tick 
 */
function Draw(canvas, tick) {
	for (let layer of gameObjects)
	if (layer != null)
	for (const gameObject of layer) {
		try {
			if(gameObject.hidden || !gameObject.enabled)
				continue;
			

			const sprite = gameObject.sprite;
			if (sprite == null)
				continue;
			
			const flipX = gameObject.spriteFlipX;
			const flipY = gameObject.spriteFlipY;
			const flipXSize = (gameObject.spriteFlipX ? -1 : 1) * 1;
			const flipYSize = (gameObject.spriteFlipY ? -1 : 1) * 1;
			
			const rect = gameObject.spriteRect;
			let size = gameObject.size;
			size.x *= rect.w;
			size.y *= rect.h;
			let pos = gameObject.position;

			if(Camera.main != null) {
				const cameraPosition = Camera.main.gameObject.position;
				
				pos.x -= cameraPosition.x - (canvasConfig.size.x / 2);
				pos.y -= cameraPosition.y - (canvasConfig.size.y / 2);
			}
			
			pos.x -= size.x * sprite.pivot.x;
			pos.y -= size.y * sprite.pivot.y;
			if (flipX) {
				pos.x *= -1;
				pos.x -= size.x;
			}
			if (flipY) {
				pos.y *= -1;
				pos.y -= size.y;
			}
			if(canvasConfig.pixelPerfectPosition) {
				pos = new Vector2(Math.round(pos.x), Math.round(pos.y));
				size = new Vector2(Math.round(size.x), Math.round(size.y));
			}
			canvas.save();
			canvas.globalAlpha = gameObject.spriteAlpha;
			canvas.scale(flipXSize, flipYSize);
			canvas.drawImage(sprite.element, rect.x, rect.y, rect.w, rect.h, pos.x, pos.y, size.x, size.y);	
			canvas.restore();
		} catch (error) {
			console.error(error);
			throw new Error(error);
		}
	}
}


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

export { Rect, Vector2, gameObjects, main, timers };
