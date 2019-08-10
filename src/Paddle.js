export default class Paddle {

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

    moveUp(){
        this.speed = -this.maxSpeed;
    }

    moveDown(){
        this.speed = this.maxSpeed;
    }

    draw(ctx) {
        // draw paddle
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();

        // draw paddle center
        ctx.beginPath();
        ctx.arc(this.position.x + 5, this.position.y + this.height / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.closePath();
    }


}