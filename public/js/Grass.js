
import {decide} from './engine/Utils';
import GameObject from './engine/GameObject';
import { sprites } from "./Assets";

export default class Grass extends GameObject {
	constructor(x=0,y=0,label="NORMAL") {
		super();
		this.position = {x: x, y:y};
		this.sprite = sprites.grass;
		this.spriteRect = this.sprite.getSpriteFromLabel(label, 0, decide([35,10,3]));

	}
	
	update(tick) {
	}
}
