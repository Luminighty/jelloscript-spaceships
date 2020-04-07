/* -------------------------------------
  				  CANVAS
   ------------------------------------- */
const canvasConfig = {
	/** The query used for finding the canvas */
	canvasQuery: "#mainCanvas",
	/** The element that stores the UI elements */
	uiContainerQuery: "#UIContainer",
	/** Canvas size in pixels */
	size: {x: 640, y: 360},
	/** Canvas ratio */
	ratio: {x: 16, y: 9},
	/** How much does the canvas fill of the screen in percentage */
	fillPercentage: 1,
	/** Whenever each pixel should be forced to be a whole number or not 
	 * Mostly used for pixelart games */
	forceIntegerScaling: true,
	/** Upscaling used for the rendering */
	scale: {x: 1, y: 1},
	/** Rounds the position and size for rendering */
	pixelPerfectPosition: true,
	/** See: https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering */
	imageRendering: "pixelated"
};



/* -------------------------------------
  				COLLISION
   ------------------------------------- */

/**
 * Possible collision tags
 * @enum
 */
const colliderTags = {
	default: "default",
	background: "background",
	player: "player",
	playerMissile: "playerMissile",
	missile: "missile",
	enemy: "enemy",
};

/** The collision tags that will be ignored by the collision component */
/**
 * @type {Object.<string, Array.<string>>}
 */
const collisionIgnoreMatrix = {
	default: [colliderTags.background],
	player: [colliderTags.player, colliderTags.playerMissile],
	playerMissile: [colliderTags.playerMissile],
	enemy: [colliderTags.missile],
};

/** How many times should the collision be checked between 2 positions */
const collisionIterations = 1;

/**
 * @public
 * @class
 */
class Vector2 {

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
class Rect {
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

class Resource {

    /**
     * @param {String} path The physical file path
     * @param {String} tag The element tag
     */
    constructor(path, tag) {
        /** @private */
        this._element = null;
        /** @public */
        this.path = path;
        /** @private */
		this._tag = tag;
    }

    /** 
     * Returns the HTML element
     * @public
	 * @type {HTMLElement}
	 */
    get element() {
        if (this._element == null) this.load();
        return this._element;
    }

    /** Unloads the element */
    unload() {this._element.remove();}

    /** 
     * Loads the element
     */
    load() { 
        this._element = document.createElement(this._tag);
        this._element.src = this.path;
        this._element.style.display = "none";
    }

}

class Sprite extends Resource {
        
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

class Animator extends Component {
	
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

/* jshint expr: true */

class Sound extends Resource {

    constructor(path, loop = false) {
        super(path, "audio");
        /** @private */
		this._loop = loop;
    }

    /**
     * Plays the sound from a specified time
     * @param {Number} time The time in seconds
     */
    play(time=0) {
		this.element.currentTime = time;
		this.element.play()
		.catch(_ => {
			setTimeout(() => {
				this.play(time);
			}, 10);
		});
	}
	
	/**
	 * Plays the sound once with a cloned instance. Then unloads it
	 * @param {Number} volume The volume for the audio
	 * @param {Number} time The start time
	 */
	playOnce(volume, time=0) {
		/** @type HTMLAudioElement */
		const clone = this.element.cloneNode();
		clone.volume = (volume) ? volume : this.volume;
		clone.currentTime = time;
		clone.loop = false;
		const runTime = clone.duration - time;
		clone.play()
		.catch(_ => {
			setTimeout(() => {
				this.playOnce(volume, time);	
			}, 10);
		});
		setTimeout(() => { clone.remove(); }, runTime);
	}

    /** Shorthand for sound.paused = false; */
    resume() {this.paused = false;}

    /** @type {Boolean} */
    get paused() { return this.element.paused; }
    set paused(value) {
        const element = this.element;
        (value) ? element.pause() : element.play();
    }

    /** @type {Boolean} */
    get muted() {return this.element.muted;}
    set muted(value) {this.element.muted = value;}
    
