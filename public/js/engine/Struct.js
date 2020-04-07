
/**
 * @public
 * @class
 */
export class Vector2 {

	/**
	 * Creates a Vector2 variable
	 * @param {Number, Array} x Possible values: The X coordinate; [X, Y]; {x: X, y: Y}
	 * @param {Number} y The Y coordinate
	 */
	constructor(x,y) {
		if (y == null) {
			if (Array.isArray(x))
				x = {x:x[0], y:x[1]};
			y = x.y;
			x = x.x;
		}
		this.x = x;
		this.y = y;
	}

	/**
	 * @param {Number} index 
	 * @returns {Number} (index mod 2 == 0) ? x : y
	 */
	get(index) {
		index %= 2;
		return (index == 0) ? this.x : this.y;
	}
	/**
	 * Clones the vector
	 * @returns {Vector2} clone
	 */
	clone() {
		return new Vector2(this.x, this.y);
	}

	/**
	 * Adds two Vectors together
	 * @param {Vector2} other The other vector to add from the original
	 * @returns {Vector2} a NEW vector2
	 */
	add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
	/**
	 * Substracts two Vectors together (this - other)
	 * @param {Vector2} other The other vector to substract from the original
	 * @returns {Vector2} a NEW vector2
	 */
	substract(other) { return this.add(new Vector2(other).negate()); }
	/**
	 * Returns the negate of this vector (-this.x, -this.y)
	 * @returns {Vector2} a NEW vector2
	 */
	negate() { return new Vector2(-this.x, -this.y); }
	/**
	 * Multiplies the vector with the number
	 * @param {Number} number 
	 */
	multiply(number) { return new Vector2(this.x * number, this.y * number); }
	/**
	 * Divides the vector with the number
	 * @param {Number} number 
	 */
	divide(number) {return new Vector2(this.x / number, this.y / number);}

	/**
	 * Rounds the components of the vector
	 * @returns {Vector2} a NEW vector2
	 */
	round() {return new Vector2(Math.round(this.x), Math.round(this.y)); }

	/**
	 * Floors the components of the vector
	 * @returns {Vector2} a NEW vector2
	 */
	floor() {return new Vector2(Math.floor(this.x), Math.floor(this.y)); }

	/** The magnitude of this vector
	 * @returns {Number} magnitude
	 */
	get magnitude() { return Math.sqrt(this.sqrMagnitude);}
	/** The magnitude of this vector squared (Faster than magnitude, because doesn't use square root)
	 * @returns {Number} magnitude
	  */
	get sqrMagnitude() { return this.x * this.x + this.y * this.y; }
	/** Returns this vector with a magnitude of 1
	 * @returns {Vector2}
	  */
	get normalized() { const magnitude = this.magnitude; return (magnitude > 0) ? this.divide(magnitude) : Vector2.zero;}


	/**
	 * Calculates the dot product of two vectors: (a.x * b.x) + (a.y * b.y) 
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 * @returns {Number} dot product
	 */
	static dot(a, b) {return a.x * b.x + a.y * b.y;}
	/**
	 * Calculates the angle between two vectors
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 * @returns {Number} angle in radians
	 */
	static angle(a, b) {
		const m = a.magnitude * b.magnitude;
		return (m != 0) ? Math.acos(Vector2.dot(a,b) / m) : 0;
	}

	/** 
	 * Shorthand for new Vector(0,0)
	 * @returns {Vector2}  */
	static get zero()  { return new Vector2( 0, 0); }
	/** Shorthand for new Vector(1,1)
	 * @returns {Vector2}  */
	static get one()   { return new Vector2( 1, 1); }
	/** Shorthand for new Vector(1,0) 
	 * @returns {Vector2}  */
	static get right() { return new Vector2( 1, 0); }
	/** Shorthand for new Vector(-1,0) 
	 * @returns {Vector2}  */
	static get left()  { return new Vector2(-1, 0); }
	/** Shorthand for new Vector(0,1) 
	 * @returns {Vector2}  */
	static get up()    { return new Vector2( 0, 1); }
	/** Shorthand for new Vector(0,-1) 
	 * @returns {Vector2}  */
	static get down()  { return new Vector2( 0,-1); }

	/**
	 * Calculates a position between the two values moving no farther than the distance specified by maxDelta
	 * @param {Vector2} current The start position to move from
	 * @param {Vector2} target The target position to move towards
	 * @param {Vector2} maxDelta The maximum distance to move
	 * @param {Boolean} isSqrMagnitued If the delta should be squared (when true it's faster)
	 * @returns {Vector2} The new position
	 */
	static moveTowards(current, target, maxDelta, isSqrMagnitued) {
		const delta = target.substract(current);
		const distance = (isSqrMagnitued) ? delta.sqrMagnitude : delta.magnitude;
		if (maxDelta > distance || distance == 0)
			return target;
		return current.add(delta.divide(distance));
	}
	
	/**
	 * Returns a new vector made out of the minimum of both vector's components
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 */
	static min(a, b) {
		return new Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y));
	}
	
	/**
	 * Returns a new vector made out of the maximum of both vector's components
	 * @param {Vector2} a 
	 * @param {Vector2} b 
	 */
	static max(a, b) {
		return new Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
	}

	/**
	 * Checks whenever two vector are equal
	 * @param {Rect} other 
	 * @returns {Boolean}
	 */
	equals(other) {
		other = new Vector2(other);
		return other != null && other.x == this.x && other.y == this.y;
	}

}



