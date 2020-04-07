
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('service-worker.js')
	  .catch(function(err) {
		console.error(err);
	});
 } else {
	 console.log("serviceWorker not supported");
	 
 }


window.addEventListener('beforeinstallprompt', (e) => {
	//console.log(e.platforms);
	e.userChoice.then((res) => {
		console.log(res);
	}).catch((err) => {
		console.log(err);
	});
	
});



