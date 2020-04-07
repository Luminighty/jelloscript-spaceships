
/* -------------------------------------
  				  CANVAS
   ------------------------------------- */
export const canvasConfig = {
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

export const debugMode = {
	isDebugOn: true,
	Collider: {
		bounds: false
	}
};



/* -------------------------------------
  				COLLISION
   ------------------------------------- */

/**
 * Possible collision tags
 * @enum
 */
export const colliderTags = {
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
export const collisionIgnoreMatrix = {
	default: [colliderTags.background],
	player: [colliderTags.player, colliderTags.playerMissile],
	playerMissile: [colliderTags.playerMissile],
	enemy: [colliderTags.missile],
};

/** How many times should the collision be checked between 2 positions */
export const collisionIterations = 1;

/** How close does 2 colliders can be before they collide */
export const minCollisionDistance = 0.4;