/**
 * A box represented with 4 numbers. 
 *    x and y for the top left coordinates
 *    w and h for width and height
 * @public
 * @class
 */
export class Rect {
	/**
	 * Initializes a Rect
	 * @param {Number} x Top left X position
	 * @param {Number} y Top left Y position
	 * @param {Number} w Width
	 * @param {Number} h Height
	 */
	constructor(x,y,w,h) {
		if (y == null) {
			if (Array.isArray(x))
				x = {x:x[0], y:x[1], w:x[2], h:x[3]};
			y = x.y;
			w = x.w;
			h = x.h;
			x = x.x;
		}
		this.position = new Vector2(x,y);
		this.size = new Vector2(w,h);
	}

	/**
	 * The position of the rect {x, y}
	 * @type {Vector2}
	 */
	get position() { return new Vector2(this.x, this.y); }
	/**
	 * Sets the position for the rect
	 * @param {Vector2} position The new position
	 */
	set position(position) { position = new Vector2(position); this.x = position.x; this.y = position.y; }
	/**
	 * The size of the rect {w, h}
	 * @type {Vector2}
	 */
	get size() { return new Vector2(this.w, this.h); }
	/**
	 * Sets the size for the rect
	 * @param {Vector2} size The new size
	 */
	set size(size) { size = new Vector2(size); this.w = size.x; this.h = size.y; }

	/** The smaller value on the X axis
	 * @type {Number}
	 */
	get minX() {return this.x;}
	/** The smaller value on the Y axis
	 * @type {Number}
	 */
	get minY() {return this.y;}
	/** The larger value on the X axis
	 * @type {Number}
	 */
	get maxX() {return this.x + this.w;}
	/** The larger value on the Y axis
	 * @type {Number}
	 */
	get maxY() {return this.y + this.h;}

	/** Top Left position in Vector2
	 * @type {Vector2}
	 */
	get topLeft() {return new Vector2(this.minX, this.minY);}
	/** Top Right position in Vector2
	 * @type {Vector2}
	 */
	get topRight() {return new Vector2(this.maxX, this.minY);}
	/** Bottom Left position in Vector2
	 * @type {Vector2}
	 */
	get bottomLeft() {return new Vector2(this.minX, this.maxY);}
	/** Bottom Right position in Vector2
	 * @type {Vector2}
	 */
	get bottomRight() {return new Vector2(this.maxX, this.maxY);}
	/** The center of the rect in Vector2
	 * @type {Vector2}
	 */
	get center() { return new Vector2(this.minX + this.w/2, this.minY + this.h/2); }

	/**
	 * Rounds the rect's components 
	 * @returns {Rect} a NEW rect */
	round() {return new Rect(Math.round(this.x), Math.round(this.y), Math.round(this.w), Math.round(this.h));}

	/**
	 * floors the rect's components 
	 * @returns {Rect} a NEW rect */
	floor() {return new Rect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.w), Math.floor(this.h));}

	/**
	 * Multiplies the rect with the number using type
	 * @param {Number} number Number to multiply with
	 * @param {Rect.MULTIPLY_TYPE} type Multiplication type
	 * @returns {Rect} a NEW rect
	 */
	multiply(number, type) {
		let p = this.position;
		let o = this.size;
		if (type !== Rect.MULTIPLY_TYPE.SIZE)
			p = p.multiply(number);
		if (type !== Rect.MULTIPLY_TYPE.POSITION)
			o = o.multiply(number);
		return new Rect(p.x, p.y, s.x, s.y);
	}

	/**
	 * Returns true if the rect contains the 'other' rect
	 * A rect contains the other one if the other one does not have any points outside the rect
	 * @param {Rect} other
	 * @returns {Boolean}
	 */
	contains(other) {
		const offset = {x:other.x-this.x, y:other.y-this.y};
		if(offset.x < 0 || offset.y < 0)
			return false;
		return other.w + offset.x <= this.w && other.h + offset.y <= this.h;
	}

	/**
	 * Returns true if the rect intersects the 'other' rect
	 * Two rects intersects eachother if they have shared points
	 * @param {Rect} other 
	 * @returns {Boolean}
	 */
	intersects(other) {
		return !(this.minX > other.maxX ||
				 this.minY > other.maxY ||
				 other.minX > this.maxX ||
				 other.minY > this.maxY);
	}
	/**
	 * Creates a rect with 2 position
	 * @constructor
	 * @param {Number} x1 
	 * @param {Number} y1 
	 * @param {Number} x2 
	 * @param {Number} y2 
	 * @returns {Rect}
	 */
	static initFromPositions(x1, y1, x2, y2) {
		const x = Math.min(x1, x2);
		const y = Math.min(y1, y2);
		const w = Math.abs(x1 - x2);
		const h = Math.abs(y1 - y2);
		return new Rect(x,y,w,h);
	}
	/** Shorthand for new Rect(0,0,0,0)
	 * @returns {Rect}
	 */
	static get zero() {return new Rect(0,0,0,0);}

	/**
	 * Checks whenever two rects are equal
	 * @param {Rect} other 
	 * @returns {Boolean}
	 */
	equals(other) {
		other = new Rect(other);
		return other != null && other.x == this.x && other.y == this.y && other.w == this.w && other.h == this.h;
	}
}
/**
 * @static
 * @readonly
 * @enum {number}
 * @
 */
Rect.MULTIPLY_TYPE = {
	/** Multiply BOTH the position and the size */
	BOTH: 0, 
	/** Multiply ONLY the position */
	POSITION: 1, 
	/** Multiply ONLY the size */
	SIZE: 2
};