export default class InputHandler {

    constructor(paddle) {
        this.gamePause = false;
        document.addEventListener("keydown", e => {
            if (e.key == "Up" || e.key == "ArrowUp") {
                paddle.moveUp();
            }
            else if (e.key == "Down" || e.key == "ArrowDown") {
                paddle.moveDown();
            }
            if (e.key == "w") {
                paddle.moveUp();
            }
            else if (e.key == "s") {
                paddle.moveDown();
            }
            // if (!this.gamePause) {
            //     if (e.key == "p") {
            //         alert("Pause");
            //         this.gamePause = true;
            //     }
            // }
        });
        document.addEventListener("keyup", e => {
            if (e.key == "Up" || e.key == "ArrowUp") {
                paddle.speed = 0;
            }
            else if (e.key == "Down" || e.key == "ArrowDown") {
                paddle.speed = 0;
            }
            if (e.key == "w") {
                paddle.speed = 0;
            }
            else if (e.key == "s") {
                paddle.speed = 0;
            }
            // if (e.key == "p") {
            //     this.gamePause = false;
            // }
        });
    }
}