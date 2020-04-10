import {Controller, OnNewControllerListener, foreachController, SetControllerState, GetControllerState} from "./Controller";
import {networkConfig, axisConfig} from "../Input";
import { Axis, Button } from "./InputManager";
import EventHandler from "./EventHandler";

/**
 * @see https://github.com/Luminighty/jelloscript/wiki/Networking
 */
const NetworkManager = {
	/**
	 * Hosts a lobby
	 * @param {String} lobbyName The display name of the lobby
	 * @param {Object} options Any data that can be attached to the lobby (Type, Level, Minimum Score, ...)
	 * @param {Number} connectionLimit Maximum amount of clients that can be connected to the lobby
	 */
	host: (lobbyName, options = {}, connectionLimit = 8) => {},
	/**
	 * Connects to the lobby passed to the function
	 * @param {Lobby} lobby 
	 */
	connect: (lobby) => {},
	/**
	 * Refreshes the lobbies list
	 * @param {Object} options Options for the query
	 */
	refreshLobbies: (options) => {},
	/**
	 * Adds a listener for lobbies. It is called whenever the lobbies got refreshed.
	 * @param {LobbyCallback} callback 
	 */
	onLobbiesRefreshed: (callback) => {},
	/**
	 * Sets a function that should return the current state of the game used by the StateSetter
	 * @param {CallableFunction} callback 
	 */
	setStateGetter: (callback) => {},
	/**
	 * Sets a function that should set the current state of the game (returned by the StateGetter)
	 * @param {CallableFunction} callback 
	 */
	setStateSetter: (callback) => {},
	/**
	 * Updates the current state of the game after asking for an update from the host
	 */
	updateState: () => {},
	/**
	 * Sets a listener for messages
	 * @param {String} type The type of the message to listen to
	 * @param {CallableFunction} callback The function to call when a message was received
	 */
	onMessage: (type, callback) => {},
	/** Sends a typed message to the other clients
	 * @param {String} type The type of the message to send
	 * @param {...any} args The additional data to pass
	 */
	sendMessage: (type, ...args) => {},
	/** @type {Lobby[]} */
	lobbies: [],
	/** @returns {Boolean} True if the client is connected to the node socket.io server */
	isOnline: () => false,
};

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
	NetworkManager.isOnline = () => true;

	socket.on("connect", () => {
		console.log("connected");
	});

	/**
	 * A remote player representation for a controller
	 */
	class NetworkController extends Controller {
		constructor(buttons, axes, type, id) {
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

			socket.on("remove controller", (id) => {
				if (id != this.networkId)
					return;
				if (this.removeController)
					this.removeController();
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

	/**
	 * Hosts a lobby
	 * @param {String} lobbyName The display name of the lobby
	 * @param {Object} options Any data that can be attached to the lobby (Type, Level, Minimum Score, ...)
	 * @param {Number} connectionLimit Maximum amount of clients that can be connected to the lobby
	 */
	NetworkManager.host = function(lobbyName, options = {}, connectionLimit = 8) {
		const defaultLimit = networkConfig.defaultConnectionLimit;
		const limit = (connectionLimit == undefined) ? defaultLimit : connectionLimit;
		socket.emit("host lobby", lobbyName, options, limit);
	};

	/**
	 * Connects to the lobby passed to the function
	 * @param {Lobby} lobby 
	 */
	NetworkManager.connect = function(lobby) {
		if (lobby == undefined || lobby.id == undefined)
			throw "Not a lobby!";
		socket.emit("connect lobby", lobby.id);
	};

	/**
	 * Refreshes the lobbies list
	 * @param {Object} options Options for the query
	 */
	NetworkManager.refreshLobbies = function(options) {
		socket.emit("list lobbies", (options) ? options : {});
	};

	/**
	 * Sets a function that should return the current state of the game used by the StateSetter
	 * @param {CallableFunction} callback 
	 */
	NetworkManager.setStateGetter = function (callback) {
		getState = callback;
	};

	/**
	 * Sets a function that should set the current state of the game (returned by the StateGetter)
	 * @param {CallableFunction} callback 
	 */
	NetworkManager.setStateSetter = function(callback) {
		setState = callback;
	};

	/**
	 * Updates the current state of the game after asking for an update from the host
	 */
	NetworkManager.updateState = function() {
		socket.emit("update state");
	};

	socket.on("get state", (sendState) => {
		sendState(getState());
	});

	socket.on("set state", (state) => {
		setState(state);
	});



	let getState = function () { return {}; };
	let setState = function (state) {};


	socket.on("update lobbies", (lobbies) => {
		NetworkManager.lobbies = lobbies;
		events.call("lobby refresh", lobbies);
	});

	/** @deprecated Don't really have to call this */
	socket.on("new connection", () => {
		console.log("New connection");
	});

	socket.on("new controller", (buttons, axes, type, id, data) => {
		new NetworkController(buttons, axes, type, id);
		SetControllerState(NetworkController.networkToIdMap[id], data);
	});

	socket.on("get controllers", () => {
		foreachController(addController);
	});


	const events = new EventHandler();

	/**
	 * 
	 * @param {CallableFunction} callback 
	 */
	NetworkManager.onLobbiesRefreshed = function(callback) {
		events.on("lobby refresh", callback);
	};

	socket.on("get controller state", (id, response) => {
		console.log("get controller state", id);
		
		const data = GetControllerState(id);
		response(data);
	});

	socket.on("messaging", (type, args) => {
		events.call(`messaging ${type}`, ...args);
	});

	NetworkManager.sendMessage = function(type, ...args) {
		if (!socket)
			return;
		//events.call(`messaging ${type}`, ...args);
		socket.emit("messaging", type, args);
	};

	NetworkManager.onMessage = function(type, callback) {
		events.on(`messaging ${type}`, callback);
	};
}

export default NetworkManager;