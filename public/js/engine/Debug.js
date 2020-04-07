
let debugCount = 0;
export let currentDebugs = {};


// TODO: substract camera position
/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} w 
 * @param {Number} h 
 * @param {String} color 
 * @param {Number} time 
 */
export function drawRect(x,y,w,h,color="red",time=1) {
	x = Math.round(x) + 0.5;
	y = Math.round(y) + 0.5;
	w = Math.round(w) - 1;
	h = Math.round(h) - 1;
	const id = debugCount++;
	/**
	 * @param {CanvasRenderingContext2D} canvas 
	 */
	let draw = function (canvas) {
		time--;
		if (time <= 0)
			delete currentDebugs[id];
		canvas.beginPath();
		canvas.strokeStyle = color;
		canvas.lineWidth = 1;
		canvas.moveTo(x,y);
		canvas.lineTo(x+w,y);
		canvas.lineTo(x+w,y+h);
		canvas.lineTo(x,y+h);
		canvas.lineTo(x,y);
		canvas.stroke();
	};

	currentDebugs[id] = draw;
}