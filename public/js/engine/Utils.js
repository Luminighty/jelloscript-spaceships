import { Vector2 } from "./Struct";
import { timers } from "./run";

/**
 * A random selection based on the chances array.
 * @param {[Number]} weights The chances of one of them being the outcome [10,30,20]
 * @param {[Any]} options The results of the chances, by default it's 0..chances.length-1
 * @returns {Any} An element of options or an index of chances
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#decide
 */
export function decide(weights, options = []) {
	let sum = 0;
	for (const c of weights)
		sum += c;
	let res = Math.random() * sum;
	
	for (let i = 0; i < weights.length; i++) {
		const element = weights[i];
		res -= element;
		if (res <= 0)
			return (options.length <= i || options == []) ? i : options[i];
	}
}


/**
 * Calculates a position between the two values moving no farther than the distance specified by maxDelta
 * @param {Number | Vector2} current The start position to move from
 * @param {Number | Vector2} target The target position to move towards
 * @param {Number | Vector2} maxDelta The maximum distance to move
 * @returns {Number | Vector2} The new position
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#movetowards
 */
export function moveTowards(current, target, maxDelta) {
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
 * Converts the angle from radian to degree
 * @param {Number} angle An angle in radians
 * @returns {Number} The angle in degrees
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#todegreetoradian
 */
export function toDegree(angle) {
	return angle * (180 / Math.PI);
}


/**
 * Converts the angle from degree to radian
 * @param {Number} angle An angle in degrees
 * @returns {Number} The angle in radians
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#todegreetoradian
 */
export function toRadian(angle) {
	return angle * (Math.PI / 180);
}


/** @returns If the browser is a mobile or tablet
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#mobileandtabletcheck 
 */
export function mobileAndTabletCheck() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}

/**
 * Wraps the value in a function, or makes the function be it's getter
 * @param {Any|Function} value 
 * @param {Any} defaultValue if value is undefined
 * @returns {Function}
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#asfunction 
 */ 
export function asFunction(value, defaultValue) {
	if (typeof(value) == "function") {
		return value;
	}
	return (value != null) ? () => value : () => defaultValue;
}


/**
 * Same as setTimeout, but uses ingame time
 * @param {CallableFunction} callback 
 * @param {Number} delay Tick count before callback
 * @returns {Number} Id used for clearGameTimeout
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#gametimeout 
 */
export function setGameTimeout(callback, delay) {
	const id = timers.id++;
	timers.timeouts[id] = {
		callback, delay, current_delay: delay,
	};
	return id;
}
/**
 * Stops the timeout from triggering
 * @param {Number} timeout The id returned from setGameTimeout
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#gametimeout 
 */
export function clearGameTimeout(timeout) {
	delete timers.timeouts[timeout];
}
/**
 * Same as setInterval, but uses ingame time
 * @param {CallableFunction} callback 
 * @param {Number} delay Tick count between callbacks
 * @returns {Number} Id used for clearGameInterval
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#gameinterval 
 */
export function setGameInterval(callback, delay) {
	const id = timers.id++;
	timers.intervals[id] = {
		callback, delay, current_delay: delay,
	};
	return id;
}

/**
 * Stops the callbacks from triggering again
 * @param {Number} interval The id returned from setGameInterval
 * @see https://github.com/Luminighty/jelloscript/wiki/Utils#gameinterval 
 */
export function clearGameInterval(interval) {
	delete timers.intervals[interval];
}
