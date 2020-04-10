import Ship from "./Ship";
import { asFunction } from "./engine/Utils";
import { Vector2, Rect } from "./engine/Struct";
import GameObject from "./engine/GameObject";
import Sprite from "./engine/Sprite";
import { sprites, sounds } from "./Assets";
import BoxCollider from "./engine/BoxCollider";
import { colliderTags } from "./Config";
import Explosion from "./Explosion";
import NetworkManager from "./engine/Networking";
import * as Utils from "./engine/Utils";

/** @public */
export default class Enemy extends Ship {

	/**
	 * @param {Vector2} position
	 * @param {Object} options
	 * @param {Vector2 | function(Number):Vector2} options.move
	 * @param {Number | function(Number):Vector2} options.speed
	 * @param {Sprite | function(Number):Sprite} options.sprite
	 * @param {Rect | function(Number):Rect} options.spriteRect
	*/
	constructor(position, options) {
		const _sprite = asFunction(options.sprite, sprites.enemies.basic);
		super(_sprite(), "BASIC", 20);
		
		if (options == null)
			options = {};
		this.spriteGetter = _sprite;
		this.spriteRectGetter = asFunction(options.spriteRect, sprites.enemies.basic.getSpriteRect());
		this.position = position;
		/** @type {function():Vector2}*/
		this._move = asFunction(options.movement, new Vector2(0, 1));
		/** @type {function():Number}*/
		this._speed = asFunction(options.speed, 1);

		this.collider = this.addComponent(new BoxCollider(colliderTags.enemy, [20, 20], [0,0], true));
	
		//this.sprite = this.spriteGetter(0);
		this.spriteRect = this.spriteRectGetter(0);
		this.spriteFlipY = true;
		this.destroy(500);
	}
	/**
	 * 
	 * @param {import("./engine/Collider").Collider} other 
	 */
	onTriggerEnter(other) {
		if (other.tag == colliderTags.player)
			other.gameObject.onTriggerEnter(this.collider);
	}

	onDeath() {
		const explosionSize = Utils.mobileAndTabletCheck() ? 3 : 10;
		GameObject.init(new Explosion(this.position, explosionSize));
		sounds.SOUND.explosions.big.playOnce();
		this.destroy();
	}


	get speed() { return this._speed(this.lifetime);}

	get move() { return this._move(this.lifetime); }
}




/** @public */
export class Spawner extends GameObject {

	constructor() {
		super();
		this.hidden = true;
		this.currentDelay = this.delay;
		this.host = true;
		NetworkManager.onMessage("spawnEnemy", (data) => {this.onSpawn(data);});
	}

	onSpawn(data) {
		if (!this.enabled)
			return;
		GameObject.init(new Enemy(data.position, {}), 20);
		console.log(data);
	}

	update() {
		if (!this.host)
			return;
		this.currentDelay--;
		if (this.currentDelay > 0)
			return;
		
		const position = this.position;
		GameObject.init(new Enemy(position, {}), 20);
		this.currentDelay = this.delay;
		NetworkManager.sendMessage("spawnEnemy", {position});
	}

	get position() {
		return new Vector2(Math.random() * 580 + 30, -10);
	}

	get delay() {
		return Math.floor(Math.random() * 50 + 10);
	}
}

