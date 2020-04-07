
/**
 * @see https://github.com/Luminighty/jelloscript/wiki/Resource
 */
export default class Resource {

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