    /** @type [ 0.0 ; 1.0 ] */
    get volume() {return this.element.volume; }
    set volume(value) {this.element.volume = value;}

    /** @type {HTMLAudioElement} */
    get element() {return super.element;}

    /** @type {Number} */
    get duration() {return this.element.duration;}

    /** @type {Boolean} */
    get loop() {return this._loop;}
    set loop(value) {
        this._loop = value;
        this.element.loop = value;
	}

	/** 
	 * The current playback time in seconds
	 * @returns {Number} */
	get currentTime() {return this.element.currentTime; }
	set currentTime(time) {this.element.currentTime = time;}

    load() {
		super.load();
		/** @type {HTMLAudioElement} */
        const element = this.element;
        element.preload = "auto";
        element.loop = this.loop;
		element.controls = false;
    }

}

const sprites = {
    grass: new Sprite("./media/temp/grass.png", [16,16], [0,0], [0.5, 0.5], {
                        "DRY": {x:0, y:0},
                        "NORMAL": {x:0, y:3},
                        "WET": {x:0, y:6}
					}),
	player: new Sprite("./media/temp/player.png", [8,8], [1,0]),
	water: new Sprite("./media/temp/water.png", [16,16]),
	flame: new Sprite("./media/temp/flame.png", [4,4]),
	playership: new Sprite("./media/spaceship_player.png", [48,48], [0,0], [0.5, 0.5], {
		"PURPLE": {x: 0, y: 0},
		"BLUE":   {x: 1, y: 0},
		"GREEN":  {x: 2, y: 0},
	}),
	stars: new Sprite("./media/stars.png", [8,8]),
	thruster: new Sprite("./media/thruster.png", [8, 24], [0,0], [0.5, 0], {
		"NORMAL": {x: 0, y: 0},
		"BACK":   {x: 1, y: 0},
		"FORWARD":{x: 2, y: 0},
		"WIDE":   {x: 3, y: 0},
		"THIN":   {x: 6, y: 0},
		"NORMAL2":{x: 9, y: 0},
	}),
	missile: new Sprite("./media/missiles.png", [5, 8], [0,0], [0.5, 0], {
		"PURPLE": {x: 0, y: 0},
		"BLUE":   {x: 1, y: 0},
		"GREEN":  {x: 2, y: 0},
	}),
	enemies: {
		basic: new Sprite("./media/enemies_basic.png", [24, 24], [0,0], [0.5, 0.5], {
			"BASIC": {x: 0, y: 0},
			"SHOOT": {x: 1, y: 0},
		}),
	},
	particles: new Sprite("./media/particles.png", [1,1], [0,0], [0,0], {
		"THRUSTER": {x: 4, y: 2},
		"EXPLOSION": {x: 0, y: 0},
		"MISSILE_PURPLE": {x: 0, y: 2},
		"MISSILE_BLUE": {x: 1, y: 2},
		"MISSILE_GREEN": {x: 2, y: 2},
	}),
};

const sounds = {
	MUSIC: {
		bgm: new Sound("./media/sounds/spacey.wav", true),
	},
	SOUND: {
		temp: { test: new Sound("./media/temp/sound.wav"), },
		shoot: new Sound("./media/sounds/shoot.wav"),
		wrong: new Sound("./media/sounds/wrong.wav"),
		explosions: {
			normal: new Sound("./media/sounds/explosion.wav"),
			big: new Sound("./media/sounds/explosion_big.wav"),
		}
	}
};

/* jshint expr: true */



/** @type [[GameObject]] */
let gameObjects = [];



/**
 * The super class for every GameObject
 * @public
 * @class
 */
class GameObject extends Component {

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

		const iterCount = collisionIterations;
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

/**
 * Similarly to the Events in Node.js this class stores typed listeners with any number of arguments
 */
class EventHandler {

	constructor() {
		/** @type {Object.<string, CallableFunction[]>} */
		this.listeners = {};
	}

