const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

let gameRunning = false;
let gameOver = false;
let gameWon = false;
let startTime = 0;
const GAME_DURATION = 5 * 60 * 1000; // 5 minutes

// Game state
const game = {
    credits: 0,
    defenses: [],
    daggyAnger: 0,
    daggyAngerThreshold: 30000
};

// X position
const X = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    health: 100
};

// Daggy object
const daggy = {
    x: 100,
    y: 100,
    speed: 2,
    health: 100
};

// Weapon
const weapon = {
    lastHitTime: 0,
    cooldown: 1000,
    range: 100
};

class Defense {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.health = 100;
        
        switch(type) {
            case 'portal':
                this.width = 40;
                this.height = 40;
                this.linkedPortal = null;
                break;
            case 'barricade':
                this.width = 60;
                this.height = 60;
                break;
            case 'laser':
                this.width = 50;
                this.height = 50;
                this.shotsLeft = 3;
                this.lastShot = 0;
                this.shotCooldown = 30000;
                break;
            case 'slingshot':
                this.width = 80;
                this.height = 30;
                this.active = true;
                break;
            case 'cactus':
                this.width = 40;
                this.height = 50;
                this.health = 3;
                break;
        }
    }
    
    draw(ctx) {
        switch(this.type) {
            case 'portal':
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#00aa00';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
            case 'barricade':
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                break;
            case 'laser':
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.shotsLeft, this.x, this.y + 5);
                break;
            case 'slingshot':
                ctx.strokeStyle = '#0000ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.x - this.width/2, this.y);
                ctx.lineTo(this.x + this.width/2, this.y);
                ctx.stroke();
                break;
            case 'cactus':
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                ctx.fillStyle = '#00aa00';
                for(let i = 0; i < 4; i++) {
                    ctx.fillRect(this.x - this.width/2 - 10, this.y - 15 + i * 15, 10, 8);
                }
                break;
        }
    }
}

function startGame() {
    document.getElementById('introScreen').style.display = 'none';
    gameRunning = true;
    gameOver = false;
    gameWon = false;
    startTime = Date.now();
    game.credits = 0;
    game.defenses = [];
    daggy.health = 100;
    X.health = 100;
    daggy.x = 100;
    daggy.y = 100;
    gameLoop();
}

function drawDaggy() {
    const x = daggy.x;
    const y = daggy.y;
    
    // NEON RED GLOW
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // BODY - Main chunky rectangle
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x - 40, y - 5, 80, 65);
    
    // HEAD - Square head on top
    ctx.fillRect(x - 45, y - 50, 90, 50);
    
    // LEFT EAR - Small square
    ctx.fillRect(x - 55, y - 65, 20, 20);
    
    // RIGHT EAR - Small square
    ctx.fillRect(x + 35, y - 65, 20, 20);
    
    // FRONT LEFT LEG
    ctx.fillRect(x - 50, y + 60, 18, 40);
    
    // FRONT RIGHT LEG
    ctx.fillRect(x + 32, y + 60, 18, 40);
    
    // BACK LEFT LEG
    ctx.fillRect(x - 35, y + 60, 15, 35);
    
    // BACK RIGHT LEG - BROKEN (angled)
    ctx.save();
    ctx.translate(x + 20, y + 60);
    ctx.rotate(0.35);
    ctx.fillRect(0, 0, 15, 35);
    ctx.restore();
    
    // TAIL - sticking out
    ctx.fillRect(x + 45, y, 18, 50);
    
    // RESET SHADOW
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // LEFT EYE - Black square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 28, y - 38, 14, 14);
    
    // LEFT EYE - Orange glow inside
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(x - 26, y - 36, 10, 10);
    
    // RIGHT EYE - Black square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 14, y - 38, 14, 14);
    
    // RIGHT EYE - Orange glow inside
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(x + 16, y - 36, 10, 10);
    
    // MOUTH - White teeth area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 18, y - 18, 36, 12);
    
    // TEETH - Black lines/divisions
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    for(let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 18 + (i * 6), y - 18);
        ctx.lineTo(x - 18 + (i * 6), y - 6);
        ctx.stroke();
    }
    
    // WIRES sticking out - YELLOW
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    
    // Left wire
    ctx.beginPath();
    ctx.moveTo(x - 45, y);
    ctx.lineTo(x - 65, y - 20);
    ctx.stroke();
    
    // Right wire
    ctx.beginPath();
    ctx.moveTo(x + 45, y);
    ctx.lineTo(x + 65, y - 20);
    ctx.stroke();
    
    // Center wire
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x, y + 40);
    ctx.stroke();
}

function drawX() {
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', X.x, X.y);
    ctx.shadowColor = 'transparent';
}

