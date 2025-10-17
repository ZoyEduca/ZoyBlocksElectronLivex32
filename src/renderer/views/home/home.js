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
      name: "blockly_min",
      type: "js",
      path: `${window.paths.blockly.core}blockly.min.js`,
    },
    {
      name: "python_compressed",
      type: "js",
      path: `${window.paths.blockly.core}python_compressed.js`,
    },
  ],
  blocklyMsg: [
    { name: "en", type: "js", path: `${window.paths.blockly.msg}en.js` },
    { name: "es", type: "js", path: `${window.paths.blockly.msg}es.js` },
    { name: "pt-br", type: "js", path: `${window.paths.blockly.msg}pt-br.js` },
  ],
  blocksDevice: [
    //Blocos basicos
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
      name: "funcao_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/funcao.js`,
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
      name: "serial_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/serial.js`,
    },
    {
      name: "texto_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/texto.js`,
    },
    {
      name: "variaveis_basicBlocks",
      type: "js",
      path: `${window.paths.blocks_device.basic_blocks}cates/variaveis.js`,
    },
    // blocos do zoySteamBlocks
    {
      name: "zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}zoy_steam_blocks.js`,
    },
    // importar categorias do zoySteamBlocks
    {
      name: "botao_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/botao.js`,
    },
    {
      name: "comunicacaoInfra_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/comunicacaoInfra.js`,
    },
    {
      name: "luz_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/luz.js`,
    },
    {
      name: "infravermelho_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/infravermelho.js`,
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
      name: "pinosLivres_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/pinosLivres.js`,
    },
    {
      name: "sensores_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/sensores.js`,
    },
    {
      name: "servo_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/servo.js`,
    },
    {
      name: "som_zoySteamBlocks",
      type: "js",
      path: `${window.paths.blocks_device.zoy_steam_blocks}cates/som.js`,
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
      toolbox,
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
// ----------- Aréa de código em python ---------------------------------------
// ----------------------------------------------------------------------------
// Atualiza espaço de código de acordo com a manipulção do blocos no workspace
function atualizarCodigoPython() {
  const codigo = Blockly.Python.workspaceToCode(workspace);
  document.getElementById("codigoPython").textContent =
    codigo || "# Nenhum código gerado.";
}

function configurarAtualizacaoCodigo() {
   if (workspace) {
       workspace.addChangeListener(function (event) {
           // Verifica se a alteração foi relevante (por exemplo, a adição de blocos)
           if (event.type === Blockly.Events.BLOCK_CREATE ||
               event.type === Blockly.Events.BLOCK_CHANGE ||
               event.type === Blockly.Events.BLOCK_DELETE ||
               event.type === Blockly.Events.BLOCK_MOVE) {
               atualizarCodigoPython(); // Atualiza o código quando um bloco for adicionado ou modificado
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
// Funçõe NavBar (não implementadas ainda)
// function salvarProjeto() {
//   const xml = Blockly.Xml.workspaceToDom(workspace);
//   const xmlText = Blockly.Xml.domToPrettyText(xml);
//   const blob = new Blob([xmlText], { type: "text/xml" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "projeto_zoy.xml";
//   a.click();
// }

// function carregarProjeto() {
//   const input = document.createElement("input");
//   input.type = "file";
//   input.accept = ".xml";
//   input.onchange = (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();
//     reader.onload = function (e) {
//       const xml = Blockly.Xml.textToDom(e.target.result);
//       Blockly.Xml.domToWorkspace(xml, workspace);
//     };
//     reader.readAsText(file);
//   };
//   input.click();
// }

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

let conectado = false;

async function conectarPorta() {
  const porta = document.getElementById("selectPorta").value;
  if (!porta) {
    log("Selecione uma porta antes de conectar.", "erro");
    return;
  }
  try {
    const resultado = await window.electronAPI.conectarPorta(porta);
    if (resultado.status) {
      conectado = true;
      document.getElementById("btnConectar").textContent = "Desconectar";
      document.getElementById("btnConectar").classList.remove("btn-warning");
      document.getElementById("btnConectar").classList.add("btn-danger");
      log(resultado.mensagem, "sistema");
    } else {
      log(resultado.mensagem, "erro");
    }
  } catch (err) {
    log("Erro ao conectar: " + err.message, "erro");
  }
}

async function desconectarPorta() {
  try {
    const resultado = await window.electronAPI.desconectarPorta();
    if (resultado.status) {
      conectado = false;
      document.getElementById("btnConectar").textContent = "Conectar";
      document.getElementById("btnConectar").classList.remove("btn-danger");
      document.getElementById("btnConectar").classList.add("btn-warning");
      log(resultado.mensagem, "sistema");
    } else {
      log(resultado.mensagem, "erro");
    }
  } catch (err) {
    log("Erro ao desconectar: " + err.message, "erro");
  }
}

// Função para alternar a conexão
function toggleConexao() {
  if (conectado) {
    window.electronAPI.desconectarPorta();
  } else {
    window.electronAPI.conectarPorta(
      document.getElementById("selectPorta").value
    );
  }
}
window.toggleConexao = toggleConexao;

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

   // Expandir área do código Python
  const pre = document.getElementById("codigoPython");
  pre.addEventListener("click", function () {
    const preElement = document.getElementById("codigoPython");
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

  // Select baudrate
  // document.getElementById("selectBaudrate").addEventListener("change", (e) => atualizarBaudrate(e.target.value));

  // Adiciona o evento de clique no botão executar código
  const btnExecutarCodigo = document.getElementById("btnExecutarCodigo");
  if (btnExecutarCodigo) {
    btnExecutarCodigo.addEventListener("click", executarCodigo);
  }
});


async function executarCodigo() {
  const preElement = document.getElementById("codigoPython");
  const codigoPython = preElement?.textContent?.trim();

  if (!codigoPython || codigoPython.includes("Nenhum código gerado")) {
    alert("Nenhum código Python válido foi gerado.");
    return;
  }

  console.log("🧠 Código a executar:\n", codigoPython);

  try {
    const resultado = await window.electronAPI.executarCodigo(codigoPython);

    if (resultado.status) {
      console.log("[✅] Execução concluída com sucesso.");
    } else {
      console.error("[❌] Erro na execução:");
    }

    // Exibir logs no console
    if (Array.isArray(resultado.logs)) {
      resultado.logs.forEach(log => console.log(log));
    }

    // Se quiser exibir na UI futuramente:
    // document.getElementById("terminal").textContent = resultado.logs.join('\n');

  } catch (err) {
    console.error("[ERRO] Falha ao executar código:", err);
  }
}
