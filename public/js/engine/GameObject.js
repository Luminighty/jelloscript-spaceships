/* jshint expr: true */
import {Vector2, Rect} from './Struct';
import Component from "./Component";
import Sprite from "./Sprite";
import Animator from "./Animator";
import Collider, {COLLISION_CHECK_METHOD} from './Collider';
import { sprites } from '../Assets';
import * as Config from '../Config';



/** @type [[GameObject]] */
export let gameObjects = [];



/**
 * The super class for every GameObject
 * @public
 * @class
 * @see https://github.com/Luminighty/jelloscript/wiki/GameObject
 */
export default class GameObject extends Component {

	/** @public */
	constructor(size = new Vector2(1,1), enabled = true, hidden = false) {
		super(null, enabled);
		/** @type {Vector2} */
		this._size = size;
		/** @type GameObject */
		this.parent = null;
		/** @type [Component] */
		this.components = [];
		/**
		 * @public
		 * @type {Vector2}
		 */
		this._localPosition = new Vector2(0,0);
		/** @private */
		this._enabled = enabled;
		/** @private */
		this._hidden = hidden;
		/** @private */
		this._spriteRect = new Rect(0,0,1,1);
		/** @private */
		this._spriteFlip = {x:false, y:false};
		/** @private */
		this._sprite = null;

		/** @type {Boolean}
		 * Whenever the object's position is relative to the canvas or the camera (true for ui elements )*/
		this.canvasPosition = false;
		/** 
		 * @type {Animator}
		 * @private */
		this._animator = null;
		/** 
		 * @type {Collider[]}
		 * @private */
		this._colliders = [];
		/** 
		 * The transparency of the rendered sprite
		 * @public 
		 */
		this.spriteAlpha = 1.0;
		this.gameObject = this;
	}

	/** 
	 * Adds a new component to the component array
	 * @returns {Component} the new component
	 */
	addComponent(component) { 
		if (component instanceof Animator)
			if(this._animator == null) {
			this._animator = component;
			} else {
				throw "An animator is already attached to this gameObject!";
			}
		if (component instanceof Collider)
			this._colliders.push(component);
		component.gameObject = this;
		this.components.push(component);
		return component;
	}
	removeComponent(component) {
		if(component instanceof Collider)
			this._colliders.splice(this._colliders.indexOf(component), 1);
		this.components.splice(this.components.indexOf(component), 1); 
	}

	/**
	 * Returns the component of Type type if the game object has one attached, null if it doesn't
	 * @param {Type} type The component type
	 * @returns Component
	 */
	getComponent(type) {
		for (const component of this.components) {
			if (component instanceof type)
				return component;
		}
		return null;
	}

	/**
	 * Returns every component of Type type.
	 * @param {Type} type The component type
	 * @returns [Component]
	 */
	getComponents(type) {
		outs = [];
		for (const component of this.components)
			if (component instanceof type)
				outs.push(component);
		return outs;
	}

	/** 
	 * Calls update() on gameobject and on it's components
	 * Do not override, unless you know what you're doing
	 * @private
	 */
	tick(tick) {
		this.update(tick);
		for (const component of this.components)
			if (component.enabled)
				component.update(tick);
	}

	/**
	 * @type {Vector2}
	 */
	get position() {
		if(this.parent == null)
			return this.localPosition;
		return (this.parent.position.add(this.localPosition)).clone();
	}

	/** @public */
	set position(value) {
		value = new Vector2(value);
		const currentPosition = this.position;
		if (currentPosition.equals(value))
			return;

		const delta = value.substract(currentPosition);
		// If no collider is attached, we set it's position
		if (this._colliders.length == 0) {
			this.localPosition = this.localPosition.add(delta);
			return;
		}
		

		/**
		 * tries to move the gameobject by deltaX and deltaY
		 * @param {GameObject} obj this
		 * @param {number} deltaX 
		 * @param {number} deltaY 
		 */
		const collisionCheck = function(obj, deltaX, deltaY) {
			const lastPosition = obj.localPosition;
			obj.localPosition = obj.localPosition.add({x: deltaX, y: deltaY});
			
			for (const col of obj._colliders)
				if(col.collisionCheckMethod == COLLISION_CHECK_METHOD.ON_MOVED && col.updateCollision()) {
					obj.localPosition = lastPosition;
					return;
				}
		};

		const iterCount = Config.collisionIterations;
		const deltaStep = delta.divide(iterCount);
		for (let step = 0; step < iterCount; step++) {
			collisionCheck(this, deltaStep.x, 0);
			collisionCheck(this, 0, deltaStep.y);
		}
	}
	

	/** @type {Vector2} */
	get localPosition() {return this._localPosition.clone(); }
	set localPosition(value) { this._localPosition = new Vector2(value); }

	/** @type {Vector2} */
	get size() { return this._size.clone(); }
	set size(value) { this._size = new Vector2(value); }

	/** @type {Boolean} */
	get enabled() { return super.enabled;}

	/** @public */
	set enabled(value) {
		if (value == this._enabled)
			return;
		(value) ? this.onEnabled() : this.onDisabled();
		for (const c of this.components)
			if(c != null)
				(value) ? c.onEnabled() : c.onDisabled();
		this._enabled = value;
	}

	/**
	 * @public
	 * @type Boolean
	 */
	get hidden() {return this._hidden;}
	/** @public */
	set hidden(value) {
		if (value == this._hidden)
			return;
		(value) ? this.onHidden() : this.onShown();
		this._hidden = value;
	}
	/** @public */
	onHidden() {}
	/** @public */
	onShown() {}

	/**
	 * @public
	 * @type Sprite
	 */
	get sprite() {return (this._animator == null) ? this._sprite : this._animator.sprite;}
	/** @public */
	set sprite(sprite) {
		this._spriteRect = sprite.getSpriteRect(0,0);
		this._sprite = sprite;
	}
	/**
	 * @public
	 * @type Rect
	 */
	get spriteRect() {return (this._animator == null) ? this._spriteRect : this._animator.spriteRect;}
	set spriteRect(spriteRect) {this._spriteRect = spriteRect;}

	/**
	 * @public
	 * @type Boolean
	 */
	get spriteFlipX() 		{return this._spriteFlip.x;}
	/** @public */
	set spriteFlipX(value)  {this._spriteFlip.x = value;}
	/**
	 * @public
	 * @type Boolean
	 */
	get spriteFlipY() 		{return this._spriteFlip.y;}
	/** @public */
	set spriteFlipY(value)  {this._spriteFlip.y = value;}

	/** @public
	 * @param {GameObject} object
	 * @param {Number} layer
	 */
	static init(object, layer = 0) {
		 if (gameObjects[layer] == null)
			gameObjects[layer] = [];
		object.updateLayer = layer;
		gameObjects[layer].push(object);
		return object;
	}


	/** Shorthand for GameObject.destroy(this, delay); */
	destroy(delay = 0) { GameObject.destroy(this, delay); }

}
/** The current tick since the game started */
GameObject.tick = 0;