	/**
	 * Calls the listeners attached to the event
	 * @param {String} type 
	 * @param {any} args 
	 */
	call(type, ...args) {
		if (this.listeners[type] === undefined)
			return;
		const lists = this.listeners[type];
		for (const list of lists) {
			list(...args);
		}
	}

	/**
	 * Adds a listener to the event
	 * @param {String} type 
	 * @param {CallableFunction} callback 
	 */
	on(type, callback) {
		if (this.listeners[type] === undefined)
			this.listeners[type] = [];
		this.listeners[type].push(callback);
	}

	/**
	 * @callback ForeachCallback
	 * @param {CallableFunction} listener 
	 */

	/**
	 * Iterates through the listeners and passes them as parameters for the callback
	 * @param {String} type 
	 * @param {ForeachCallback} callback 
	 */
	forEach(type, callback) {
		if (this.listeners[type] === undefined)
			return;
		for (const list of this.listeners[type]) {
			callback(list);	
		}
	}
}

/** @typedef {Object} KeyboardControls
 * @property {Object.<String, String>} Buttons
 * @property {Object.<String, Object.<String, String>>} Axes
 */

/**
 * @typedef {Object} PlayerControl
 * @property {String} id
 * @property {Inputs} inputs
 * @property {InputMethods} type
 */

/**
 * @typedef {Object} Inputs
 * @property {import("../Input").Axis} Axes
 * @property {import("../Input").Button} Buttons
 */


/**
 * @public
 * @class
 * @abstract
 * The abstract class used for storing the state of inputs per controller
 */
class Input {
	/** Initializes a new Input */
	constructor() {
		/**
		 * The current states for the Input
		 * @private
		 * @readonly
		 * @type {Number}
		 */
		this.state = 0;
		/** 
		 * @private
		 */
		this._listeners = new EventHandler();
	}

	/**
	 * Calls the attached listeners with the same type
	 * Note: This won't set the Input's state. 
	 * @param {String} type 
	 */
	callListener(type, ...param) {
		this._listeners.call(type, ...param);
	}
}

/**
 * @public
 * @class
 * An input extended for representing Button presses
 */
class Button extends Input {
	
	/** Initializes a new Button input */
	constructor() {
		super();
	}

	/** 
	 * Returns true during the frame the user pressed the button
	 * @public
	 * @type Boolean 
	 */
	get isPressed() {return this.state == 1;}
	/** 
	 * Return true while the button is held down
	 * @public
	 * @type Boolean 
	 */
	get isDown() {return this.state > 0;}
	/** 
	 * Return true during the frame the user released the button
	 * @public
	 * @type Boolean 
	 */
	get isUp() {return this.state < 0;}

	/**
	 * Adds an event listener that's called whenever the button is pressed.
	 * @param {CallableFunction} callback 
	 * @public
	 */
	onPressed(callback) {
		return this._listeners.on(Button.listenerTypes.Pressed, callback);
	}

	/**
	 * Adds an event listener that's called whenever the button is released.
	 * @param {CallableFunction} callback 
	 * @public
	 */
	onReleased(callback) {
		return this._listeners.on(Button.listenerTypes.Released, callback);
	}
}

Button.listenerTypes = {Pressed: 0, Released: 1};

class Axis extends Input {
	
	/** Initializes a new Axis input*/
	constructor() {
		super();
		/**
		 * @private
		 * @readonly
		 * @type {Number}
		 */
		this.dead = 0.0;

		/**
		 * Used for keyboard values
		 * @private
		 * @readonly
		 * @type {Number}
		 */
		this.toValue = 0;
	}

	/** 
	 * Return the current value of the axis. A number between [-1,1]
	 * @public
	 * @type Number 
	 */
	get value() {return (Math.abs(this.state) > this.dead) ? this.state : 0;}

