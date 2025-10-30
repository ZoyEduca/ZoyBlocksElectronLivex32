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

// Função para alternar a conexão
let conectado = false;
async function toggleConexao() {
  const portaSelecionada = document.getElementById("selectPorta").value;
  const baudrateSelecionado = parseInt(document.getElementById("selectBaudrate").value); // Converte para número

  if (conectado) {
    // Desconectar
    const resposta = await window.electronAPI.desconectarPorta();
  if (resposta.status) {
      alert(resposta.mensagem); // Exibe mensagem de sucesso

      conectado = false;
      document.getElementById("btnConectar").textContent = "Conectar";
      document.getElementById("btnConectar").classList.remove("btn-danger");
      document.getElementById("btnConectar").classList.add("btn-warning");
    } else {
      alert(`Erro ao desconectar: ${resposta.mensagem}`);
    }
  } else {
    // Conectar
    const resposta = await window.electronAPI.conectarPorta(portaSelecionada, baudrateSelecionado);
    if (resposta.status) {
      alert(resposta.mensagem); // Exibe mensagem de sucesso

      conectado = true;
      document.getElementById("btnConectar").textContent = "Desconectar";
      document.getElementById("btnConectar").classList.remove("btn-warning");
      document.getElementById("btnConectar").classList.add("btn-danger");
  } else {
    alert(`Erro ao conectar: ${resposta.mensagem}`);
  }
}
}
window.toggleConexao = toggleConexao;

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

// Eventos vindos do Electron
window.electronAPI.onStatusSerial((data) => log(data.mensagem, "sistema"));
window.electronAPI.onDadosSerial((data) => log(data, "normal"));
window.electronAPI.onErroSerial((data) => log(data.mensagem, "erro"));



// ----------------------------------------------------------
// --- EVENTOS PRINCIPAIS(DOMloading)------------------------
// ----------------------------------------------------------
// Inicialização do app quando DOM estiver pronta
window.addEventListener("DOMContentLoaded", async () => {
  await initializeImports(); // Importa CSS, Bootstrap e Blockly
  await preloadImages(); // carrega as imagens e popula o carousel

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

  // Botão listar portas
  listarPortas();
  document
    .getElementById("btnConectar")
    .addEventListener("click", toggleConexao);
  document
    .getElementById("btnListarPortas")
    .addEventListener("click", listarPortas);

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
