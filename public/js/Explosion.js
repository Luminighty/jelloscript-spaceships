import GameObject from "./engine/GameObject";
import { Vector2 } from "./engine/Struct";
import { Particle, ParticleSystem } from "./engine/ParticleSystem";
import { sprites } from "./Assets";



export default class Explosion extends GameObject {

	/**
	 * 
	 * @param {Vector2} position 
	 * @param {Number} size 
	 */
	constructor(position, size) {
		super();
		
		this.position = position;
		this.explosion_size = size;

		this.destroy(size * 10);
	
		const particle = new Particle({
			velocity: () => {return new Vector2(Math.random() - 0.5, Math.random() + 0.25).multiply(2); },
			position: () => {return new Vector2(Math.random() - 0.5, Math.random() - 0.5).multiply(3);},
			sprite: sprites.particles,
			spriteRect: sprites.particles.getSpriteRect(0,0),
			spriteAlpha: (life) => {return 1-life;},
			renderingLayer: 20,
		});
		particle.onUpdate((object) => {
			//console.log(object);
			object.spriteRect = sprites.particles.getSpriteRect(Math.round(object.lifePercent * 5), 0);
		});
		this.particleSystem = this.addComponent(new ParticleSystem({
			particles: [particle],
			delay: 2000,
			burst: size * 10,
		}, true));
	}


	update() {
		//console.log("updated");
	}

}