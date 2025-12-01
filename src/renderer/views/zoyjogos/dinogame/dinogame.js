/* -----------------------------------------------------------
   ZOY DINO — CONTROLE COM 1 SENSOR (ULTRASSOM) 
   ----------------------------------------------------------- 
*/

// Variável única para a distância, unificada com a lógica do Pong
let sensorDistancia = 100.0; 

let player;
let ground; // 
let obstacles = [];

let score = 0;
let scoreText;

let isCrounch = false;
let isPlayGame = false; // Indica se o jogo não foi iniciado ou personagem morto
let gameSpeed = 5; // Velocidade inicial (pixels por frame)

// ------------------------ LEITURA SERIAL IPC (ADOTADA DO PONG) ------------------------
if (window.electronAPI && window.electronAPI.onDadosSerial) {
    window.electronAPI.onDadosSerial((serialData) => {
        const dataString = serialData.toString().trim();
        // Regex busca por qualquer número (inteiro ou flutuante)
        const distanceMatch = dataString.match(/(\d+\.?\d*)/); 

        if (distanceMatch) {
            const distance = parseFloat(distanceMatch[1]);
            // Filtro de Ruido - Limites de 5 a 40 cm - Evita valores absurdos disparados
            sensorDistancia = Phaser.Math.Clamp(distance, 5, 40); 
        }
    });
}


// ------------------------ CONFIG DO JOGO ------------------------
const GAME_WIDTH = 960; // Largura do jogo
const GAME_HEIGHT = 540; // Altura do jogo
const GROUND_Y = GAME_HEIGHT - 40; // Posição Y do chão

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: { 
            gravity: { y: 1500 }, // Gravidade para o pulo e queda do Dino
            debug: false   // MUDANÇA: ATIVADO o debug para visualização das caixas de colisão
        } 
    },
    scene: { preload, create, update }
};
// Inicialização do jogo
new Phaser.Game(config);


// ------------------------ PRELOAD ------------------------
function preload() {
    // DINO COMPLETO (Correr, Pular, Morrer)
    // Tamanho total 300x60. 5 frames. Cada frame = 60x60.
    this.load.spritesheet("dino", "sprites/dino_run_die_jump.png", { 
        frameWidth: 60, 
        frameHeight: 60 
    });
    // DINO AGACHADO
    // Tamanho total 124x32. 2 frames. Cada frame = 62x32.
    this.load.spritesheet("dino_crounch", "sprites/dino_crounch.png", { 
        frameWidth: 62, 
        frameHeight: 32 
    });
    // CHÃO (Imagem Simples para TileSprite)
    this.load.image("ground", "sprites/ground.png");
    // CACTOS (Obstáculo)
    this.load.image("cactus", "sprites/cactus.png");
}


