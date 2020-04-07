import GameObject from "./engine/GameObject";
import Sprite from "./engine/Sprite";
import { sprites } from "./Assets";
import BoxCollider from "./engine/BoxCollider";
import Collider from "./engine/Collider";
import { colliderTags } from "./Config";

export default class Water extends GameObject {

	constructor(x=25, y=25) {
		super();
		this.position = [x,y];
		this.sprite = sprites.water;
		this.addComponent(new BoxCollider(colliderTags.default, [16,16]));
	}

	onCollisionEnter(other) {
		console.log(other);
	}


}