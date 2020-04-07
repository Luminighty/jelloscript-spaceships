import Component from "./Component";
import Sprite from "./Sprite";
import { Rect } from "./Struct";

/**
 * @see https://github.com/Luminighty/jelloscript/wiki/Animator
 */
export default class Animator extends Component {
	
	/**
	 * @param {GameObject} gameObject The gameobject the component belongs to
	 * @param {Sprite} sprite The default sprite
	 * @param {Rect} spriteRect The default sprite rect
	 */
	constructor(gameObject, sprite, spriteRect) {
		super(gameObject);
		/** 
		 * The sprite to be rendered (hides gameobject's sprite)
		 * @type {Sprite} 
		 * */
		this.sprite = sprite;
		/** 
		 * The spriteRect for rendering (hides gameobject.spriteRect)
		 * @type {Rect}
		 *  */
		this.spriteRect = spriteRect;
		/** @type {Number} */
		this.tick = 0;
	}

	update(tick) { this.tick = tick; this.animate(); }

	/** Should set the sprite and spriteRect for the object */
	animate() {}

	/** @returns The variable's new value 
	 * @param {Number[]} frames
	 * @param {Any[]} values
	 * @param {Number} startTick The offset for the frame
	 * @param {Animator.PROGRESSIONS} progression The progression function used to calculate the value based on the last value, next value and percentage
	*/
	getKeyFrameValue(frames, values, startTick, progression) {
		const frame = (this.tick - startTick) % frames[frames.length-1];

		for (let i = 0; i < frames.length; i++) {
			if(frames[i] <= frame)
				continue;
			const lastValue = values[i-1];
			const newValue = values[i];
			const lastKeyFrame = frames[i-1];
			const newKeyFrame = frames[i];
			
			const framePercentage = frame / newKeyFrame;
						
			return progression(lastValue, newValue, framePercentage);
		}
	}

}

Animator.PROGRESSIONS = {
	/**
	 * @param {Number} lastValue 
	 * @param {Number} nextValue 
	 * @param {Number} percentage 
	 */
	linear: function (lastValue, nextValue, percentage) {
		const delta = nextValue - lastValue;
		return lastValue + (delta * percentage);
	}
};