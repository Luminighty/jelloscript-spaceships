import { canvasConfig } from "./Config";

export default class Slider extends HTMLElement {

	static css = `
		#slider {
			position: relative;
			left: 0px;
			top: 0px;
			width: 200px;
			background-color: #475561;
			margin-bottom: 20px;
		}
		#slider div {
			background-color: #0cff8f;
			padding-top: 10px;
			padding-bottom: 10px;
			width: 100%;
		}
	`;

	static html = `
		<div id="slider">
			<div></div>
		</div>
	`;

	constructor() {
		super();
		
		this._value = 1;
		this.maxValue = 1;
		this.attachShadow({mode: "open"});
	}

	connectedCallback() {
		
		this.shadowRoot.innerHTML = `<style>${Slider.css}</style>`;
		this.shadowRoot.innerHTML += Slider.html;
		this.slider = this.shadowRoot.querySelector("#slider").children[0];
	}

	set value(value) { 
		this._value = value;
		this.slider.style.width = `${(value / this.maxValue) * 100}%`;
	}

	get value() {return this._value;}

}
