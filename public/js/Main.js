import { main } from "./engine/run";
import GameObject from './engine/GameObject';
import { sounds, sprites } from "./Assets";
import Player from './Player';
import * as Input from "./Input";
import NetworkManager from "./engine/Networking";
import { ParticleSystem, Particle } from "./engine/ParticleSystem";
import { Vector2 } from "./engine/Struct";
import * as Utils from "./engine/Utils";
import { Spawner } from "./Enemy";
import Slider from "./Slider";
import { canvasConfig } from "./Config";

document.title = "Spaceships";

window.players = [];

/** @type {("PURPLE" | "BLUE" | "GREEN")} */
const playerColor = null;

const ui = document.querySelector(canvasConfig.uiContainerQuery);
const startText = document.querySelector("#startText");
const menu = document.querySelector("#menu");
const lobbies = document.querySelector("#lobbies");


customElements.define('game-slider', Slider);

const spawner = new Spawner();
let isInLobby = false;
let isHost = true;
let isStarted = false;
spawner.enabled = false;

let couchMode = false;

const particleHolder = GameObject.init(new GameObject(), 0);
const players = [];
window.main = main(() => {
	
	Input.OnNewControllerListener(onNewController);
	InitStarParticles();
	GameObject.init(spawner);
});



/**
 * 
 * @param {import("./engine/InputManager").Inputs} input 
 * @param {*} id 
 */
function onNewController(input, id) {		
	const health = document.createElement("game-slider");
	ui.appendChild(health);

	const player = new Player(input, playerColor, health);
	players.push(player);
	Input.OnGetControllerState(id, () => {
		return {position: player.localPosition, color: player.label, health: player.health};
	});

	Input.OnSetControllerState(id, (data) => {
		if (data) {
			player.localPosition = data.position;
			player.label = data.color;
			health.value = data.health;
		}
	});
	input.Buttons.A.onPressed(StartGame);

	GameObject.init(player, 10);
}

function checkCouchMode() {
	if (!couchMode)
		return;
	particleHolder.enabled = false;
	spawner.enabled = false;
	ui.style.display = "none";
}

function StartGame() {
	if (!isInLobby || isStarted || !isHost)
		return;
	isStarted = true;
	startText.remove();
	spawner.enabled = !couchMode;
	sounds.MUSIC.bgm.play();
	NetworkManager.sendMessage("start game");
}

NetworkManager.onMessage("start game", () => {
	startText.style.display = "none";
	checkCouchMode();
});

function InitStarParticles() {
	const particle = new Particle({
		position: () => [Math.random() * 640, -5],
		velocity: () => [0, Math.random() * 0.3 + 0.5],
		gravity: Vector2.zero,
		sprite: sprites.stars,
		spriteRect: () => {
			const value = Utils.decide([100, 10, 1]);
			return sprites.stars.getSpriteRect(value, 0);
			},
		lifespan: 1000,
		renderingLayer: 0,
	});

	const particleSystem = new ParticleSystem({
		particles: [particle],
		delay: () => Math.random() * 50,
	}, true);
	particleHolder.addComponent(particleSystem);
}

NetworkManager.setStateGetter(() => {
	return {isStarted};
});


NetworkManager.setStateSetter((data) => {
	console.log(data);
	startText.style.display = (data.isStarted) ? "none" : "block";
});


NetworkManager.onLobbiesRefreshed((lobbylist) => {
	while (lobbies.childElementCount > 1) {
		lobbies.removeChild(lobbies.firstChild);
	}


	lobbylist.forEach((lobby) => {
		const element = document.createElement("div");
		element.innerText = lobby.lobbyName;
		element.classList.add("button");
		element.classList.add("lobby");

		element.addEventListener("click", () => {
			NetworkManager.connect(lobby);
			lobbies.style.display = "none";
			startText.innerText = "Waiting for host...";
			startText.style.display = "block";
			isHost = false;
			checkCouchMode();
		});

		lobbies.insertBefore(element, lobbies.firstChild);
	});

});

document.querySelector("#local").addEventListener("click", (e) => {
	isInLobby = true;
	menu.style.display = "none";
	startText.innerText = "Press button A to start!";
	startText.style.display = "block";
});

document.querySelector("#toMenu").addEventListener("click", (e) => {
	menu.style.display = "block";
	lobbies.style.display = "none";
});

document.querySelector("#host").addEventListener("click", (e) => {
	isInLobby = true;
	menu.style.display = "none";
	startText.innerText = "Press button A to start!";
	startText.style.display = "block";
	NetworkManager.host(prompt("Lobby name"));
});

document.querySelector("#connect").addEventListener("click", (e) => {
	NetworkManager.refreshLobbies();
	lobbies.style.display = "block";
	menu.style.display = "none";
});

const couchModeElement = document.querySelector("#couchMode");
if (Utils.mobileAndTabletCheck()) {
	couchModeElement.style.display = "block";
}

couchModeElement.addEventListener("click", () => {
	couchMode = !couchMode;
	if (couchMode) {
		couchModeElement.innerText = "Couch Mode ON";
		couchModeElement.classList.add("on");
	} else {
		couchModeElement.innerText = "Couch Mode OFF";
		couchModeElement.classList.remove("on");
	}
});