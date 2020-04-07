import EventHandler from "./EventHandler";


/**
 * @enum {number}
 * @property {GAMEPAD} 0
 * @property {KEYBOARD} 1
 * @property {TOUCH} 2
 */
export const InputMethods = { 
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
export class Button extends Input {
	
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

export class Axis extends Input {
	
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

/** @returns {Promise<KeyboardEvent.code>} */
export function onAnyKeyboardKey() {
	return new Promise(res => {
		const pressEvent = function (e) {
			if (e == null || e.code == null)
				return;
			res(e.code);
			window.removeEventListener("keydown", pressEvent);
		};
		window.addEventListener("keydown", pressEvent);
	});
}
/** @returns {Promise<Number>} */
export function onAnyGamepadButtons() {
	return new Promise(res => {
		const check = setInterval(() => {
			for (const gamePad of navigator.getGamepads()) {
				if(gamePad == null)
					continue;
				for (let id = 0; id < gamePad.buttons.length; id++) {
					const btn = gamePad.buttons[id];
					if (btn.pressed) {
						res(id);
						clearInterval(check);
					}
				}
			}
		}, 1);
	});
}

/** Sets the key on the keyboard then resolves the promise
 * @returns {Promise}
 */
export function setKeyboardKeyOnNextPress(key) {
	return onAnyKeyboardKey()
	.then((code) => {
		setKeyboardKey(key, code);
	});
}
/** Sets the key on the gamepad then resolves the promise
 * @returns {Promise}
 */
export function setGamepadKeyOnNextPress(key) {
	return  onAnyGamepadButtons()
	.then((code) => {
		setGamepadKey(key, code);
	});
}
