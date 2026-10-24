const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');


const SCALE = 50;

const boxes = [];

const world = new planck.World({gravity: new planck.Vec2(0,-10)});



const ground = world.createBody({position: new planck.Vec2(8, 0.5)});
ground.createFixture(new planck.Box(8, 0.5), {friction:0.6});

function makeBox(x, y) {
    const body = world.createBody({
        type: 'dynamic',
        position: new planck.Vec2(x, y),
    });
    body.createFixture(new planck.Box(0.5, 0.5), {
        density: 1,
        friction: 0.5,
        restitution: 0.2,

    });
    boxes.push(body);
    return body
}

makeBox(6, 6)
makeBox(6,6)


function toScreen(p) {
    return {x: p.x * SCALE, y: canvas.height - p.y * SCALE};
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let body = world.getBodyList(); body; body = body.getNext()) {
        for (let fix = body.getFixtureList(); fix; fix = fix.getNext()) {
            const shape = fix.getShape();
            ctx.beginPath();
            shape.m_vertices.forEach((v, i) => {
                const s = toScreen(body.getWorldPoint(v));
                if (i === 0) ctx.moveTo(s.x, s.y);
                else ctx.lineTo(s.x, s.y);
            });
            ctx.closePath();
            ctx.fillStyle = body.isDynamic() ? '#4a90d9' : '#555';
            ctx.fill();
            ctx.stroke();
        }
    }
}

const DT = 1 / 60;
let acc = 0
let lastTime = performance.now();

function frame(now) {
    acc += (now - lastTime) / 1000;
    lastTime = now;
    acc = Math.min(acc, 0.25);

    while (acc >= DT) {
        world.step(DT);
        acc -= DT;
    }

    draw();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);


canvas.addEventListener('click', (e) =>{
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / SCALE;
    const clickY = (canvas.height - (e.clientY - rect.top)) / SCALE;

    let closest = null;
    let closestDist = Infinity;

    for (const box of boxes) {
        const pos = box.getPosition();
        const dx = pos.x - clickX;
        const dy = pos.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist) {
            closestDist = dist;
            closest = box;
        }
    }

    if (closest) {
        closest.setLinearVelocity(new planck.Vec2((Math.random() - 0.5) * 5, 8));
    }

})