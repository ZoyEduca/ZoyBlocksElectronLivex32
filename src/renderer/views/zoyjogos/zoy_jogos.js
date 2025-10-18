/**
 * Lógica de inicialização do Blockly e definição dos blocos para o jogo de Labirinto.
 * * Define os geradores de código que chamam as funções reais do HTML (window.moveForward, window.turn, etc.).
 * * Implementa as funções globais de execução (executeProgram e stopProgram) que leem o workspace.
 * * NOTA: Este arquivo deve ser carregado APÓS o HTML, que define as funções globais de jogo.
 */

const { loadAssetsGroup } = window.electronAPI ? window.electronAPI.utils : { loadAssetsGroup: async () => {} };
let workspaceMaze = null;


// --- 1. DEFINIÇÃO DOS ASSETS DO BLOCKLY (Alinhado com a carga assíncrona) ---
const assetsToLoad = {
    blocklyCore: [
        {
            name: "blockly_min",
            type: "js",
            path: `${window.paths.blockly.core}blockly.min.js`,
        },
        {
            name: "python_compressed", // Usaremos este gerador para simular JS
            type: "js",
            path: `${window.paths.blockly.core}python_compressed.js`,
        },
    ],
    blocklyMsg: [
        { name: "pt-br", type: "js", path: `${window.paths.blockly.msg}pt-br.js` },
    ],
};


// --- 2. DEFINIÇÃO DOS BLOCOS CUSTOMIZADOS ---

function defineMazeBlocksAndGenerators() {
    // --- BLOCO: Mover para frente ---
    Blockly.Blocks['maze_moveForward'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("mover para frente");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
            this.setTooltip("Move o Panda uma casa na direção atual.");
            this.setHelpUrl("");
        }
    };

    Blockly.Python['maze_moveForward'] = function(block) {
        // Gera o código JS que chama a função real do HTML, com espera (await)
        const code = `await window.moveForward();\n`;
        return code;
    };

    // --- BLOCO: Virar (Direita/Esquerda) ---
    Blockly.Blocks['maze_turn'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("virar")
                .appendField(new Blockly.FieldDropdown([
                    ["para direita", "RIGHT"],
                    ["para esquerda", "LEFT"]
                ]), "DIRECTION");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
            this.setTooltip("Gira o Panda para a direita ou esquerda.");
            this.setHelpUrl("");
        }
    };

    Blockly.Python['maze_turn'] = function(block) {
        const direction = block.getFieldValue('DIRECTION');
        // Gera o código JS que chama a função real do HTML, com espera (await)
        const code = `await window.turn('${direction}');\n`;
        return code;
    };
    
    // --- BLOCO: Repetição simples (Loop) ---
    Blockly.Blocks['controls_repeat_simple'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("repetir")
            .appendField(new Blockly.FieldNumber(4, 0), "TIMES")
            .appendField("vezes");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Repete o bloco de código por um número específico de vezes.");
        this.setHelpUrl("");
      }
    };

   Blockly.Python['controls_repeat_simple'] = function(block) {
    // pega o número de repetições (garante inteiro)
    const repeats = Number(block.getFieldValue('TIMES')) || 0;

    // obtém o código do bloco interno (já com quebras de linha)
    let branch = Blockly.Python.statementToCode(block, 'DO') || '';

    // remove última nova linha se existir
    if (branch.endsWith('\n')) branch = branch.slice(0, -1);

    // indenta duas posições cada linha do corpo para ficar dentro do bloco { ... }
    const indented = branch.split('\n').map(line => line ? '  ' + line : '').join('\n');

    // gera loop JS assíncrono
    const code = `for (let i = 0; i < ${repeats}; i++) {\n${indented}\n}\n`;
    return code;
};

    
    // --- BLOCO: If com verificação de caminho ---
    Blockly.Blocks['controls_if_path'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("se caminho")
            .appendField(new Blockly.FieldDropdown([
                ["à frente", "AHEAD"],
                ["à esquerda", "LEFT"],
                ["à direita", "RIGHT"]
            ]), "DIRECTION")
            .appendField("livre");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("fazer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Executa o bloco de código se o caminho na direção especificada estiver livre.");
        this.setHelpUrl("");
      }
    };

   Blockly.Python['controls_if_path'] = function(block) {
    const direction = block.getFieldValue('DIRECTION');

    // obtém o código do bloco interno (já com quebras de linha)
    let branch = Blockly.Python.statementToCode(block, 'DO') || '';

    // remove nova linha final (se houver)
    if (branch.endsWith('\n')) branch = branch.slice(0, -1);

    // indenta cada linha do bloco interno para ficar dentro do { ... }
    const indented = branch.split('\n').map(line => line ? '  ' + line : '').join('\n');

    // Gera JS assíncrono (usa await para permitir chamadas await no corpo)
    // Caso prefira que isPath seja síncrono, remova o `await` abaixo.
    const code = `if (await window.isPath('${direction}')) {\n${indented}\n}\n`;
    return code;
};

    
}


