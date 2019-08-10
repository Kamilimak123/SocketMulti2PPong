export default class Ball {

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

    draw(ctx) {
        ctx.beginPath();
        //ctx.drawImage(this.image,this.position.x,this.position.y,this.radius,this.radius);
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }

}