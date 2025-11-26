const { loadAssetsGroup } = window.electronAPI.utils;

// Array de assets a serem carregados, usando os caminhos do preload
const assetsToLoad = {
  css: [
    { name: "base", type: "css", path: `${window.paths.styles.base}base.css` },
  ],
  bootstrap: [
    {
      name: "bootstrap_css",
      type: "css",
      path: `${window.paths.libs.bootstrap}bootstrap.min.css`,
    },
    {
      name: "bootstrap_js",
      type: "js",
      path: `${window.paths.libs.bootstrap}bootstrap.bundle.min.js`,
    },
  ],
  blocklyCore: [
    {
      name: "blockly_compressed",
      type: "js",
      path: `${window.paths.blockly.core}blockly_compressed.js`,
    },
    {
      name: "blocks_compressed",
      type: "js",
      path: `${window.paths.blockly.core}blocks_compressed.js`,
    },
    {
      name: "javascript_compressed",
      type: "js",
      path: `${window.paths.blockly.core}javascript_compressed.js`,
    },
  ],
  blocklyMsg: [
    { name: "en", type: "js", path: `${window.paths.blockly.msg}en.js` },
    { name: "es", type: "js", path: `${window.paths.blockly.msg}es.js` },
    { name: "pt-br", type: "js", path: `${window.paths.blockly.msg}pt-br.js` },
  ],
  blocksDevice: [
    // Blocos basicos
    {
      name: "basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}basic_blocks.js`,
    },
    // importar categorias do basicblocks
    {
      name: "controle_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/controle.js`,
    },
    {
      name: "logica_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/logica.js`,
    },
    {
      name: "matematica_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/matematica.js`,
    },
    {
      name: "texto_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/texto.js`,
    },
    {
      name: "serial_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/serial.js`,
    },
    {
      name: "variavel_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/variaveis.js`,
    },
    {
      name: "funcao_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/funcao.js`,
    },
    // blocos do zoySteamBlocks
    {
      name: "zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}zoy_steam_blocks.js`,
    },
    // importar categorias do zoySteamBlocks
    {
      name: "evento_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/evento.js`,
    },
    {
      name: "luz_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/luz.js`,
    },
    {
      name: "motores_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/motores.js`,
    },
    {
      name: "motoresAvancados_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/motoresAvancados.js`,
    },
    {
      name: "sensores_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/sensores.js`,
    },
    {
      name: "botao_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/botao.js`,
    },
    {
      name: "pinosLivres_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/pinosLivres.js`,
    },
    {
      name: "som_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/som.js`,
    },
    {
      name: "servo_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/servo.js`,
    },
    {
      name: "infravermelho_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/infravermelho.js`,
    },
    {
      name: "comunicacaoInfra_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/comunicacaoInfra.js`,
    },
  ],
  images: [
    {
      name: "ZoySTEAM",
      type: "img",
      path: `${window.paths.imgs.imgs}ZoySTEAM.png`,
    },
    {
      name: "zoySTEAMPlaca",
      type: "img",
      path: `${window.paths.imgs.imgs}zoySTEAMPlaca.png`,
    },
    { name: "Cima", type: "img", path: `${window.paths.imgs.imgs}Cima.png` },
    { name: "Baixo", type: "img", path: `${window.paths.imgs.imgs}Baixo.png` },
    {
      name: "PlacaNano",
      type: "img",
      path: `${window.paths.imgs.imgs}PlacaNano.png`,
    },
  ],
};
// ----------------------------------------------------------------------------
// ----------- Importações Iniciais da página ---------------------------------
// ----------------------------------------------------------------------------
async function initializeImports() {
  try {
    // Carrega CSS
    await loadAssetsGroup(assetsToLoad.css);

    // Carrega Bootstrap
    await loadAssetsGroup(assetsToLoad.bootstrap);

    // Carrega Blockly core e mensagens
    await loadAssetsGroup([
      ...assetsToLoad.blocklyCore,
      ...assetsToLoad.blocklyMsg,
    ]);

    // Carrega Blocos de dispositivos
    await loadAssetsGroup([...assetsToLoad.blocksDevice]);

  } catch (error) {
    console.error("❌ Erro ao inicializar Importações:", error);
  }
}