// ------------------------ CREATE ------------------------
function create() {
    // Cor de fundo (simulando a tela clara do Chrome Dino)
    this.cameras.main.setBackgroundColor('#f7f7f7'); 
    
    // CONFIGURAÇÃO DO CHÃO INFINITO (TileSprite)
    // TileSprite(x, y, largura, altura, chave)
    // Usamos GAME_WIDTH na largura para ele cobrir a tela toda
    ground = this.add.tileSprite(GAME_WIDTH / 2, GROUND_Y, GAME_WIDTH, 16, "ground");
    
    // Adiciona física ao TileSprite manualmente (pois ele não é um physics factory nativo)
    this.physics.add.existing(ground, true); // true = estático (não cai)

    // CONFIGURAÇÃO DO DINO
    player = this.physics.add.sprite(120, GAME_HEIGHT - 100, "dino");
    player.setCollideWorldBounds(true);
    player.setGravityY(1500);
    
    // Ajuste da hitbox inicial (Dino em pé 60x60, mas vamos reduzir um pouco as bordas)
    player.body.setSize(44, 50); 
    
    this.physics.add.collider(player, ground);

    // CRIANDO AS ANIMAÇÕES
    
    // Correr: Frames 1 a 2 [0,1,2]
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('dino', { frames: [0, 1, 2] }),
        frameRate: 10,
        repeat: -1
    });

    // Pular: Frame 1 [0]
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('dino', { frames: [0] }),
        frameRate: 10,
        repeat: -1
    });

    // Morrer: Frames 4 e 5 [3,4]
    this.anims.create({
        key: 'die',
        frames: this.anims.generateFrameNumbers('dino', { frames: [3, 4] }),
        frameRate: 10,
        repeat: 0 // Não repete, morre e fica parado
    });

    // Agachar: Frames 1 e 2 [0 e 1]
    this.anims.create({
        key: 'crounch',
        frames: this.anims.generateFrameNumbers('dino_crounch', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    // Inicia correndo
    player.play('run');
    isPlayGame = true; // Jogo começa rodando

    scoreText = document.getElementById("scoreDisplay");

    // Spawn de obstáculos
    this.time.addEvent({
        delay: 1500,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });
}


// ------------------------ FUNÇÃO DE CRIAR CACTO ------------------------
function spawnObstacle() {
    const scene = player.scene;

    // Cacto nasce na altura correta (ajustada para tocar o chão)
    const cactus = scene.physics.add.image(GAME_WIDTH + 40, GAME_HEIGHT - 75, "cactus"); 
    
    cactus.body.setAllowGravity(false); 
    cactus.setVelocityX(gameSpeed);
    cactus.setImmovable(true);
    cactus.setCollideWorldBounds(false);

    obstacles.push(cactus);

    scene.physics.add.collider(player, cactus, gameOver, null, scene);
}


// ------------------------ UPDATE LOOP ------------------------
function update() {
    
    if (isPlayGame) {

        // --- 1. AMBIENTE E PONTUAÇÃO ---
        
        score++;
        // Aumenta a velocidade progressivamente
        gameSpeed += 0.001; 

        // Move o chão (TileSprite) para criar o efeito de corrida infinita
        ground.tilePositionX += gameSpeed;

        // Atualiza texto (Score e Sensor)
        scoreText.innerHTML = `Score: ${Math.floor(score / 10)} | Distância: ${sensorDistancia.toFixed(1)} cm`;


        // --- 2. OBSTÁCULOS (Sincronizados com o chão) ---
        
        // Move todos os cactos para a esquerda baseados na gameSpeed atual
        // Multiplicamos por 60 para converter a velocidade do chão em velocidade física
        obstacles.forEach(o => o.setVelocityX(-(gameSpeed * 60)));

        // Remove cactos que saíram da tela (Limpeza de Memória)
        obstacles = obstacles.filter(o => {
            if (o.x < -100) { // Margem de segurança maior (-100)
                o.destroy();
                return false;
            }
            return true;
        });


        // --- 3. LÓGICA VISUAL (ANIMAÇÕES) ---
        
        // Se estiver no ar (Pulando)
        if (!player.body.touching.down) {
            player.anims.stop(); 
            player.setFrame(0); // Frame estático de pulo
        } 
        else {
            // Se está no chão...
            if (isCrounch) {
                // Toca animação de agachar se já não estiver tocando
                if (player.anims.currentAnim?.key !== 'crounch') {
                    player.play('crounch', true);
                }
            } else {
                // Toca animação de correr se já não estiver tocando
                if (player.anims.currentAnim?.key !== 'run') {
                    player.play('run', true);
                }
            }
        }


        // --- 4. CONTROLE (INPUT DO SENSOR) ---

        // SALTO (< 15cm)
        // Só pula se estiver no chão e não estiver agachado
        if (sensorDistancia < 15 && player.body.touching.down && !isCrounch) {
            player.setVelocityY(-1000); // Força do pulo ajustada para a gravidade de 1500
        }

        // AGACHAR (entre 20cm e 30cm)
        if (sensorDistancia >= 20 && sensorDistancia <= 30 && player.body.touching.down) {
            
            if (!isCrounch) {
                isCrounch = true;
                
                // AJUSTE FÍSICO: Reduz a caixa de colisão
                // (Largura 62, Altura 32 - baseada no seu sprite)
                player.body.setSize(62, 32, true); 
                
                // AJUSTE VISUAL: Desce o sprite para ele não flutuar
                player.y += 15; 
            }

        } 
        // LEVANTAR (Se sair da zona de agachar)
        else if (isCrounch && (sensorDistancia < 20 || sensorDistancia > 30)) {
            
            isCrounch = false;
            
            // AJUSTE FÍSICO: Volta para a caixa de colisão "Em Pé"
            // (Largura 44, Altura 50 - um pouco menor que o sprite 60x60 para facilitar)
            player.body.setSize(44, 50, true);
            
            // AJUSTE VISUAL: Sobe o sprite de volta
            player.y -= 15; 
        }

    } else {
        // Jogo Parado (Game Over ou Menu)
        player.anims.pause();
    }
}

// ------------------------ GAME OVER ------------------------
function gameOver(player, obstacles) {
    this.physics.pause(); // Para toda a física
    player.anims.play('die'); // Toca animação de morte
    
    // Opcional: Para o chão também visualmente
    // ground.tilePositionX para de atualizar pois o update() vai parar ou reiniciar
    
    // Reinicia após um tempo
    player.once('animationcomplete', () => {
        this.time.delayedCall(1000, () => location.reload());
    });
}

function goBack() {
    if (window.electronAPI && window.electronAPI.goBack) {
    window.electronAPI.goBack();
    } else {
    window.location.href = 'zoy_jogos.html';
    }
}