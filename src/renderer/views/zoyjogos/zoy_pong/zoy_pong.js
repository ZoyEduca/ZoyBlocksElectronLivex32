/* -----------------------------------------------------------------
   Zoy Pong 2D — Controle Serial (Estabilidade Máxima de Renderização)
   ----------------------------------------------------------------- */

// --- Variáveis Globais ---
let lastDistance = 20;
let player;
let ball;
let opponentPaddle;
let distanceDisplayElement;
let player1Score = 0;
let player2Score = 0;

// Dimensões e Constantes
const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 20;


// ------------------------ Controle IPC (Electron) ------------------------
if (window.electronAPI && window.electronAPI.onDadosSerial) {
    window.electronAPI.onDadosSerial((serialData) => {
        const dataString = serialData.toString().trim();
        const distanceMatch = dataString.match(/(\d+\.?\d*)/);

        if (distanceMatch) {
            const distance = parseFloat(distanceMatch[1]);
            lastDistance = Phaser.Math.Clamp(distance, 5, 40);
        }
    });
}


// ------------------------ Mapeamento do Sensor ------------------------
function mapDistanceToPaddleY(distance) {
    const mappedY = Phaser.Math.Linear(distance, 5, 40, 540, 100);
    return Phaser.Math.Clamp(mappedY, PADDLE_HEIGHT / 2, GAME_HEIGHT - PADDLE_HEIGHT / 2);
}


// ------------------------ FUNÇÕES DE JOGO (Phaser) ------------------------

function startGame(scene) {
    ball.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    ball.body.setVelocity(0);

    const directionX = Math.random() < 0.5 ? 1 : -1;
    const initialSpeed = 300;

    ball.body.setVelocityX(initialSpeed * directionX);
    ball.body.setVelocityY(Phaser.Math.FloatBetween(-150, 150));
}

function hitPaddle(ball, paddle) {
    let newVelocityX = ball.body.velocity.x * 1.05;
    ball.body.setVelocityX(newVelocityX);

    const diff = ball.y - paddle.y;
    ball.body.setVelocityY(ball.body.velocity.y + diff * 5);
}

function updateScoreDisplay(element) {
    if (element) {
        element.innerHTML = `Jogador 1 (Sensor): <b>${player1Score}</b> | Jogador 2 (CPU): ${player2Score} | Distância: <span id="distanceValue">${lastDistance.toFixed(1)}</span> cm`;
    }
}

function goBackToMenu() {
    if (window.electronAPI && window.electronAPI.goBack) {
        window.electronAPI.goBack();
    } else {
        window.location.href = 'zoy_jogos.html';
    }
}


// ------------------------ ESTRUTURA DA CENA ------------------------

function preload() {}

function create() {
    const scene = this;
    window._zoy_scene = scene;

    scene.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    scene.cameras.main.setBackgroundColor('#000000');

    const playerX = PADDLE_WIDTH / 2 + 10;
    const cpuX = GAME_WIDTH - PADDLE_WIDTH / 2 - 10;

    // 1. RAQUETE JOGADOR (Sensor)
    player = scene.add.rectangle(playerX, GAME_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT, 0x2ecc71);
    player.setOrigin(0.5);

    scene.physics.add.existing(player);
    player.body.setImmovable(true);
    player.body.setCollideWorldBounds(true);
    player.body.setSize(PADDLE_WIDTH, PADDLE_HEIGHT);
    player.body.setOffset(-PADDLE_WIDTH / 2, -PADDLE_HEIGHT / 2);

    // 2. CPU
    opponentPaddle = scene.add.rectangle(cpuX, GAME_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT, 0xe74c3c);
    opponentPaddle.setOrigin(0.5);

    scene.physics.add.existing(opponentPaddle);
    opponentPaddle.body.setImmovable(true);
    opponentPaddle.body.setCollideWorldBounds(true);
    opponentPaddle.body.setSize(PADDLE_WIDTH, PADDLE_HEIGHT);
    opponentPaddle.body.setOffset(-PADDLE_WIDTH / 2, -PADDLE_HEIGHT / 2);

    // 3. BOLA
    ball = scene.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, BALL_SIZE / 2, 0xffa500);
    ball.setOrigin(0.5);

    scene.physics.add.existing(ball);
    ball.body.setCircle(BALL_SIZE / 2);
    ball.body.setOffset(-BALL_SIZE / 2, -BALL_SIZE / 2);
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(1, 1);

    // Linha central
    const lineGraphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x888888, alpha: 0.5 } });
    lineGraphics.beginPath();
    lineGraphics.moveTo(GAME_WIDTH / 2, 0);
    lineGraphics.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    lineGraphics.strokePath();

    // Colisões
    scene.physics.add.collider(ball, player, hitPaddle, null, scene);
    scene.physics.add.collider(ball, opponentPaddle, hitPaddle, null, scene);

    distanceDisplayElement = document.getElementById('distanceValue');
    scene.scoreDisplayElement = document.getElementById('scoreDisplay');

    startGame(scene);
}

function update() {

    // --------------------------- RAQUETE JOGADOR ---------------------------
    if (distanceDisplayElement) {
        distanceDisplayElement.innerText = lastDistance.toFixed(1);
    }

    const targetY = mapDistanceToPaddleY(lastDistance);

    player.y = Phaser.Math.Linear(player.y, targetY, 0.2);
    player.body.updateFromGameObject();

    // --------------------------- RAQUETE CPU ---------------------------
    const cpuTrackingSpeed = 5;
    let targetCpuY = ball.body.velocity.x > 0 ? ball.y : GAME_HEIGHT / 2;

    if (Math.abs(targetCpuY - opponentPaddle.y) > cpuTrackingSpeed) {
        opponentPaddle.y += (targetCpuY > opponentPaddle.y ? cpuTrackingSpeed : -cpuTrackingSpeed);
    }

    opponentPaddle.y = Phaser.Math.Clamp(opponentPaddle.y, PADDLE_HEIGHT / 2, GAME_HEIGHT - PADDLE_HEIGHT / 2);
    opponentPaddle.body.updateFromGameObject();

    // --------------------------- PONTUAÇÃO ---------------------------
    if (ball.x < 0) {
        player2Score++;
        updateScoreDisplay(this.scoreDisplayElement);
        startGame(this);
    } else if (ball.x > GAME_WIDTH) {
        player1Score++;
        updateScoreDisplay(this.scoreDisplayElement);
        startGame(this);
    }
}


// --------------------------- CONFIGURAÇÃO DO JOGO ---------------------------
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container'
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Inicialização
window.onload = function() {
    new Phaser.Game(config);
};