// ----------------------------------------------------------------------------
// ----------- Inicialização do workspace -------------------------------------
// ----------------------------------------------------------------------------
let workspace = null; // Variável para armazenar a instância do workspace do Blockly

async function createWorkspace(toolbox) {
  // carrega midia(imgs,mp3 ...) do arquivo blockly local
  const mediaPath = window.paths.blockly.media;
  try {
    // Inicializa workspace Blockly
    workspace = Blockly.inject("blocklyDiv", {
      toolbox: toolbox,
      horizontalLayout: false,
      toolboxPosition: "start",
      media: mediaPath,
      grid: { spacing: 20, length: 1, colour: "#ffffffff", snap: true },
      trashcan: true,
      scrollbars: true,
      zoom: {
        startScale: 0.8,
        maxScale: 2,
        minScale: 0.3,
        scaleSpeed: 1.1,
        controls: true, // Ativa botões de zoom
        wheel: false, // Desative zoom com roda do mouse
        pinch: false, // Desative zoom com gesto de pinça (touchscreen)
      },
      renderer: "zelos", // Tema dos blocos : geras(clasico), zelos(cartoon) e thrasos(industrial)
      theme: Blockly.Themes.Classic, // Classic ou Dark, HighContrast, etc
    });

    window.workspace = workspace; // Torna o workspace globalmente acessível

    console.log("✅ Blockly carregado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar app:", error);
  }
}

// ---------------------------------------------------------------------------
// Atualiza o workspace ao selecionar uma placa
// ---------------------------------------------------------------------------
async function atualizarWorkspace(selectPlaca) {
  if (!selectPlaca) return;

  selectPlaca.addEventListener("change", async (e) => {
    const placa = e.target.value;

    // Ao selecionar placa: registrar blocos do dispositivo e atualizar toolbox
    if (placa === "zoySTEAM") {
      if (window.zoySteamBlocks) window.zoySteamBlocks(); // define blocos do dispositivo
    }

    const contents = [];

    // Adiciona categorias do dispositivo primeiro (se existirem)
    if (window.toolboxZoySteam?.contents?.length) {
      contents.push(...window.toolboxZoySteam.contents);
    }

    // Depois adiciona categorias básicas
    if (window.toolboxbasicBlocks?.contents?.length) {
      contents.push(...window.toolboxbasicBlocks.contents);
    }

    const newToolbox = { kind: "categoryToolbox", contents };

    // Atualiza toolbox do workspace existente
    if (window.workspace) {
      window.workspace.updateToolbox(newToolbox);
    } else {
      await createWorkspace(newToolbox);
    }
  });
}

// ----------------------------------------------------------------------------
// ----------- Aréa de código em Javascript ---------------------------------------
// ----------------------------------------------------------------------------
// Atualiza espaço de código de acordo com a manipulção do blocos no workspace
function atualizarAreaCodigo() {
  const codigo = Blockly.JavaScript.workspaceToCode(workspace);
  document.getElementById("areaCodigo").textContent =
    codigo || "# Nenhum código gerado.";
}

function configurarAtualizacaoCodigo() {
  if (workspace) {
    workspace.addChangeListener(function (event) {
      // Verifica se a alteração foi relevante (por exemplo, a adição de blocos)
      if (
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_CHANGE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_MOVE
      ) {
        atualizarAreaCodigo(); // Atualiza o código quando um bloco for adicionado ou modificado
      }
    });
  } else {
    console.warn("Workspace ainda não foi inicializado.");
  }
}

