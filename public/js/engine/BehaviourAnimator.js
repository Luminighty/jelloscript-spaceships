import Animator from "./Animator";

/**
 * @todo Not implemented yet
 */
export default class BehaviourAnimator extends Animator {

	constructor(gameObject, sprite, spriteRect) {
		super(gameObject, sprite, spriteRect);
		this.nodes = [];
		this.currentNode = null;
	}

	animate() {
		this.sprite = this.currentNode.sprite();
		this.spriteRect = this.currentNode.rect();
		const newNodeId = this.currentNode.nextNode();
		if (newNodeId != null)
			this.setNode(newNodeId);
	}

	setNode(nodeId) {
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			if (node.id == nodeId) {
				this.currentNode = node;
				return;
			}
		}
	}

	/**
	 * @callback getSprite
	 * @return {Sprite} The sprite to be rendered
	 * 
	 * @callback getRect
	 * @returns {Rect} The rect on the sprite
	 *
	 * @callback nextNode
	 * @returns {Node} Null or the next node to be played defined by it's id
	 */
	/**
	 * 
	 * @param {Any} id The node's Id
	 * @param {getSprite} getSprite A callback. Returns the sprite to be rendered
	 * @param {getRect} getRect A callback. Returns the rect on the sprite
	 * @param {nextNode} nextNode A callback. Returns null or the next node to be played defined by it's id
	 * @param {Boolean} defaultNode Whenever this is the default node or not. If none set the first node to be added is the default one
	 */
	addNode(id, getSprite, getRect, nextNode, defaultNode = false) {
		const node = {
			id: id,
			sprite: getSprite,
			rect: getRect,
			nextNode: nextNode
		};
		this.nodes.push(node);
		if (defaultNode || this.nodes.length == 2)
			this.currentNode = node;
	}

}