	/**
	 * Adds an event listener that's called whenever the axis' value changed at least with
	 *  the minimum value (set in the input config)
	 * @param {CallableFunction} callback 
	 * @public
	 */
	onChanged(callback) {
		return this._listeners.on(Axis.listenerTypes.Changed, callback);
	}
}
/** 
 * The types of listeners that's supported for the axis input
 * Use the onChanged method instead
 */
Axis.listenerTypes = {Changed: 0};

/** @typedef {Buttons} Button */
const Buttons = {
	A: new Button(), 
	B: new Button()
};
/** @typedef {Axes} Axis */
const Axes = {
	Horizontal: new Axis(),
	Vertical: new Axis()
};

// ------------ MOUSE START ------------
const Mouse = (function() {
	const Mouse = {
		position: Vector2.zero,
		/** @type {[Number]} */
		pressed: [],
		/** @param {Number} key */
		isPressed: function(key) {
			for (const btn of this.pressed)
				if (btn == key)
					return true;
			return false;
		},
		wheel: 0
	};


	/** @type {HTMLCanvasElement} */
	const canvas = document.body.querySelector(canvasConfig.canvasQuery);

	window.addEventListener("mousemove", (e) => {
		const rect = canvas.getBoundingClientRect();
		const size = canvasConfig.size;
		const scale = {x: rect.width / size.x, y: rect.height / size.y };

		const newPosition = {x: (e.clientX - rect.x) / scale.x, y: (e.clientY - rect.y) / scale.y};
		if ( isOutsideOfCanvas(newPosition))
			return;
		Mouse.position = new Vector2(newPosition.x, newPosition.y);
	});

	window.addEventListener("mousedown", (e) => {
		Mouse.pressed.push(e.button);
	});
	window.addEventListener("mouseup", (e) => {
		Mouse.pressed.splice(Mouse.pressed.indexOf(e.button), 1);
	});
	window.addEventListener("mousewheel", (e) => {
		Mouse.wheel = e.deltaY;
	});

	/**
	 * @param {Vector2} position 
	 * @returns {Boolean}
	 */
	function isOutsideOfCanvas(position) {
		return position.x < 0 || position.y < 0	|| position.x > canvasConfig.size.x || position.y > canvasConfig.size.y;
	}

	return Mouse;
}());
// ------------ MOUSE END ------------

function $(query) {return document.querySelector(query);}

/** @type HTMLCanvasElement */
const canvasElement = $(canvasConfig.canvasQuery);

const timers = {id: 0, intervals: {}, timeouts: {}};


window.addEventListener("resize", (e) => {
	setCanvasSize();
});

function setCanvasSize() {
	
	const size = {
		x: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		y: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	};
	const ratio = canvasConfig.ratio;
	const fillPer = canvasConfig.fillPercentage;
	const ratioValue = ratio.x / ratio.y;
	const canvasSize = canvasConfig.size;
	
	let newSize = {x:0, y:0};

	/** @media (min-aspect-ratio:16/9) */
	if ((size.x / size.y) > ratioValue) {
		newSize.x = (size.y * fillPer) * ratioValue;
		newSize.y = (size.y * fillPer);
	} else {
		newSize.x = (size.x * fillPer);
		newSize.y = (size.x * fillPer) / ratioValue;
	}
	{
		newSize.x = toMultiplier(newSize.x, canvasSize.x, 0.5);
		newSize.y = toMultiplier(newSize.y, canvasSize.y, 0.5);
	}
	//console.log(newSize);
	
	canvasElement.style.height = `${newSize.y}px`;
	canvasElement.style.width = `${newSize.x}px`;
}

/**
 * @param {Number} value The original value
 * @param {Number} to The value the original value will be a multiplier of
 * @param {Number} divider If it's too small then it'll start dividing with this value
 */
function toMultiplier(value, to, divider) {
	value = parseInt(value);
	if (value < to && divider != null)
		return toMultiplier(value / divider, to) * divider;
	return value - (value % to);
}

/**
 * Wraps the value in a function, or makes the function be it's getter
 * @param {Any|Function} value 
 * @param {Any} defaultValue if value is undefined
 * @returns {Function}
 */ 
function asFunction(value, defaultValue) {
	if (typeof(value) == "function") {
		return value;
	}
	return (value != null) ? () => value : () => defaultValue;
}


/**
 * Same as setTimeout, but uses ingame time
 * @param {CallableFunction} callback 
 * @param {Number} delay Tick count before callback
 * @returns {Number} Id used for clearGameTimeout
 */
function setGameTimeout(callback, delay) {
	const id = timers.id++;
	timers.timeouts[id] = {
		callback, delay, current_delay: delay,
	};
	return id;
}
/**
 * Stops the timeout from triggering
 * @param {Number} timeout The id returned from setGameTimeout
 */
function clearGameTimeout(timeout) {
	delete timers.timeouts[timeout];
}

/* jshint expr: true */
//import Collider from "./Collider";

let currentId = 0;

class Component {