// ----------------------------------------------------------------------------
// ----------- Pré load de imagens do carrossel -------------------------------
// ----------------------------------------------------------------------------
// Lazy load de imagens (opcional, ex: pré-carregamento)
async function preloadImages() {
  // Carrega fisicamente as imagens (lazy load)
  await loadAssetsGroup(assetsToLoad.images);

  // Agora adiciona as imagens no carousel dinamicamente
  const container = document.getElementById("carouselInner");
  if (!container) return;

  assetsToLoad.images.forEach((img, index) => {
    const div = document.createElement("div");
    div.className = `carousel-item${index === 0 ? " active" : ""}`;

    const image = document.createElement("img");
    image.className = "d-block w-100";
    image.alt = img.name;
    image.src = img.path; // caminho seguro do preload

    div.appendChild(image);
    container.appendChild(div);
  });
}

// ----------------------------------------------------------------------------
// ----------- botões de navegação de telas -----------------------------------
// ----------------------------------------------------------------------------
// Terminal Completo
document
  .getElementById("abrirTerminalCompletoBtn")
  .addEventListener("click", () => {
    window.electronAPI.abrirTerminalCompleto();
  });

// ZoyGPT
document.getElementById("abrirZoyGPTBtn").addEventListener("click", () => {
  window.electronAPI.abrirZoyGPT();
});

// ZoyGames
document.getElementById("btnZoyGames").addEventListener("click", () => {
  window.electronAPI.abrirZoyGames();
});

// BlocklyGames
document.getElementById("btnBlocklyGames").addEventListener("click", () => {
  window.electronAPI.abrirBlocklyGames();
});


/**
 * Configura um prompt personalizado (Modal Bootstrap) para substituir 
 * o window.prompt() padrão do Blockly, que não funciona no Electron.
 */
function configurarPromptVariaveis() {
  const modalElement = document.getElementById('variablePromptModal');
  if (!modalElement) {
    console.error('Modal de variáveis não encontrado no HTML!');
    return;
  }

  // Pega a instância do Modal Bootstrap
  const bootstrapModal = new bootstrap.Modal(modalElement);
  
  // Pega os elementos internos do modal
  const modalText = document.getElementById('variablePromptText');
  const modalInput = document.getElementById('variablePromptInput');
  const saveButton = document.getElementById('variablePromptSave');
  const cancelButton = modalElement.querySelector('[data-bs-dismiss="modal"]');

  let blocklyCallback = null; // Armazena a função de callback do Blockly

  // Define a função de override
  const meuPromptPersonalizado = (message, defaultValue, callback) => {
    modalText.textContent = message;
    modalInput.value = defaultValue;
    blocklyCallback = callback; // Armazena a callback para ser chamada depois
    bootstrapModal.show(); // Mostra o modal
  };

  // Handler do botão Salvar
  saveButton.addEventListener('click', () => {
    const value = modalInput.value;
    if (blocklyCallback) {
      blocklyCallback(value); // Retorna o valor para o Blockly
    }
    blocklyCallback = null; // Limpa a callback
    bootstrapModal.hide();
  });

  // Handler para quando o modal é fechado (pelo 'X', 'Cancelar' ou clique fora)
  modalElement.addEventListener('hidden.bs.modal', () => {
    // Se o modal foi fechado sem salvar, 'blocklyCallback' ainda existirá
    if (blocklyCallback) {
      blocklyCallback(null); // Retorna 'null' (ação de cancelar) para o Blockly
    }
    blocklyCallback = null; // Limpa a callback
  });

  // Finalmente, registra a nossa função no Blockly
  Blockly.dialog.setPrompt(meuPromptPersonalizado);

  // OPCIONAL, mas recomendado: Faça o mesmo para 'alert' e 'confirm'
  Blockly.dialog.setAlert((message, callback) => {
    alert(message); // Você pode criar um modal Bootstrap para 'alert' também
    if (callback) callback();
  });

  Blockly.dialog.setConfirm((message, callback) => {
    // Você pode criar um modal Bootstrap para 'confirm' também
    const result = window.confirm(message); // confirm() também pode falhar
    callback(result);
  });
}

