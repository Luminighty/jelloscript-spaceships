import { colliderTags, collisionIgnoreMatrix } from "../Config";
import Component from "./Component";


/** 
 * @typedef {Collider} Collider
 */

/**
 * @see https://github.com/Luminighty/jelloscript/wiki/Collider
 */
export default class Collider extends Component {

	/**
	 * @param {String} tag A value from colliderTags in config.js
	 * @param {Boolean} isTrigger Is the collider a trigger or a collision
	 * @param {Number} collisionCheckMethod A value from Collider.COLLISION_CHECK_METHOD
	 */
	constructor(tag, isTrigger = false, collisionCheckMethod = null) {
		super();
		/** @type {String} */
		this.tag = tag;
		/** @type {Boolean} */
		this.isTrigger = isTrigger;
		/** @type {Collider[]} */
		this.collisions = [];

		this.collisionCheckMethod = (collisionCheckMethod != null) ? collisionCheckMethod : COLLISION_CHECK_METHOD.ON_MOVED;
		colliders.push(this);
	}


	/** @type {Array.<string>} */
	get ignoreTagMatrix() { return collisionIgnoreMatrix[this.tag];}

	/**
	 * Checks whenever the collision should be ignored because of their tags
	 * @param {Collider} a 
	 * @param {Collider} b 
	 */
	static isIgnoredByTags(a, b) {
		const aMatrix = a.ignoreTagMatrix;
		const bMatrix = b.ignoreTagMatrix;
		return (aMatrix != null && aMatrix.includes(b.tag)) || (bMatrix != null && bMatrix.includes(a.tag));
	}

	/**
	 * Determines if the object collides with the other one
	 * @param {Collider} other 
	 */
	collides(other) { return false; }

	/**
	 * Checks if the 2 collider can collide with eachother.
	 * They can collide if they're both enabled and not ignored by their tags
	 * @param {Collider} other 
	 * @returns {Boolean}
	 */
	canCollide(other) {
		return this.enabled && other.enabled && !Collider.isIgnoredByTags(this, other);
	}

	onDisabled() {
		for (const c of this.collisions)
			c._onCollisionStop(this);
	}

	_onCollisionStop(other) {
		this.collisions.splice(this.collisions.indexOf(other), 1);
		this.isTrigger ? this.gameObject.onTriggerExit(other) : this.gameObject.onCollisionExit(other);
		for (const c of this.gameObject.components)
			if (c != null && c != this)
				this.isTrigger ? c.onTriggerExit(other) : c.onCollisionExit(other);
	}

	_onCollisionStart(other) {
		this.collisions.push(other);
		this.isTrigger ? this.gameObject.onTriggerEnter(other) : this.gameObject.onCollisionEnter(other);
		for (const c of this.gameObject.components)
			if (c != null && c != this)
				this.isTrigger ? c.onTriggerEnter(other) : c.onCollisionEnter(other);
	}

	_onCollisionStay(other) {
		this.isTrigger ? this.gameObject.onTriggerStay(other) : this.gameObject.onCollisionStay(other);
		for (const c of this.gameObject.components)
			if (c != null && c != this)
				this.isTrigger ? c.onTriggerStay(other) : c.onCollisionStay(other);
	}

	onDestroy() {
		for (const c of this.collisions)
			c._onCollisionStop(this);
		colliders.splice(colliders.indexOf(this), 1);
	}

	/**
	 * Updates the collision and calls their events (OnCollisionEnter, OnCollisionStay, OnTriggerExit, ...)
	 * @returns {Boolean} Whenever the collision found a non-trigger collision
	 */
	updateCollision() {
		let collide = false;
		for (const other of colliders) {
			if (other.gameObject.equals(this.gameObject))
				continue;
			const contains = this.collisions.includes(other);

			if(this.canCollide(other) && this.collides(other)) {
				collide = !this.isTrigger && !other.isTrigger;
				if (!contains) {
					this._onCollisionStart(other);
				} else {
					this._onCollisionStay(other);
				}
			} else if(contains) {
				this._onCollisionStop(other);
			}
		}
		return collide;
	}
}

/**
 * @typedef {{EVERY_FRAME, ON_MOVED, MANUAL}} CollisionCheckMethods
 */
export const COLLISION_CHECK_METHOD = {
	/** The collision will be checked every frame the collider is enabled */
	EVERY_FRAME: 0,
	/** The collision will be checked every time the gameObject's position is changed */
	ON_MOVED: 1,
	/** The collision will be checked only when updateCollision() is called */
	MANUAL: 2
};

/** @type {Collider[]} */
export let colliders = [];
