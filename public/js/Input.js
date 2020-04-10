import { Axis, Button } from "./engine/InputManager";
import { addTouchInput, AxisKeys } from "./engine/Controller";

/** @typedef {Buttons} Button */
export const Buttons = {
	A: new Button(), 
	B: new Button()
};
/** @typedef {Axes} Axis */
export const Axes = {
	Horizontal: new Axis(),
	Vertical: new Axis()
};


 /** @type {[import("./engine/InputManager").KeyboardControls]} */
export const DefaultKeyboardControls = [
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
export const DefaultGamepadControls = {
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
export const TouchInputs = [
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
export const axisConfig = {
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

/** @typedef {Object} mouseConfig */
export const mouseConfig = {
	allowOutsideMousePosition: false
};


export const networkConfig = {
	enabled: true,
	host: "http://localhost",
	defaultConnectionLimit: 4,
};


// Re-exporting for easier access
export {Mouse, FromPlayer, OnNewControllerListener, OnGetControllerState, OnSetControllerState, OnControllerRemoved} from "./engine/Controller";