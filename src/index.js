import _ from 'lodash';
import Paddle from "./Paddle.js";
import Ball from "./Ball.js";
import InputHandler from "./input.js";

let canvas = document.getElementById("myCanvas");       // obiekt canvas
let ctx = canvas.getContext("2d");                      // odniesienie do context2D obiektu canvas

let leftScore = document.getElementById("leftScore");
let rightScore = document.getElementById("rightScore");

let gameDims = {
    width: canvas.width,
    height: canvas.height
}
let velocity = {
    dx: 2,
    dy: -2
}
let paddlesSpeed = 5;
let ballRadius = 10;
let imageBall = document.getElementById("img_ball");

let leftPaddle = new Paddle(10, 100, gameDims, paddlesSpeed, "left");
let rightPaddle = new Paddle(10, 100, gameDims, paddlesSpeed, "right");
let ball = new Ball(imageBall, ballRadius, gameDims, velocity);

let player = null;
let inputHandler = null;
let moveButtons = document.getElementsByClassName("movement-button");
// network logic
let socket = io();

socket.emit('which player', gameDims, function (msg) {
    player = msg;

    if (player == "left") {
        inputHandler = new InputHandler(leftPaddle);
        moveButtons[0].addEventListener("mousedown", mouseDown);
        moveButtons[0].addEventListener("mouseup", mouseUp);
        moveButtons[0].addEventListener("touchstart", mouseDown);
        moveButtons[0].addEventListener("touchend", mouseUp);
        moveButtons[1].addEventListener("mousedown", mouseDown);
        moveButtons[1].addEventListener("mouseup", mouseUp);
        moveButtons[1].addEventListener("touchstart", mouseDown);
        moveButtons[1].addEventListener("touchend", mouseUp);
    } else if (player == "right") {
        inputHandler = new InputHandler(rightPaddle);
        moveButtons[2].addEventListener("mousedown", mouseDown);
        moveButtons[2].addEventListener("mouseup", mouseUp);
        moveButtons[2].addEventListener("touchstart", mouseDown);
        moveButtons[2].addEventListener("touchend", mouseUp);
        moveButtons[3].addEventListener("mousedown", mouseDown);
        moveButtons[3].addEventListener("mouseup", mouseUp);
        moveButtons[3].addEventListener("touchstart", mouseDown);
        moveButtons[3].addEventListener("touchend", mouseUp);
    }
    alert("You are player " + player + "!");
});

socket.on('game loop', function (msg) {
    ball.position.x = msg.ball.position.x;
    ball.position.y = msg.ball.position.y;
    ball.velocity = msg.ball.velocity;
    ball.startVelocity = msg.ball.startVelocity;
    ball.velocityValue = msg.ball.velocityValue;

    rightPaddle.position.x = msg.rightP.position.x;
    rightPaddle.position.y = msg.rightP.position.y;
    rightPaddle.height = msg.rightP.height;

    leftPaddle.position.x = msg.leftP.position.x;
    leftPaddle.position.y = msg.leftP.position.y;
    leftPaddle.height = msg.leftP.height;

    if (player == "left") {
        
        socket.emit('left paddleState', leftPaddle.speed);
    } else if (player == "right") {

        socket.emit('right paddleState', rightPaddle.speed);
    }
});

socket.on('score', function (msg) {
    if (msg == "left") {
        leftScore.innerHTML = parseInt(leftScore.innerHTML) + 1;
    }
    if (msg == "right") {
        rightScore.innerHTML = parseInt(rightScore.innerHTML) + 1;
    }
});
socket.on('game end', function (msg) {
    clearInterval(gameLoop);
    alert("Player " + msg + " won!");
    
});

function mouseDown() {
    if (this.id === "movement-button1") leftPaddle.moveUp();
    if (this.id === "movement-button2") leftPaddle.moveDown();
    if (this.id === "movement-button3") rightPaddle.moveUp();
    if (this.id === "movement-button4") rightPaddle.moveDown();
}

function mouseUp() {
    if (this.id === "movement-button1") leftPaddle.speed = 0;
    if (this.id === "movement-button2") leftPaddle.speed = 0;
    if (this.id === "movement-button3") rightPaddle.speed = 0;
    if (this.id === "movement-button4") rightPaddle.speed = 0;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);
}
let gameLoop = setInterval(drawGame, 16);