    constructor(gameObject, enabled = true) {
		/** @private */
		this._id = currentId++;
		/** 
		 * Gameobject to which the component is attached to
		 * @type {GameObject}
		 */
		this.gameObject = gameObject;
		/** @private */
		this._enabled = enabled;
		this.start();
	}

	/** @type {Boolean} */
	get enabled() {return this._enabled; }
	set enabled(enabled) {
		if(this._enabled != enabled)
			(enabled) ? this.onEnabled() : this.onDisabled();
		this._enabled = enabled;

	}

	/**
	 * unique id for every component instance 
	 * @type {Number} */
	get id() {return this._id;}
	/**
	 * @returns {Boolean} True if the component and the other component are the same. By default when their ID is the same
	 * @param {Component} other 
	 */
	equals(other) { return other != null && other.id == this.id; }

	/**
	 * Called when the component's state is set to enabled
	 * @public */
	onEnabled() {}
	/** 
	 * Called when the component's state is set to disabled
	 * @public
	 *  */
	onDisabled() {}
	/** 
	 * Called before the component gets destroyed
	 * @public
	 *  */
	onDestroy() {}
	/** 
	 * Called after the constructor
	 * @public 
	 * */
	start() {}
	/** 
	 * Called every frame
	 * @public 
	 * */
	update(tick) {}

	/**
	 * Called when the gameobject starts colliding with another collider
	 * @param {import("./Collider").Collider} other 
	 */
	onCollisionEnter(other) {}
	/**
	 * Called every frame when the gameobject collides with another collider
	 * @param {import("./Collider").Collider} other 
	 */
	onCollisionStay(other) {}
	/**
	 * Called when the gameobject stops colliding with another collider
	 * @param {import("./Collider").Collider} other 
	 */
	onCollisionExit(other) {}

	/**
	 * Called when the attached gameobject enters a trigger
	 * @param {import("./Collider").Collider} other 
	 */
	onTriggerEnter(other) {}
	/**
	 * Called every frame when the attached gameobject is in a trigger
	 * @param {import("./Collider").Collider} other 
	 */
	onTriggerStay(other) {}
	/**
	 * Called when the attached gameobject leaves a trigger
	 * @param {import("./Collider")} other 
	 */
	onTriggerExit(other) {}


	/**
	 * Destroys the gameObject
	 * @param {GameObject} object 
	 * @param {Number} delay Delay before deleting the gameObject
	 */
	static destroy(object, delay=0) {
		const gameObject = object.gameObject;
		const des = function() {
			if (toDestoryObjects[gameObject.id])
				clearGameTimeout(toDestoryObjects[gameObject.id]);
			delete toDestoryObjects[gameObject.id];
			const layer = gameObjects[gameObject.updateLayer];
			layer.splice(layer.indexOf(gameObject), 1);
			
			for (const component of gameObject.components)
				if (component != null)
					component.onDestroy();
			gameObject.onDestroy();
			//console.log(`${gameObject.constructor.name} destroyed`);
			
		};
		if (delay <= 0) {
			des();
		} else { toDestoryObjects[gameObject.id] = setGameTimeout(() => { des(); }, delay); }
	}