function updateDaggyAI() {
    const dx = X.x - daggy.x;
    const dy = X.y - daggy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if(distance > 5) {
        daggy.x += (dx / distance) * daggy.speed;
        daggy.y += (dy / distance) * daggy.speed;
    }
    
    for(let defense of game.defenses) {
        const ddx = defense.x - daggy.x;
        const ddy = defense.y - daggy.y;
        const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
        
        if(ddist < (defense.width/2 + 50)) {
            switch(defense.type) {
                case 'portal':
                    if(!defense.linkedPortal) {
                        defense.linkedPortal = game.defenses.find(d => d.type === 'portal' && d !== defense);
                    }
                    if(defense.linkedPortal) {
                        daggy.x = defense.linkedPortal.x;
                        daggy.y = defense.linkedPortal.y;
                    }
                    break;
                case 'barricade':
                    const pushDistance = 60;
                    daggy.x -= (ddx / ddist) * pushDistance;
                    daggy.y -= (ddy / ddist) * pushDistance;
                    defense.health -= 5;
                    if(defense.health <= 0) {
                        game.defenses.splice(game.defenses.indexOf(defense), 1);
                    }
                    break;
                case 'laser':
                    if(Date.now() - defense.lastShot > defense.shotCooldown && defense.shotsLeft > 0) {
                        defense.lastShot = Date.now();
                        defense.shotsLeft--;
                        const pushDist = 150;
                        daggy.x -= (ddx / ddist) * pushDist;
                        daggy.y -= (ddy / ddist) * pushDist;
                        if(defense.shotsLeft <= 0) {
                            game.defenses.splice(game.defenses.indexOf(defense), 1);
                        }
                    }
                    break;
                case 'slingshot':
                    if(defense.active) {
                        defense.active = false;
                        const pushDist = 200;
                        daggy.x -= (ddx / ddist) * pushDist;
                        daggy.y -= (ddy / ddist) * pushDist;
                        setTimeout(() => {
                            game.defenses.splice(game.defenses.indexOf(defense), 1);
                        }, 500);
                    }
                    break;
                case 'cactus':
                    daggy.speed = 1;
                    break;
            }
        }
    }
}

function drawUI() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    document.getElementById('timerDisplay').textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('creditsDisplay').textContent = `Credits: ${game.credits}`;
    document.getElementById('healthDisplay').textContent = `X Health: ${X.health}%`;
    
    if(remaining === 0 && gameRunning) {
        endGame(true);
    }
}

function endGame(won) {
    gameRunning = false;
    gameOver = true;
    gameWon = won;
    
    const screen = document.getElementById('gameOverScreen');
    const msg = document.getElementById('gameOverMsg');
    
    if(won) {
        document.getElementById('gameOverText').textContent = 'YOU WIN!';
        msg.textContent = `Congratulations! You survived 5 minutes with ${game.credits} credits!`;
    } else {
        document.getElementById('gameOverText').textContent = 'GAME OVER';
        msg.textContent = 'Daggy reached the X!';
    }
    
    screen.classList.remove('hidden');
}

function jumpscare() {
    canvas.style.filter = 'brightness(0) contrast(2)';
    setTimeout(() => {
        canvas.style.filter = 'brightness(1) contrast(1)';
    }, 200);
}

canvas.addEventListener('click', (e) => {
    if(!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const now = Date.now();
    if(now - weapon.lastHitTime > weapon.cooldown) {
        const dx = x - daggy.x;
        const dy = y - daggy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if(distance < weapon.range) {
            weapon.lastHitTime = now;
            game.credits += 10;
            daggy.health -= 20;
            
            daggy.x -= (dx / distance) * 50;
            daggy.y -= (dy / distance) * 50;
        }
    }
});

document.querySelectorAll('.shopBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if(!gameRunning) return;
        
        const item = e.target.dataset.item;
        const costs = { portal: 150, barricade: 50, laser: 250, slingshot: 100, cactus: 10 };
        const cost = costs[item];
        
        if(game.credits >= cost) {
            game.credits -= cost;
            
            const x = Math.random() * (canvas.width - 200) + 100;
            const y = Math.random() * (canvas.height - 200) + 100;
            
            game.defenses.push(new Defense(item, x, y));
        }
    });
});

function gameLoop() {
    ctx.fillStyle = '#0a0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for(let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    if(gameRunning) {
        updateDaggyAI();
        drawUI();
        
        const dx = X.x - daggy.x;
        const dy = X.y - daggy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if(distance < 60) {
            jumpscare();
            endGame(false);
        }
        
        game.daggyAnger += 16;
        if(game.daggyAnger > game.daggyAngerThreshold) {
            jumpscare();
            game.daggyAnger = 0;
        }
    }
    
    drawX();
    
    for(let defense of game.defenses) {
        defense.draw(ctx);
    }
    
    drawDaggy();
    
    if(gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}