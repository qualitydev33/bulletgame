export default class Particle {
    constructor(canvas, friction, x, y, radius, color, velocity) {
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = friction;
    }
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}