	/**
	 * Class-level equality check. Used if either objectA or objectB can be null
	 * @returns {Boolean} True if both are null or objectA.equals(objectB) is true
	 * @param {Component} objectA 
	 * @param {Component} objectB 
	 */
	static equals(objectA, objectB) {
		if (objectA == null)
			return objectB == null;
		return objectA.equals(objectB);
	}
}

/** @type {Object.<number, number>} */
const toDestoryObjects = {};

/** 
 * @typedef {Collider} Collider
 */

class Collider extends Component {

	/**
	 * @param {String} tag A value from colliderTags in config.js
	 * @param {Boolean} isTrigger Is the collider a trigger or a collision
	 * @param {Number} collisionCheckMethod A value from Collider.COLLISION_CHECK_METHOD
	 */
	constructor(tag, isTrigger = false, collisionCheckMethod = null) {
		super();
		/** @type {String} */
		this.tag = tag;
		/** @type {Boolean} */
		this.isTrigger = isTrigger;
		/** @type {Collider[]} */
		this.collisions = [];

		this.collisionCheckMethod = (collisionCheckMethod != null) ? collisionCheckMethod : COLLISION_CHECK_METHOD.ON_MOVED;
		colliders.push(this);
	}


	/** @type {Array.<string>} */
	get ignoreTagMatrix() { return collisionIgnoreMatrix[this.tag];}

	/**
	 * Checks whenever the collision should be ignored because of their tags
	 * @param {Collider} a 
	 * @param {Collider} b 
	 */
	static isIgnoredByTags(a, b) {
		const aMatrix = a.ignoreTagMatrix;
		const bMatrix = b.ignoreTagMatrix;
		return (aMatrix != null && aMatrix.includes(b.tag)) || (bMatrix != null && bMatrix.includes(a.tag));
	}

	/**
	 * Determines if the object collides with the other one
	 * @param {Collider} other 
	 */
	collides(other) { return false; }

	/**
	 * Checks if the 2 collider can collide with eachother.
	 * They can collide if they're both enabled and not ignored by their tags
	 * @param {Collider} other 
	 * @returns {Boolean}
	 */
	canCollide(other) {
		return this.enabled && other.enabled && !Collider.isIgnoredByTags(this, other);
	}

	onDisabled() {
		for (const c of this.collisions)
			c._onCollisionStop(this);
	}

	_onCollisionStop(other) {
		this.collisions.splice(this.collisions.indexOf(other), 1);
		this.isTrigger ? this.gameObject.onTriggerExit(other) : this.gameObject.onCollisionExit(other);
		for (const c of this.gameObject.components)
			if (c != null && c != this)
				this.isTrigger ? c.onTriggerExit(other) : c.onCollisionExit(other);
	}

	_onCollisionStart(other) {
		this.collisions.push(other);
		this.isTrigger ? this.gameObject.onTriggerEnter(other) : this.gameObject.onCollisionEnter(other);
		for (const c of this.gameObject.components)
			if (c != null && c != this)
				this.isTrigger ? c.onTriggerEnter(other) : c.onCollisionEnter(other);
	}

	_onCollisionStay(other) {
		this.isTrigger ? this.gameObject.onTriggerStay(other) : this.gameObject.onCollisionStay(other);
		for (const c of this.gameObject.components)
			if (c != null && c != this)
				this.isTrigger ? c.onTriggerStay(other) : c.onCollisionStay(other);
	}

	onDestroy() {
		for (const c of this.collisions)
			c._onCollisionStop(this);
		colliders.splice(colliders.indexOf(this), 1);
	}

