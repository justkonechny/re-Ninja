const canvas = document.getElementById('game');
canvas.focus()
const ctx = canvas.getContext('2d');


const SCALE = 50;

const boxes = [];

const world = new planck.World({gravity: new planck.Vec2(0,-10)});



const ground = world.createBody({position: new planck.Vec2(8, 0.5)});
ground.createFixture(new planck.Box(8, 0.5), {friction:0.6});

const roof = world.createBody({position: new planck.Vec2(8, 9.5)});
roof.createFixture(new planck.Box(8,0.5), {friction:0.6});

function makeWall(x, y, w, h) {
    const wall = world.createBody({position : new planck.Vec2(x, y)});
    wall.createFixture(new planck.Box(w, h), {friction:0.6})
}

makeWall(8,0.5,8,0.5)
makeWall(8,9.5,8,0.5)
makeWall(0.5,5,0.5,5)
makeWall(15.5,5,0.5,5)


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
makeBox(9,6)


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
let sim = 0.5
let acc = 0
let lastTime = performance.now();

function frame(now) {
    acc += (now - lastTime) / 1000;
    lastTime = now;
    acc = Math.min(acc, 0.25);

    while (acc >= DT) {
        if (sim > 0) {
            world.step(DT);
            sim -= DT;
        }
        
        acc -= DT;
    }

    draw();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);


let startX = 0;
let startY = 0;
let targetBox = null;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / SCALE;
    const clickY = (canvas.height - (e.clientY - rect.top)) / SCALE;

    startX = clickX
    startY = clickY

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

    targetBox = closest;

})

canvas.addEventListener('mouseup', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / SCALE; 
    const clickY = (canvas.height - (e.clientY - rect.top)) / SCALE;

    velX = (clickX - startX) * 2;
    velY = (clickY- startY) * 3;

    targetBox.setLinearVelocity(new planck.Vec2(velX, velY));
    targetBox.setAngularVelocity(2.0)
})

canvas.addEventListener('keydown', (e) => {
    if(e.key === ' ') {
        sim = 1
        console.log('worked')
    }
})