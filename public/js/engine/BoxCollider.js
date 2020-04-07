import Collider from "./Collider";
import { Vector2, Rect } from "./Struct";
import * as Debug from "./Debug";
import { debugMode, minCollisionDistance } from "../Config";

/**
 * @see https://github.com/Luminighty/jelloscript/wiki/BoxCollider
 */
export default class BoxCollider extends Collider {

	/**
	 * The box's center will be the gameObject's position
	 * @param {String} tag A value from colliderTags in config.js
	 * @param {Vector2} size The size of the box
	 * @param {Vector2} offset The offset of the box from the player
	 * @param {Boolean} isTrigger Is the collider a trigger or a collision
	 * @param {Number} collisionCheckMethod A value from Collider.COLLISION_CHECK_METHOD
	 */
	constructor(tag, size, offset=[0,0], isTrigger = false, collisionCheckMethod = null) {
		super(tag, isTrigger, collisionCheckMethod);
		this.size = new Vector2(size);
		this.offset = new Vector2(offset);
		this.debugBounds = false;
	}

	/**
	 * Determines if the object collides with the other one
	 * @param {Collider} other 
	 */
	collides(other) {
		if (other instanceof BoxCollider)
			return BoxCollider.intersects(this.bounds, other.bounds);
		return false;
	}

	/**
	 * Checks whenever 2 rects intersects as collision
	 * @param {Rect} a 
	 * @param {Rect} b 
	 */
	static intersects(a, b) {
		return !(a.minX + minCollisionDistance >= b.maxX ||
				 a.minY + minCollisionDistance >= b.maxY ||
				 b.minX + minCollisionDistance >= a.maxX ||
				 b.minY + minCollisionDistance >= a.maxY);
	}

	/** @type {Rect} */
	get bounds() {
		if (this.gameObject == null)
			throw "Parent not found for Collider";
		let size = this.size;
		let offset = this.offset;
		if (this.resizeWithParent) {
			size.x *= this.gameObject.size.x;
			size.y *= this.gameObject.size.y;
			offset.x *= this.gameObject.size.x;
			offset.y *= this.gameObject.size.y;
		}
		const pos = this.gameObject.position.substract(size.divide(2)).add(offset);
		if (debugMode.isDebugOn && (this.debugBounds || BoxCollider.debugAllBounds))
			Debug.drawRect(pos.x, pos.y, size.x, size.y);
		
		return new Rect(pos.x, pos.y, size.x, size.y);
	}

}

BoxCollider.debugAllBounds = debugMode.Collider.bounds;