	/**
	 * Updates the collision and calls their events (OnCollisionEnter, OnCollisionStay, OnTriggerExit, ...)
	 * @returns {Boolean} Whenever the collision found a non-trigger collision
	 */
	updateCollision() {
		let collide = false;
		for (const other of colliders) {
			if (other.gameObject.equals(this.gameObject))
				continue;
			const contains = this.collisions.includes(other);

			if(this.canCollide(other) && this.collides(other)) {
				collide = !this.isTrigger && !other.isTrigger;
				if (!contains) {
					this._onCollisionStart(other);
				} else {
					this._onCollisionStay(other);
				}
			} else if(contains) {
				this._onCollisionStop(other);
			}
		}
		return collide;
	}
}

/**
 * @typedef {{EVERY_FRAME, ON_MOVED, MANUAL}} CollisionCheckMethods
 */
const COLLISION_CHECK_METHOD = {
	/** The collision will be checked every frame the collider is enabled */
	EVERY_FRAME: 0,
	/** The collision will be checked every time the gameObject's position is changed */
	ON_MOVED: 1,
	/** The collision will be checked only when updateCollision() is called */
	MANUAL: 2
};

/** @type {Collider[]} */
let colliders = [];

class ParticleObject extends GameObject {
	/**
	 * 
	 * @param {Particle} particle 
	 * @param {EventHandler} listeners
	 */
	constructor(particle, parent, listeners) {
		super(particle.size);
		this.parent = parent;
		/** @type {Vector2} */
		this.localPosition = particle.position.clone();
		/** @type {Vector2} */
		this.velocity = particle.velocity.clone();
		/** @type {Vector2} */
		this.gravity = particle.gravity.clone();
		this.lifespan = particle.lifespan;
		this._currentLifeSpan = 0;
		this.sprite = particle.sprite;
		this.spriteRect = (particle.spriteRect) ? particle.spriteRect : this.spriteRect;
		this.spriteAlphaCallback = particle.spriteAlpha;

		this._listeners = listeners;
	}

	update(tick) {
		this.localPosition = this.localPosition.add(this.velocity);
		this.velocity = this.velocity.add(this.gravity);
		this._currentLifeSpan++;
		if (this.spriteAlphaCallback)
			this.spriteAlpha = this.spriteAlphaCallback(this._currentLifeSpan / this.lifespan);
		if (this._currentLifeSpan >= this.lifespan)
			this.destroy();
		this._listeners.call("update", this);
	}

	/** 
	 * The current percentage of the particle's life,
	 * 1.0 is dead,
	 * 0.0 is newborn
	 * @type {Number} */
	get lifePercent() {
		return this._currentLifeSpan / this.lifespan;
	}
}

class Particle {

	/**
	 * 
	 * @param {{
	 * 	position: Vector2|Function, 
	 * 	velocity: Vector2|Function, 
	 * 	gravity: Vector2|Function, 
	 * 	size: Vector2|Function,
	 * 	lifespan: Number|Function,
	 * 	sprite: Sprite|Function,
	 * 	spriteRect: Rect|Function,
	 * 	spriteAlpha: Number|Function,
	 * 	renderingLayer: Number}} options 
	 * 	
	 */
	constructor(options) {
		if (options == null)
			options = {};
		/** @private @type {Function} */
		this._size     = asFunction(options.size, Vector2.one);
		/** @private @type {Function} */
		this._position = asFunction(options.position, Vector2.zero);
		/** @private @type {Function} */
		this._velocity = asFunction(options.velocity, Vector2.zero);
		/** @private @type {Function} */
		this._gravity  = asFunction(options.gravity, Vector2.zero);
		/** @private @type {Function} */
		this._lifespan = asFunction(options.lifespan, 60);
		/** @private @type {Function} */
		this._sprite = asFunction(options.sprite);
		/** @private @type {Function} */
		this._spriteRect = asFunction(options.spriteRect);
		/** @private @type {Function} */
		this._renderingLayer = asFunction(options.renderingLayer, 0);
		/** @private @type {Function} */
		this._spriteAlpha = asFunction(options.spriteAlpha, 1.0);

		this._listeners = new EventHandler();
	}

	setValue(key, value) {
		this[key] = asFunction(value);
	}

	/** @type {Vector2} */
	get size() {return this._size(); }
	/** @type {Vector2} */
	get position() {return this._position(); }
	/** @type {Vector2} */
	get velocity() {return this._velocity(); }
	/** @type {Vector2} */
	get gravity() {return this._gravity(); }
	/** @type {Number} */
	get lifespan() {return this._lifespan(); }
	/** @type {Sprite} */
	get sprite() {return this._sprite(); }
	/** @type {Rect} */
	get spriteRect() {return this._spriteRect(); }
	/** @type {Number} */
	get renderingLayer() {return this._renderingLayer(); }
	/** @type {Number} */
	get spriteAlpha() {return this._spriteAlpha; }

