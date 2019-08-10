class Ball {

    constructor(image, radius, gameDims, velocity) {

        this.image = image;
        this.radius = radius;
        this.position = {
            x: gameDims.width / 2,
            y: gameDims.height / 2
        }
        this.velocity = velocity;
        this.startVelocity = velocity.dx * velocity.dx + velocity.dy * velocity.dy;
        this.velocityValue = velocity.dx * velocity.dx + velocity.dy * velocity.dy;

    }
}

class Paddle {

    constructor(paddleWidth, paddleHeight, gameDims, maxSpeed, player) {

        this.width = paddleWidth;
        this.height = paddleHeight;
        this.gameDims = gameDims;
        this.speed = 0;
        this.maxSpeed = maxSpeed;

        if (player === "left") {
            this.position = {
                x: 0,
                y: (gameDims.height - paddleHeight) / 2
            }
        } else if (player === "right") {
            this.position = {
                x: gameDims.width - 10,
                y: (gameDims.height - paddleHeight) / 2
            }
        }
    }

    moveUp() {
        this.speed = -this.maxSpeed;
    }

    moveDown() {
        this.speed = this.maxSpeed;
    }

}

let gameDims = null;
let velocity = {
    dx: 2,
    dy: -2
}
let paddlesSpeed = 5;
let ballRadius = 10;

let ball = null;
let leftPaddle = null;
let rightPaddle = null;

// server init
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
const path = require('path');

// serve index.html
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const BUNDLE = path.join(__dirname, 'bundle.js');
const STYLES = path.join(__dirname, 'styles.css');

app.get('/', function (req, res) {
    res.sendFile(INDEX);
});
app.get('/bundle.js', function (req, res) {
    res.sendFile(BUNDLE);
});
app.get('/styles.css', function (req, res) {
    res.sendFile(STYLES);
});

// users list
let Users = [];

// search for user of given attribute name and value, returns user data and index
function getUserByAnything(attribute, value) {
    let i = 0;
    if (Users.length <= i) { return false; }
    while (Users[i][attribute] !== value || (Users.length <= i)) {
        i++;
        if (Users.length <= i) { return false; }
    }
    if (Users.length <= i) { return false; }
    let user = {
        data: Users[i],
        index: i
    }
    return user;
}

// search for users of given attribute name and value, returns list of users attributes
function getUsersListByAnything(attribute, getattribute, value) {
    let i = 0;
    let usersList = [];
    for (i = 0; i < Users.length; i++) {
        if (Users[i][attribute] == value) {
            usersList.push(Users[i][getattribute]);
        }
    }
    return usersList;
}

function movePaddles() {
    if (rightPaddle.speed > 0) {
        if (rightPaddle.position.y < gameDims.height - rightPaddle.height) {
            rightPaddle.position.y += rightPaddle.speed;
        }
    }
    if (rightPaddle.speed < 0) {
        if (rightPaddle.position.y > 0) {
            rightPaddle.position.y += rightPaddle.speed;
        }
    }
    if (leftPaddle.speed > 0) {
        if (leftPaddle.position.y < gameDims.height - leftPaddle.height) {
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
    if (ball.position.x + ball.velocity.dx > gameDims.width - ball.radius) {
        if (ball.position.y > rightPaddle.position.y - ball.radius && ball.position.y < rightPaddle.position.y + rightPaddle.height + ball.radius) {

            calcHit("right");

        } else {
            scoreCheck("left");
        }

    }
    if (ball.position.x + ball.velocity.dx < ball.radius) {
        if (ball.position.y > leftPaddle.position.y - ball.radius && ball.position.y < leftPaddle.position.y + leftPaddle.height + ball.radius) {

            calcHit("left");

        } else {
            scoreCheck("right");
        }

    }
    if (ball.position.y + ball.velocity.dy > gameDims.height - ball.radius || ball.position.y + ball.velocity.dy < ball.radius) {
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
    ball.position.x = gameDims.width / 2;
    ball.position.y = gameDims.height / 2;
    ball.velocity.dx = 0;
    ball.velocity.dy = 0;
    ball.velocityValue = ball.startVelocity;
    if (scorer == "left") {
        //leftScore.innerHTML = parseInt(leftScore.innerHTML) + 1;
        io.emit('score',"left");
        leftPaddle.height = leftPaddle.height - 10;
        setTimeout(function () { ball.velocity.dx = -2; ball.velocity.dy = 0 }, 2000);
    }
    if (scorer == "right") {
        //rightScore.innerHTML = parseInt(rightScore.innerHTML) + 1;
        io.emit('score',"right");
        rightPaddle.height = rightPaddle.height - 10;
        setTimeout(function () { ball.velocity.dx = 2; ball.velocity.dy = 0 }, 2000);
    }
}

let imageBall = null;
function gameStart() {
    console.log("game starts!")
    ball = new Ball(imageBall, ballRadius, gameDims, velocity);
    leftPaddle = new Paddle(10, 100, gameDims, paddlesSpeed, "left");
    rightPaddle = new Paddle(10, 100, gameDims, paddlesSpeed, "right");
    gameLoopInterval = setInterval(gameLoop, 16);
}

function gameLoop() {
    checkWalls();
    movePaddles();
    moveBall();
    let gameState = {
        ball: ball,
        leftP: leftPaddle,
        rightP: rightPaddle
    }

    io.emit('game loop', gameState);
}

let gameLoopInterval = null;

// on user connected
io.on('connection', function (socket) {
    console.log('new user connected');

    socket.on('which player', function (gameDim, fn) {
        let user = {
            socketid: socket.id,
            side: ""
        }
        if (Users.length < 2) {
            if (Users.length == 0) {
                user.side = "left";
                Users.push(user);
                gameDims = gameDim;
            }
            else {
                user.side = "right";
                Users.push(user);
            }
            console.log(user.side + " player has joined the game!")
            fn(user.side);
        }
        if (Users.length == 2) {
            setTimeout(gameStart, 10000);
        }
    });

    socket.on('left paddleState', function (msg) {
        leftPaddle.speed = msg;
        //console.log("left paddleState");
    });
    socket.on('right paddleState', function (msg) {
        rightPaddle.speed = msg;
        //console.log("right paddleState");
    });

    // on user disconnected
    socket.on('disconnect', function () {
        let user = getUserByAnything("socketid", socket.id);
        if (user !== false) {
            Users.splice(user.index, 1);
            console.log(user.data.side + " player has left the game!");
        } else console.log("Spectator has left the game!");

    });
});

http.listen(PORT, function () {
    console.log('listening on *:' + PORT);
});