// --- 3. INICIALIZAÇÃO DO WORKSPACE ---

function initBlocklyMaze() {
  const blocklyDiv = document.getElementById('blocklyGameWorkspace');
  const toolbox = document.getElementById('toolboxMaze');

  const options = {
    toolbox: toolbox,
    scrollbars: true,
    horizontalLayout: false,
    media: `${window.paths.blockly.core}media/`, 
    rtl: false,
    renderer: 'zelos', 
    theme: Blockly.Themes.Classic,
  };
  
  window.workspaceMaze = Blockly.inject(blocklyDiv, options); // Definindo globalmente
  
  // Adiciona listener para atualizar o código gerado em tempo real
  // A função window.updateCodeDisplay está definida no zoy_jogosnovo.html
  window.workspaceMaze.addChangeListener(window.updateCodeDisplay);
  window.updateCodeDisplay(); // Chamada inicial
  
  const onResize = () => {
    if (window.workspaceMaze) {
      Blockly.svgResize(window.workspaceMaze);
    }
  };
  window.addEventListener('resize', onResize, false);
  onResize();
}


// --- 4. FUNÇÕES GLOBAIS DE EXECUÇÃO (DEFINIDAS AQUI PARA INTERAGIR COM O WORKSPACE) ---

/**
 * Função global que inicia a execução do código. Chamada pelo botão "Executar Programa" no HTML.
 */
window.executeProgram = async function() {
    if (!window.workspaceMaze) {
        window.updateStatus("ERRO: Workspace do Blockly não inicializado.", 'bg-red-200', 'text-red-900');
        return;
    }

    const runBtn = document.getElementById('btnExecutarPrograma');
    const stopBtn = document.getElementById('btnPararPrograma');
    
    // window.resetGame está no HTML
    window.resetGame(); // Garante que o jogo esteja no estado inicial
    
    // 1. Obtém o código final (chamando a função definida no HTML)
    const code = window.updateCodeDisplay(); 
    
    // Verifica se o código está vazio ou incompleto
    const isCodeEmpty = code.trim().length < 30; // 30 é um valor arbitrário para capturar o boilerplate
    
    if (isCodeEmpty) {
        window.updateStatus("ERRO: Nenhum bloco conectado ao programa principal.", 'bg-red-200', 'text-red-900');
        return;
    }

    // 2. Prepara e Inicia a execução
    runBtn.disabled = true;
    stopBtn.disabled = false;
    window.isRunning = true;
    // window.updateStatus está no HTML
    window.updateStatus("Executando programa...", 'bg-yellow-200', 'text-yellow-800');

    try {
        // 3. Executa o código gerado usando eval()
        // O código é uma IIFE assíncrona que chama as funções do jogo no HTML.
        await eval(code); 
        
        if (window.isRunning) {
             window.updateStatus("Programa concluído com sucesso!", 'bg-green-200', 'text-green-800');
        }
        
    } catch (error) {
        // Captura erros de Colisão/Game Over (lançados pelas funções do Canvas no HTML)
        if (error.message !== 'Game Over' && error.message !== 'Collision or Game Over') {
            window.updateStatus(`FALHA DE EXECUÇÃO: ${error.message}`, 'bg-red-200', 'text-red-900');
            console.error("Erro na execução do programa Blockly:", error);
        }
    } finally {
        window.isRunning = false;
        runBtn.disabled = false;
        stopBtn.disabled = true;
    }
};

/**
 * Função global que interrompe a execução do código. Chamada pelo botão "Parar" no HTML.
 */
window.stopProgram = function() {
    window.isRunning = false; 
    // window.updateStatus está no HTML
    window.updateStatus("Execução interrompida pelo usuário.", 'bg-gray-200', 'text-gray-700');
    document.getElementById('btnExecutarPrograma').disabled = false;
    document.getElementById('btnPararPrograma').disabled = true;
};


// --- 5. EXECUÇÃO DA INICIALIZAÇÃO (Ponto de entrada) ---

document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (window.electronAPI) {
             // PASSO 1: Carrega os scripts do Blockly (Core e Python Generator)
            await loadAssetsGroup(assetsToLoad.blocklyCore);
            // PASSO 2: Agora que o Blockly (e o Python Generator) estão DEFINIDOS, registramos os blocos
            defineMazeBlocksAndGenerators(); 
            // PASSO 3: Carrega as mensagens de tradução (opcionalmente)
            await loadAssetsGroup(assetsToLoad.blocklyMsg);
        } else {
             // Fallback simples para ambiente de teste sem electron
             defineMazeBlocksAndGenerators(); 
        }

        // PASSO 4: Inicializa o Workspace e injeta na DOM
        initBlocklyMaze();

    } catch (error) {
        console.error("Erro durante a inicialização do Zoy Jogos:", error);
    }
});
