import GameObject from "./engine/GameObject";
import { Vector2 } from "./engine/Struct";
import { sprites, sounds } from "./Assets";
import BoxCollider from "./engine/BoxCollider";
import { colliderTags } from "./Config";
import { ParticleSystem, Particle } from "./engine/ParticleSystem";
import Explosion from "./Explosion";
import * as Utils from './engine/Utils';


export default class Missile extends GameObject {

	/**
	 * @param {String} label 
	 * @param {GameObject} ship 
	 * @param {Vector2} offset 
	 * @param {Number} damage
	 */
	constructor(label, ship, offset, damage = 10) {
		super();
		this.sprite = sprites.missile;
		this.spriteRect = this.sprite.getSpriteFromLabel(label);
		this.position = ship.position.add(new Vector2(offset));

		this.damage = damage;
		
		this.destroy(this.lifeTime);
		this.addComponent(new BoxCollider(colliderTags.playerMissile, [5, 8], [0,0], true));
		if (!Utils.mobileAndTabletCheck()) {
			let particle = new Particle({
				velocity: () => {return new Vector2(Math.random() - 0.5, Math.random() + 4); },
				sprite: sprites.particles,
				spriteRect: sprites.particles.getSpriteFromLabel(`MISSILE_${label}`, 0, 0),
				spriteAlpha: (life) => {return 1-life;}
			});

			this.addComponent(new ParticleSystem({
				particles: [particle],
				delay: 5,
			}, true));
		}
	}

	get lifeTime() {return 150;}

	update(tick) {
		this.position = this.position.add(this.velocity);
	}

	get velocity() {
		return new Vector2(0, -4);
	}

	/** @param {import("./engine/Collider").Collider} other */
	onTriggerEnter(other) {
		if (other.tag == colliderTags.enemy) {
			other.gameObject.hit(this.damage);
			sounds.SOUND.explosions.normal.playOnce();
			this.destroy();
			GameObject.init(new Explosion(this.position, 1));
		}
	}

}