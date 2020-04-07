/**
 * Similarly to the Events in Node.js this class stores typed listeners with any number of arguments
 */
export default class EventHandler {

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