// ----------------------------------------------------------------------------
// ----------- Esconder/Exibir sidebar (menu lateral) -------------------------
// ----------------------------------------------------------------------------
// Toggle Sidebar
document.getElementById("toggleSidebar").addEventListener("click", function () {
  const sidebar = document.getElementById("sidebarRight");
  const blocklyDiv = document.getElementById("blocklyDiv");

  // Toggle a classe 'hidden' no sidebar
  sidebar.classList.toggle("hidden");

  // Ajuste a largura do #blocklyDiv quando a sidebar for escondida
  if (sidebar.classList.contains("hidden")) {
    blocklyDiv.style.flexBasis = "100%"; // Expande o #blocklyDiv para ocupar toda a largura
    blocklyDiv.style.transition = "flex-basis 0.3s ease-in-out"; // Garantir uma transição suave
  } else {
    blocklyDiv.style.flexBasis = "70%"; // Restaura a largura original
    blocklyDiv.style.transition = "flex-basis 0.3s ease-in-out"; // Transição suave
  }

  // Força o Blockly a se redimensionar
  if (window.workspace && typeof window.workspace.resize === "function") {
    window.workspace.resize();
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      window.workspace.resize();
    }, 310);
  }
});

// ----------------------------------------------------------------------------
// ----------- NavBar  --------------------------------------------------------
// ----------------------------------------------------------------------------
function salvarProjeto() {
  const state = Blockly.serialization.workspaces.save(window.workspace);
  const json = JSON.stringify(state, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "projeto.json";
  link.click();

  alert("💾 Projeto salvo com sucesso!");
}

async function carregarProjeto() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target.result);
        window.workspace.clear();
        Blockly.serialization.workspaces.load(state, window.workspace);
        atualizarAreaCodigo();
        alert("📂 Projeto JSON carregado com sucesso!");
      } catch (error) {
        alert("❌ Erro ao carregar o projeto JSON. Verifique se o arquivo é válido.");
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// Eventos dos botões de salvar e carregar
document.getElementById("salvarProjeto")?.addEventListener("click", (e) => {
  e.preventDefault();
  salvarProjeto();
});

document.getElementById("carregarProjeto")?.addEventListener("click", (e) => {
  e.preventDefault();
  carregarProjeto();
});



// ----------------------------------------------------------------------------
// ----------- Lógica de conexões Serial --------------------------------------
// ----------------------------------------------------------------------------
// Função de log simples
function log(mensagem, tipo = "normal") {
  console.log(`[${tipo}] ${mensagem}`);

  // **ALTERAÇÃO APLICADA AQUI:** // Encaminha a mensagem para o terminal visual, garantindo que as respostas do Arduino apareçam.
  // Usamos o tipo para formatar a mensagem no terminal
  exibirLogNoTerminal(`[${tipo.toUpperCase()}] ${mensagem}`);
}

// Funções de conexão (não implementadas ainda)
async function listarPortas() {
  try {
    const portas = await window.electronAPI.listarPortas();
    const select = document.getElementById("selectPorta");
    if (!select) {
      log("Elemento selectPorta não encontrado.", "erro");
      return;
    }
    select.innerHTML = "";
    if (portas && portas.length > 0) {
      portas.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
      });
      log("Portas encontradas: " + portas.join(", "), "sistema");
    } else {
      log("Nenhuma porta serial encontrada.", "sistema");
    }
  } catch (err) {
    log("Erro ao listar portas: " + err.message, "erro");
  }
}
window.listarPortas = listarPortas;

// -------------------------- Função para alternar a conexão -----------------------
let conectado = false;

// Função para atualizar o layout do botão e mostrar toast
function atualizarLayoutConexao(novoEstado, mensagem, tipo) {
  const btnConectar = document.getElementById("btnConectar");

  conectado = novoEstado;

  // Atualiza texto e classes do botão
  if (conectado) {
    btnConectar.textContent = "Desconectar";
    btnConectar.classList.remove("btn-warning");
    btnConectar.classList.add("btn-danger");
  } else {
    btnConectar.textContent = "Conectar";
    btnConectar.classList.remove("btn-danger");
    btnConectar.classList.add("btn-warning");
  }

  // Mostrar toast
  mostrarToast(mensagem, tipo);
}

