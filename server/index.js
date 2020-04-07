/*jshint esversion: 6 */
const jello = require("./jelloLobby");
const express = require("express");
const app = express();
var server = require('http').Server(app);

const PORT = 80;
//const HOST = 'localhost';
const HOST = '192.168.0.165';
const jelloLog = jello.logLevels.All;

server.listen(PORT, HOST, () => {
	console.log(`Listening on ${PORT}`);
	console.log(`http://${HOST}:${PORT}/`);		
	jello.init(server, jelloLog);
});

app.use(express.static(`${__dirname}/../public/`, {extensions: ['html', 'js']}));
/*
http.listen(PORT, function(){
	console.log('listening on *:3000');
});*/