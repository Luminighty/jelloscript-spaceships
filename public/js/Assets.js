import Sound from "./engine/Sound";
import Sprite from "./engine/Sprite";

export const sprites = {
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

export const sounds = {
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