// Função interna de toast reaproveitada do toggleConexao
function mostrarToast(mensagem, tipo = "usb-conectado") {
  const toastEl = document.getElementById("statusToast");
  const toastMensagem = document.getElementById("statusToastMensagem");
  const toastIcon = document.getElementById("statusToastIcon");

  const icons = {
    "usb-conectado": `
        <span role="img" aria-label="usb-connected" class="text-success">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="currentColor" aria-hidden="true">
            <path d="M10 3v10.55A4 4 0 1 0 14 17V9h3v3l4-4-4-4v3h-5V3h-2zM8 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
          </svg>
        </span>`,
    "usb-desconectado": `
        <span role="img" aria-label="usb-disconnected" class="text-danger">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="currentColor" aria-hidden="true">
            <path d="M20.707 19.293 4.707 3.293a1 1 0 0 0-1.414 1.414l3.356 3.356A3.98 3.98 0 0 0 6 11a4 4 0 0 0 7 2.645V21h-1a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-1v-3.586l3.293 3.293a1 1 0 0 0 1.414-1.414zM13 10.414V9h1v1.414l-1-1zM8 13a2 2 0 0 1-2-2 1.99 1.99 0 0 1 .301-1.043l2.742 2.742A1.98 1.98 0 0 1 8 13z"/>
            <path d="M15 7h3v3l4-4-4-4v3h-5V3h-2v3.586l2 2V7z"/>
          </svg>
        </span>`,
    error: `
        <span role="img" aria-label="error" class="text-danger">
          <svg viewBox="64 64 896 896" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448
            448-200.6 448-448S759.4 64 512 64zm165.4
            595.6a8 8 0 010 11.3l-33.9 33.9a8 8
            0 01-11.3 0L512 557.3l-120.2 147.5a8 8
            0 01-11.3 0l-33.9-33.9a8 8 0
            010-11.3L466.7 512 346.6 391.8a8 8
            0 010-11.3l33.9-33.9a8 8 0
            0111.3 0L512 466.7l120.2-120.2a8 8
            0 0111.3 0l33.9 33.9a8 8 0
            010 11.3L557.3 512l120.1 120.2z"></path>
          </svg>
        </span>`
  };

  toastIcon.innerHTML = icons[tipo] || "";
  toastMensagem.textContent = mensagem;

  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1500 });
  toast.show();
}

// Função para alternar conexão via botão
async function toggleConexao() {
  const portaSelecionada = document.getElementById("selectPorta").value;
  const baudrateSelecionado = parseInt(document.getElementById("selectBaudrate").value);

  try {
    if (conectado) {
      const resposta = await window.electronAPI.desconectarPorta();
      if (resposta.status) {
        atualizarLayoutConexao(false, "Dispositivo desconectado!", "usb-desconectado");
      } else {
        mostrarToast(`Erro: ${resposta.mensagem}`, "error");
      }
    } else {
      const resposta = await window.electronAPI.conectarPorta(portaSelecionada, baudrateSelecionado);
      if (resposta.status) {
        atualizarLayoutConexao(true, "Dispositivo conectado!", "usb-conectado");
      } else {
        mostrarToast(`Erro: ${resposta.mensagem}`, "error");
      }
    }
  } catch (err) {
    mostrarToast(`Erro inesperado: ${err.message}`, "error");
  }
}

window.toggleConexao = toggleConexao;



// ----------------------------------------------------------------------------
// ----------- Lógica de Executar Código do blocos ----------------------------
// ----------------------------------------------------------------------------
async function executarCodigo() {
  const preElement = document.getElementById("areaCodigo");
  const areaCodigo = preElement?.textContent?.trim();

  if (!areaCodigo || areaCodigo.includes("Nenhum código gerado")) {
    alert("Nenhum código Javascript válido foi gerado.");
    return;
  }

  // Limpar o terminal antes de começar a execução
  const terminalElement = document.getElementById("terminal");
  if (terminalElement) {
    terminalElement.innerHTML = ''; // Limpa o terminal
  }

  try {
    const resultado = await window.electronAPI.executarCodigo(areaCodigo);

    if (!resultado.status) {
      exibirLogNoTerminal(`[ERRO] ${resultado.mensagem || "Falha desconhecida"}`);
    }


    // Exibir logs no console e no terminal
    if (Array.isArray(resultado.logs)) {
      resultado.logs.forEach((log) => {
        // Exibe no terminal da interface
        exibirLogNoTerminal(log);
      });
    }

  } catch (err) {
    exibirLogNoTerminal(`[ERRO] Falha ao executar código: ${err.message}`);
  }
}

