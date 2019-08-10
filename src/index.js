import _ from 'lodash';
import Paddle from "./Paddle.js";
import Ball from "./Ball.js";
import InputHandler from "./input.js";

let canvas = document.getElementById("myCanvas");       // obiekt canvas
let ctx = canvas.getContext("2d");                      // odniesienie do context2D obiektu canvas

let leftScore = document.getElementById("leftScore");
let rightScore = document.getElementById("rightScore");
let gamePause = false;

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



// for (let i = 0; i < moveButtons.length; i++) {
//     moveButtons[i].addEventListener("mousedown", mouseDown);
//     moveButtons[i].addEventListener("mouseup", mouseUp);
//     moveButtons[i].addEventListener("touchstart", mouseDown);
//     moveButtons[i].addEventListener("touchend", mouseUp);
// }



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

function movePaddles() {
    if (rightPaddle.speed > 0) {
        if (rightPaddle.position.y < canvas.height - rightPaddle.height) {
            rightPaddle.position.y += rightPaddle.speed;
        }
    }
    if (rightPaddle.speed < 0) {
        if (rightPaddle.position.y > 0) {
            rightPaddle.position.y += rightPaddle.speed;
        }
    }
    if (leftPaddle.speed > 0) {
        if (leftPaddle.position.y < canvas.height - leftPaddle.height) {
            leftPaddle.position.y += leftPaddle.speed;
        }
    }
    if (leftPaddle.speed < 0) {
        if (leftPaddle.position.y > 0) {
            leftPaddle.position.y += leftPaddle.speed;
        }
    }
}

function moveBall() {
    ball.position.x += ball.velocity.dx;
    ball.position.y += ball.velocity.dy;
}


function checkWalls() {
    if (ball.position.x + ball.velocity.dx > canvas.width - ball.radius) {
        if (ball.position.y > rightPaddle.position.y - ball.radius && ball.position.y < rightPaddle.position.y + rightPaddle.height + ball.radius) {

            calcHit("right");

        } else {
            scoreCheck(leftScore);
        }

    }
    if (ball.position.x + ball.velocity.dx < ball.radius) {
        if (ball.position.y > leftPaddle.position.y - ball.radius && ball.position.y < leftPaddle.position.y + leftPaddle.height + ball.radius) {

            calcHit("left");

        } else {
            scoreCheck(rightScore);
        }

    }
    if (ball.position.y + ball.velocity.dy > canvas.height - ball.radius || ball.position.y + ball.velocity.dy < ball.radius) {
        ball.velocity.dy = -ball.velocity.dy;
    }
}

function calcHit(hitter) {
    if (hitter == "left") {
        ball.velocity.dy = (ball.position.y - leftPaddle.position.y) / ((leftPaddle.height + 2 * ball.radius) / 4) - 2;
    }
    if (hitter == "right") {
        ball.velocity.dy = (ball.position.y - rightPaddle.position.y) / ((rightPaddle.height + 2 * ball.radius) / 4) - 2;
    }

    ball.velocity.dx = Math.sqrt(ball.velocityValue - (ball.velocity.dy * ball.velocity.dy));
    if (isNaN(ball.velocity.dx)) { ball.velocity.dx = 1; }

    if (hitter == "left") {
        if (ball.velocity.dx < 0) { ball.velocity.dx = -ball.velocity.dx; }
    }
    if (hitter == "right") {
        if (ball.velocity.dx > 0) { ball.velocity.dx = -ball.velocity.dx; }
    }

    ball.velocityValue = ball.velocityValue + 2;
}

function scoreCheck(scorer) {
    ball.position.x = canvas.width / 2;
    ball.position.y = canvas.height / 2;
    ball.velocity.dx = 0;
    ball.velocity.dy = 0;
    ball.velocityValue = ball.startVelocity;
    if (scorer == leftScore) {
        leftScore.innerHTML = parseInt(leftScore.innerHTML) + 1;
        leftPaddle.height = leftPaddle.height - 10;
        setTimeout(function () { ball.velocity.dx = -2; ball.velocity.dy = 0 }, 2000);
    }
    if (scorer == rightScore) {
        rightScore.innerHTML = parseInt(rightScore.innerHTML) + 1;
        rightPaddle.height = rightPaddle.height - 10;
        setTimeout(function () { ball.velocity.dx = 2; ball.velocity.dy = 0 }, 2000);
    }
}


function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);


    // checkWalls();
    // movePaddles();
    // moveBall();


    // if (rightPaddle.height == 0) {
    //     window.clearInterval(gameLoop);
    //     alert("Right Wins!!!")
    // }
    // if (leftPaddle.height == 0) {
    //     window.clearInterval(gameLoop);
    //     alert("Left Wins!!!")
    // }



}
//setTimeout(function () { alert("Enjoy the game :)"); }, 50);
let gameLoop = setInterval(drawGame, 16);