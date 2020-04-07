import Component from "./Component";
import { Vector2 } from "./Struct";
import { canvasConfig } from "../Config";

/**
 * @see https://github.com/Luminighty/jelloscript/wiki/Camera
 */
export default class Camera extends Component {
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