	/** @param {Vector2|Function} value */
	set size(value) 			{this._size = asFunction(value); }
	/** @param {Vector2|Function} value */
	set position(value) 		{this._position = asFunction(value); }
	/** @param {Vector2|Function} value */
	set velocity(value) 		{this._velocity = asFunction(value); }
	/** @param {Vector2|Function} value */
	set gravity(value) 			{this._gravity = asFunction(value); }
	/** @param {Number|Function} value */
	set lifespan(value) 		{this._lifespan = asFunction(value); }
	/** @param {Sprite|Function} value */
	set sprite(value) 			{this._sprite = asFunction(value); }
	/** @param {Rect|Function} value */
	set spriteRect(value) 		{this._spriteRect = asFunction(value); }
	/** @param {Number|Function} value */
	set renderingLayer(value)	{this._renderingLayer = asFunction(value); }
	/** @param {Number|Function} value */
	set spriteAlpha(value)		{this._spriteAlpha = asFunction(value); }

	get values() {
		return {
			size: new Vector2(this.size),
			position: new Vector2(this.position),
			velocity: new Vector2(this.velocity),
			gravity: new Vector2(this.gravity),
			lifespan: this.lifespan,
			sprite: this.sprite,
			spriteRect: this.spriteRect,
			renderingLayer: this.renderingLayer,
			spriteAlpha: this.spriteAlpha
		};
	}

	/**
	 * @callback ParticleUpdateCallback
	 * @param {ParticleObject} particle
	 */

	/**
	 * Calls the callback on every frame for the particle 
	 * @param {ParticleUpdateCallback} callback 
	 */
	onUpdate(callback) {
		this._listeners.on("update", callback);
	}

	/**
	 * @returns {ParticleObject}
	 * @param {GameObject} parent The parent object
	 */
	spawn(parent) {
		return GameObject.init(new ParticleObject(this.values, parent, this._listeners), this.renderingLayer);
	}
}

class ParticleSystem extends Component {

	/**
	 * @callback indexCallback
	 * @param {Number} length The length of the array to pick from
	 * @returns {Number} The index for the next particle in the particle array
	 */


	/**
	 * 
	 * @param {Object} options
	 * @param {Particle[]} options.particles	The particles to choose from
	 * @param {indexCallback} options.nextIndex	The next particle to spawn from the particles array
	 * @param {Number | Function} options.delay	The delay between spawning cycles
	 * @param {Number | Function} options.burst The amount of particles to spawn per cycle
	 * @param {Boolean} enabled Is the component enabled (false by defaults)
	 */
	constructor(options, enabled = false) {
		super(null, enabled);

		/** @type {Particle[]} */
		this.particles = options.particles;
		this.nextIndex = options.nextIndex || ((length) => Math.floor(Math.random() * length));
		this.delay = asFunction(options.delay, 20);
		this.burst = asFunction(options.burst, 1);
		this._currentDelay = 0;

		this.particlesObjects = [];
	}

	onDestroy() {
		
		for (const p of this.particlesObjects) {
			if (p.lifePercent < 1.0)
				p.destroy();
		}
	}

	/** 
	 * Shorthand for particleSystem.particles.push(particle)
	 * @param {Particle} particle
	 */
	addParticle(particle) {
		this.particles.push(particle);
	}

	update(tick) {
		this._currentDelay--;
		if (this._currentDelay > 0)
			return;
		this._currentDelay = this.delay();
		
		const burst = this.burst();
		for (let i = 0; i < burst; i++) {
			const particleIndex = this.nextIndex(this.particles.length);
			let obj = this.particles[particleIndex].spawn(this.gameObject);
			this.particlesObjects.push(obj);
		}
	}
}

export { COLLISION_CHECK_METHOD, Particle, ParticleSystem, colliders };