// Função para exibir logs no terminal com hora
function exibirLogNoTerminal(log) {
  const terminalElement = document.getElementById("terminal");
  if (!terminalElement) return;

  const hora = new Date().toLocaleTimeString();

  const logDiv = document.createElement("div");
  logDiv.textContent = `[${hora}] ${log}`; // Inclui hora
  terminalElement.appendChild(logDiv);

  // Rolagem automática para o final do terminal
  terminalElement.scrollTop = terminalElement.scrollHeight;
}

// Limpar Terminal
document.getElementById("limparTerminalBtn")?.addEventListener("click", () => {
  const terminalElement = document.getElementById("terminal");
  if (terminalElement) {
    terminalElement.innerHTML = ''; // Limpa o terminal
  }
});


async function ajudaLinkOpen(e) {
  e.preventDefault(); // Previne o comportamento padrão (abrir no próprio window)
  const url = "https://zoy.com.br";
  const response = await window.electronAPI.openExternal(url);

  if (!response.ok) {
    console.error("Falha ao abrir o link:", response.reason);
  }
}

// ----------------------------------------------------------
// --- EVENTOS PRINCIPAIS(DOMloading)------------------------
// ----------------------------------------------------------
// Inicialização do app quando DOM estiver pronta
window.addEventListener("DOMContentLoaded", async () => {
  await initializeImports(); // Importa CSS, Bootstrap e Blockly
  await preloadImages(); // carrega as imagens e popula o carousel

  // Configura o modal de prompt ANTES de criar o workspace
  configurarPromptVariaveis();

  //Inicializa blocos básicos (efetua define dos blocos e constrói toolboxbasicBlocks)
  if (window.basicBlocks) window.basicBlocks();
  //Cria workspace com SOMENTE toolbox básico (isso garante que ao abrir só apareça o básico)
  await createWorkspace(window.toolboxbasicBlocks);

  configurarAtualizacaoCodigo();

  // Atualiza workspace ao selecionar uma placa
  const selectPlaca = document.getElementById("selectPlaca");
  await atualizarWorkspace(selectPlaca);

  // Expandir área do código Javascript
  const pre = document.getElementById("areaCodigo");
  pre.addEventListener("click", function () {
    const preElement = document.getElementById("areaCodigo");
    preElement.classList.toggle("expanded");
  });

  // Eventos de escuta do serial vindos do Electron
  window.electronAPI.onStatusSerial((data) => {
    log(data.mensagem, "sistema");

    // Atualiza layout sempre que houver mudança
    if (data.status === "conectado") {
      atualizarLayoutConexao(true, "Dispositivo conectado! (Serial)", "usb-conectado");
    } else if (data.status === "desconectado") {
      atualizarLayoutConexao(false, "Dispositivo desconectado! (Serial)", "usb-desconectado");
    }
  });
  window.electronAPI.onDadosSerial((data) => log(data, "normal"));
  window.electronAPI.onErroSerial((data) => log(data.mensagem, "erro"));

  // Botão listar portas
  listarPortas();
  document
    .getElementById("btnListarPortas")
    .addEventListener("click", listarPortas);

  const btnConectar = document.getElementById("btnConectar");
  btnConectar.addEventListener("click", toggleConexao);
  
  // Adiciona o evento de clique no botão executar código
  const btnExecutarCodigo = document.getElementById("btnExecutarCodigo");
  if (btnExecutarCodigo) {
    btnExecutarCodigo.addEventListener("click", executarCodigo);
  }

  // Adiciona o evento de clique no link
  const ajudaLink = document.getElementById("ajuda-link"); // Seu botão de ajuda
  if (ajudaLink) {
    ajudaLink.addEventListener("click", ajudaLinkOpen);
  }
});
