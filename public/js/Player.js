import GameObject from './engine/GameObject';
import {sprites, sounds} from './Assets';
import * as Input from './Input';
import { Vector2 } from './engine/Struct';
import * as Utils from './engine/Utils';
import BoxCollider from './engine/BoxCollider';
import { colliderTags } from './Config';
import Ship from './Ship';
import Missile from './Missile';
import Enemy from './Enemy';
import Explosion from './Explosion';
import Slider from './Slider';

export default class Player extends Ship {
	constructor(input, label, healthSlider, x=310, y=280) {
		super(sprites.playership, (label) ? label : Utils.decide([1,1,1], ["PURPLE", "GREEN", "BLUE"]));

		/** @type {Vector2} */
		this.position = {x: x, y: y};
		
		this.addComponent(new BoxCollider(colliderTags.player, [24,24], [0,0], true));

 		/** @type {import("./engine/InputManager").Inputs} input */
		this.input = input;

		this.input.Buttons.A.onPressed(() => {this.onShoot();} );
		//this.input.Buttons.B.onPressed(() => {this.onBack();} );
		this.shootDelay = 0;
		/** @type {Slider} */
		this.healthSlider = healthSlider;
		this.healthSlider.maxValue = this.maxHealth;
	}

	addThrusters() {
		switch (this.label) {
			default:
			case "PURPLE":
				this.addThruster([-5, 21], [-6, 21], [-3, 21], "NORMAL2");
				this.addThruster([6, 21], [4, 21], [7, 21], "NORMAL2");
				break;
			case "BLUE":
				this.addThruster([0, 19], [-2, 19], [2, 19]);
				break;
			case "GREEN":
				this.addThruster([0, 20], [-2, 20], [2, 20], "WIDE");
				this.addThruster([-13, 20], [-14, 20], [-10, 20], "THIN");
				this.addThruster([14, 20], [11, 20], [15, 20], "THIN");
				break;
		}
	}



	onShoot() {
		if (this.health <= 0)
			return;
		if (this.shootDelay > 0) {
			sounds.SOUND.wrong.playOnce(0.1);
			return;
		}
		this.shootDelay = 15;
		sounds.SOUND.shoot.playOnce(0.3);

		this.spawnMissiles();
	}

	spawnMissiles() {
		const positions = {
			"PURPLE": {
				"DEFAULT":[[-3.5, -14], [3.5, -14]],
				"LEFT":   [[-5.5, -14], [0.5, -14]],
				"RIGHT":  [[-0.5, -14], [5.5, -14]],
			},
			"GREEN": {
				"DEFAULT":[[-8.5, 0], [8.5, 0]],
				"LEFT":   [[-9.5, 0], [5.5, 0]],
				"RIGHT":  [[-5.5, 0], [9.5, 0]],
			},
			"BLUE": {
				"DEFAULT":[[-5.5, -8], [5.5, -8]],
				"LEFT":   [[-7.5, -8], [3.5, -8]],
				"RIGHT":  [[-3.5, -8], [7.5, -8]],
			},
		};



		const move = this.move;
		const way = (Math.abs(move.x) <= 0.2) ?
				"DEFAULT" : 
				(move.x < 0) ?
					"LEFT" :
					"RIGHT";

		for (const pos of positions[this.label][way]) {
			GameObject.init(new Missile(this.label, this, pos), 40);
		}
	}

	onBack() {

	}

	get move() {
		const horizontal = this.input.Axes.Horizontal.value;
		const vertical = this.input.Axes.Vertical.value;

		const vector = new Vector2(horizontal, vertical);
		return (vector.sqrMagnitude > 1) ? vector.normalized : vector;
	}

	get speed() { return 3; }

	afterUpdate() {
		let pos = this.position;
		pos = Vector2.min(pos, new Vector2(620, 340));
		pos = Vector2.max(pos, new Vector2(20, 20));
		this.position = pos;

		this.shootDelay--;
	}

	onDeath() {
		super.onDeath();
		this.clearThrusters();
		const explosionSize = Utils.mobileAndTabletCheck() ? 5 : 15;
		GameObject.init(new Explosion(this.position, explosionSize));
		sounds.SOUND.explosions.big.playOnce();
	}

	onHit() {
		this.healthSlider.value = this.health;
	}

	/**
	 * @param {import('./engine/Collider').Collider} other 
	 */
	onTriggerEnter(other) {
		if (other.gameObject instanceof Enemy) {
			/** @type {Enemy} */
			const enemy = other.gameObject;
			
			const dmg = Math.min(this.health, enemy.health);
			enemy.hit(dmg);
			this.hit(dmg);
			console.table([this.health, enemy.health]);
			
		}
	}

}
