const cacheName = 'game';
const cacheFiles = [
	// Default ones
	'/',
	'manifest.json',
	 //'install.js',
	'index.html',
	'style.css',
	'js/engine/Utils.js',
	'js/engine/Struct.js',
	'js/engine/Sprite.js',
	'js/engine/Sound.js',
	'js/engine/run.js',
	'js/engine/Resource.js',
	'js/engine/ParticleSystem.js',
	'js/engine/Networking.js',
	'js/engine/InputManager.js',
	'js/engine/GameObject.js',
	'js/engine/EventHandler.js',
	'js/engine/Debug.js',
	'js/engine/Controller.js',
	'js/engine/Component.js',
	'js/engine/Collider.js',
	'js/engine/Camera.js',
	'js/engine/BoxCollider.js',
	'js/engine/BehaviourAnimator.js',
	'js/engine/Animator.js',

	// Main files
	'js/Assets.js',
	'js/Config.js',
	'js/Input.js',
	'js/Main.js',
	

	'media/input/axis.png',
	'media/input/btn_a.png',
	'media/input/btn_b.png',
];


self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(cacheName)
		.then(cache => {
			return cache.addAll(cacheFiles);
		})
	);
});



self.addEventListener("fetch", (event) => {

	event.respondWith(
		caches.match(event.request)
		.then((response) => {
			if (response)
				return response;
			return fetch(event.request);
		})
		.then((response) => {
			if (!response || response.status !== 200 || response.type !== "basic")
				return response;

			var responseClone = response.clone();
			caches.open(cacheName)
				.then((cache) => {
					return cache.put(event.request, responseClone);
				})
				.catch(err => {
					throw err;
				});
			return response;

		}).catch(err => {
			//404 page
		})
	);
});



self.addEventListener("activate", (event) => {
	const cacheWhiteList = [cacheName];

	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheWhiteList.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});