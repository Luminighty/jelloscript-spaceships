import Resource from "./Resource";
import { Vector2, Rect } from "./Struct";

/**
 * @see https://github.com/Luminighty/jelloscript/wiki/Sprite
 */
export default class Sprite extends Resource {
        
    /**
     * @param {String} path Physical file path
     * @param {[Number, Number]} size [Width, Height] 
     * @param {[Number, Number]} offset [OffsetX, OffsetY] default: [0, 0]
     * @param {[Number, Number]} pivot [PivotX, PivotY] default: [0.5, 0.5]
     * @param {dictionary} labels {"LABELNAME" : {x: OffsetX, y: OffsetY}, ...}
     * Offset as tiles, NOT PIXELS
     */
    constructor(path, size, offset=[0,0], pivot=[0.5,0.5], labels={}) {
        super(path, "img");
		/** @public */
        this.path = path;
		/** 
		 * @public
		 * @type {Vector2}
		 */
        this.size = new Vector2(size);
		/** 
		 * @public
		 * @type {Vector2}
		 */
		this.offset = new Vector2(offset);
		/**
		 * @public
		 * @type {Vector2}
		 */
		this.pivot = new Vector2(pivot);
		/** 
		 * @public
		 * @type {SpriteLabel}
		 */
		this.labels = labels;
		/** @private */
        this._element = null;
    }

    /**
	 * @public
	 * Get a sprite from the sprite sheet
	 * @param {Number} x
	 * @param {Number} y 
	 * @returns {Rect}
	 */
    getSpriteRect(x = 0, y = 0) {
        return {
            x: (this.offset.x + this.size.x) * x,
            y: (this.offset.y + this.size.y) * y,
            w: this.size.x,
            h: this.size.y
        };
    }

    /**
	 * @public
	 * Get a sprite from the sprite sheet using the label
	 * @param {SpriteLabel} label
	 * @param {Number} offsetX Tile offset
	 * @param {Number} offsetY Tile offset
	 * @returns {Rect}
	 */
    getSpriteFromLabel(label, offsetX=0, offsetY=0) {
        const l = this.labels[label.toUpperCase()];
		return this.getSpriteRect(l.x+offsetX, l.y+offsetY);
    }

    /** @type {HTMLImageElement} */
    get element() {return super.element; }

    load() {
        super.load();
    }
}


