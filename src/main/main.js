// chamada dos serviços
const serialService = require("../main/services/serial-services");
const blocklyService = require("../main/services/blockly-service");

const wifi = require("./services/wifi-services");
const dm = require("./services/device-manager");

const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");

require("dotenv").config();
const fs = require("fs/promises");
const { spawn } = require("child_process");
const path = require("path");

console.log("-------------------------------------");
console.log("Ambiente atual:", process.env.NODE_ENV);
console.log("-------------------------------------");

let pythonProcess = null; //processo do chatbot Python
let visionProcess = null; //processo do Zoy Vision Python

// ------------------------------------------------------------
// ----------- Janela principal -------------------------------
// ------------------------------------------------------------
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload", "preload.js"),
      contextIsolation: true, // isola contextos de JS
      nodeIntegration: false, // não permite require() no renderer/frontend
      enableRemoteModule: false, // desativa remote, Evita vulnerabilidades antigas
      sandbox: false, // Permite require("path") no preload
    },
  });

  // Maximiza a janela após a criação
  mainWindow.maximize();

  // carrega o index.html do aplicativo.
  mainWindow.loadFile(
    path.join(__dirname, "..", "renderer", "views", "home", "home.html")
  );

  // Habilita DevTools | Desative o DevTools em produção
  /*
  DevTools é um conjunto de ferramentas de desenvolvimento integradas ao Chromium, usado para depurar,
  inspecionar e otimizar, fornecendo recursos como o console, inspeção de elementos e outros.
  Em modo de produção, é recomendável desativar o DevTools para melhorar a segurança e o desempenho da aplicação.
  */
  //  Atualmente 22.09.2025 com erro em autofill - esperando correção futura do electron
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.closeDevTools();
  }

  // --- NOVO: Handler IPC para Navegação (Go Back) ---
  ipcMain.on("navigate-to-view", (event, viewName) => {
    let filePath;
    // Assume que 'home' é o retorno para Robótica
    if (viewName === "home") {
      filePath = path.join(
        __dirname,
        "..",
        "renderer",
        "views",
        "home",
        "home.html"
      );
    }

    if (filePath) {
      mainWindow.loadFile(filePath);
    }
  });
};


ipcMain.handle("wifi:conectar", async (e, ip) => {
    return wifi.conectarWifi(ip);
});

ipcMain.handle("wifi:enviar", async (e, cmd) => {
    return wifi.enviarComandoWifi(cmd);
});

ipcMain.handle("wifi:desconectar", async () => {
    return wifi.desconectarWifi();
});

// ----------------------------------------------------------------------------
// ----------- Handlers do IPC para iniciar os processos do chatbot -----------
// ----------------------------------------------------------------------------
ipcMain.handle("abrir-zoygpt", () => {
  const gptWindow = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false,
    },
  });

  // Inicia o processo Python se ainda não estiver ativo
  if (!pythonProcess || pythonProcess.killed) {
    startPythonProcess();
  }

  // Remover o menu só para esta janela
  gptWindow.setMenu(null);

  gptWindow.loadFile(
    path.join(__dirname, "..", "renderer", "views", "zoygpt", "zoygpt.html")
  );

  // Habilita DevTools | Desative o DevTools em produção
  if (process.env.NODE_ENV === "development") {
    gptWindow.webContents.openDevTools();
  } else {
    gptWindow.webContents.closeDevTools();
  }

  // Quando fechar a janela → encerra o Python
  gptWindow.on("closed", () => {
    if (pythonProcess && !pythonProcess.killed) {
      try {
        pythonProcess.kill("SIGTERM");
        console.log("Processo Python encerrado ao fechar janela GPT");
      } catch (e) {
        console.error("Erro ao encerrar o Python:", e);
      }
    }
  });
});


// Handler de pergunta ao chatbot
ipcMain.handle("perguntar", async (event, pergunta) => {
  return new Promise((resolve, reject) => {
    if (!pythonProcess || pythonProcess.killed) {
      reject("O processo do Python não está ativo.");
      return;
    }

    let buffer = "";

    const onData = (data) => {
      buffer += data.toString();

      // processar linha por linha
      const lines = buffer.split("\n");
      buffer = lines.pop(); // última linha pode estar incompleta

      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;

        // Tenta parsear JSON
        try {
          const json = JSON.parse(t);
          pythonProcess.stdout.removeListener("data", onData);
          resolve(json.resposta);
        } catch (e) {
          // Não é JSON → é log → ignore
          console.log("Python stdout:", t);
        }
      }
    };

    pythonProcess.stdout.on("data", onData);

    // Envia pergunta ao python
    pythonProcess.stdin.write(JSON.stringify({ pergunta }) + "\n");
  });
});


// === LOG DE CONVERSAS ===
ipcMain.handle("log-conversation", async (event, pergunta, resposta) => {
  const logDir = path.join(app.getPath("desktop"), "logs"); // Diretório para salvar os logs, ex: desktop/logs
  const logFilePath = path.join(logDir, "conversas.log"); // Caminho completo do arquivo de log

  try {
    await fs.mkdir(logDir, { recursive: true });
    const logData = {
      timestamp: new Date().toISOString(),
      pergunta,
      resposta,
    };
    await fs.appendFile(logFilePath, JSON.stringify(logData) + "\n");
    console.log("Conversa salva com sucesso.");
  } catch (error) {
    console.error("Falha ao salvar o log da conversa:", error);
  }
});

/* =============================================================
   🐍 CONTROLE DO PROCESSO PYTHON
============================================================= */

/**
 * Retorna o caminho do interpretador Python e do script chatbot.py
 * ajustando conforme ambiente (dev x produção).
 */
// Função para gerar os caminhos dinâmicos do Python
function getPythonPaths() {
  const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();

  const pythonPath = path.join(
    basePath,
    "venv",
    process.platform === "win32" ? "Scripts" : "bin",
    process.platform === "win32" ? "python.exe" : "python"
  );

  const scriptPath = path.join(basePath, "python", "chatbot", "chatbot.py");

  return { pythonPath, scriptPath };
}

// Inicia o processo Python
function startPythonProcess() {
  const { pythonPath, scriptPath } = getPythonPaths();

  pythonProcess = spawn(pythonPath, [scriptPath], {
    cwd: path.dirname(scriptPath),
    stdio: ["pipe", "pipe", "pipe"], // stdin, stdout, stderr
  });

  pythonProcess.stdout.setEncoding("utf8");
  pythonProcess.stderr.setEncoding("utf8");

  // Erro ao iniciar o Python
  pythonProcess.on("error", (err) => {
    console.error("Erro ao iniciar Python:", err);
  });

  // Captura stdout → respostas e logs
  pythonProcess.stdout.on("data", (data) => {
    const text = data.toString().trim();

    // Tenta identificar se é JSON válido (resposta do chatbot)
    try {
      const json = JSON.parse(text);

      // Enviando resposta real
      if (json.resposta !== undefined) {
        console.log("Resposta Python:", json.resposta);

        // Aqui você chama sua função de UI:
        // updateChat(json.resposta);
      }
      return;
    } catch {
      // Não era JSON → apenas log normal
      console.log("Python log:", text);
    }
  });

  // Captura stderr → apenas erros
  pythonProcess.stderr.on("data", (d) => {
    console.error("Python ERRO:", d.toString().trim());
  });

  // Aviso quando Python fecha
  pythonProcess.on("exit", (code) => {
    console.log("Processo Python encerrado com código:", code);
  });
}


// ----------------------------------------------------------------------------
// ----------- Handler do IPC para Zoy Vision ---------------------------------
// ----------------------------------------------------------------------------
ipcMain.handle("abrir-zoy-vision", () => {
  // 1. Inicia o Python
  startVisionProcess();

  // 2. Retorna sucesso imediato (a UI lida com erros via logs)
  return { status: true, msg: "Zoy Vision Iniciado" };
});

// ------------------------------------------------------------
// 🐍 CONTROLE DO PROCESSO ZOY VISION
// ------------------------------------------------------------
// Função para gerar os caminhos dinâmicos do Zoy Vision
function getVisionPaths() {
  const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
  
  // Caminho do Python (usa o mesmo venv do chatbot ou o sistema em dev)
  // Nota: Em modo empacotado, o Vision tem seu próprio executável, então o pythonPath muda.
  
  let execPath;
  let args = [];
  let cwd;

  if (app.isPackaged) {
    // 🚀 PRODUÇÃO: Executável compilado pelo PyInstaller (dentro da pasta dist/vision/)
    // Caminho: resources/python/zoy_vision/dist/vision/vision.exe
    const distPath = path.join(basePath, "python", "zoy_vision");
    
    if (process.platform === "win32") {
      execPath = path.join(distPath, "zoy_vision.exe");
    } else {
      execPath = path.join(distPath, "zoy_vision");
    }
    cwd = distPath;
    
  } else {
    // 🧪 DESENVOLVIMENTO: Roda o script .py usando o Python do venv
    const pythonExecutable = process.platform === "win32" ? "python.exe" : "python";
    execPath = path.join(basePath, "venv", process.platform === "win32" ? "Scripts" : "bin", pythonExecutable);
    
    const scriptPath = path.join(basePath, "python", "zoy_vision", "vision.py");
    args = [scriptPath];
    cwd = path.dirname(scriptPath);
  }

  return { execPath, args, cwd };
}

// Inicia o processo do Zoy Vision
function startVisionProcess() {
  if (visionProcess && !visionProcess.killed) {
    console.log("Zoy Vision já está rodando.");
    return;
  }

  const { execPath, args, cwd } = getVisionPaths();
  console.log(`[VISION] Iniciando: ${execPath} com args: ${args}`);

  visionProcess = spawn(execPath, args, {
    cwd: cwd,
    stdio: ["pipe", "pipe", "pipe"], // Importante para capturar o SERIAL_CMD
  });

  visionProcess.stdout.setEncoding("utf8");
  visionProcess.stderr.setEncoding("utf8");

  // --- ESCUTANDO COMANDOS DO PYTHON ---
  visionProcess.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    
    lines.forEach(line => {
      const text = line.trim();
      if (!text) return;

      console.log(`[VISION LOG]: ${text}`);

      // Se o Python mandar "SERIAL_CMD:<comando>", enviamos para o Arduino
      if (text.startsWith("SERIAL_CMD:")) {
        const comandoSerial = text.replace("SERIAL_CMD:", "");
        console.log(`[VISION -> SERIAL]: Enviando ${comandoSerial}`);
        
        // Chama o serviço de serial existente
        serialService.enviarComandoSerial(comandoSerial)
          .catch(err => console.error(`[VISION SERIAL ERRO]: ${err.message}`));
      }
    });
  });

  visionProcess.stderr.on("data", (data) => {
    console.error(`[VISION ERR]: ${data}`);
  });

  visionProcess.on("close", (code) => {
    console.log(`[VISION] Processo encerrado com código: ${code}`);
    visionProcess = null;
  });
  
  visionProcess.on("error", (err) => {
      console.error("[VISION FATAL]", err);
  });
}


// ----------------------------------------------------------------------------
// ----------- Handlers do IPC para Serial ------------------------------------
// ----------------------------------------------------------------------------

ipcMain.handle("listar-portas", () => serialService.listarPortas());

ipcMain.handle("conectar-porta", async (event, porta, baudrate) => {
  try {
    if (typeof porta !== "string" || !porta.trim()) {
      const mensagemErro = "A porta serial não foi selecionada ou é inválida.";
      return { status: false, mensagem: mensagemErro };
    }

    // Tente conectar à porta serial
    const resultado = await serialService.conectarPorta(porta, baudrate);
    if (!resultado) {
      const mensagemErro = "Falha ao conectar à porta serial.";
      return { status: false, mensagem: mensagemErro };
    }

    // Se a conexão for bem-sucedida
    return { status: true, mensagem: "Conexão estabelecida com sucesso!" };

  } catch (error) {
    // Se ocorrer algum erro no processo de conexão
    return { status: false, mensagem: `Erro ao tentar conectar: ${error.message}` };
  }
});


ipcMain.handle("desconectar-porta", async () => {
  try {
    const resultado = await serialService.desconectarPorta();
    if (resultado) {
      return { status: true, mensagem: "Desconexão bem-sucedida!" };
    } else {
      const mensagemErro = "Falha ao desconectar da porta serial.";
      return { status: false, mensagem: mensagemErro };
    }
  } catch (error) {
    // Caso ocorra algum erro no processo de desconexão
    return { status: false, mensagem: `Erro ao tentar desconectar: ${error.message}` };
  }
});


ipcMain.handle("enviar-comando-serial", (event, comando) =>
  serialService.enviarComandoSerial(comando)
);



ipcMain.handle("dm:conectarUSB",  (e, porta) => dm.conectarUSB(porta));
ipcMain.handle("dm:conectarWifi", (e, ip)    => dm.conectarWifi(ip));
ipcMain.handle("dm:enviar",       (e, cmd)   => dm.enviar(cmd));
ipcMain.handle("dm:desconectar",  () => dm.desconectar());
ipcMain.handle("dm:status",       () => dm.getStatus());



// ----------------------------------------------------------------------------
// ----------- Handlers do IPC para Executar blocos ---------------------------
// ----------------------------------------------------------------------------
ipcMain.handle("executar-codigo", async (event, comando) => {
  try {
    const resultado = await blocklyService.executarCodigo(comando);
    return resultado;
  } catch (err) {
    console.error("[ERRO] Erro na execução de código:", err);
    return {
      status: false,
      mensagem: `Erro interno no main process: ${err.message}`,
    };
  }
});




// ----------------------------------------------------------------------------
// ----------- Handlers do IPC para Terminal Completo -------------------------
// ----------------------------------------------------------------------------
ipcMain.handle("abrir-terminal-completo", () => {
  const terminalWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false,
    },
  });
  // Remover o menu só para esta janela
  terminalWindow.setMenu(null);

  terminalWindow.loadFile(
    path.join(__dirname, "..", "renderer", "views", "terminal", "terminal.html")
  );

  // habilita DevTools | Desative o DevTools em produção
  if (process.env.NODE_ENV === "development") {
    terminalWindow.webContents.openDevTools();
  } else {
    terminalWindow.webContents.closeDevTools();
  }
});



// ----------------------------------------------------------------------------
// ----------- Handlers do IPC para areas games -------------------------------
// ----------------------------------------------------------------------------
ipcMain.handle("abrir-zoygames", () => {
  const gptWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false,
    },
  });

  gptWindow.loadFile(
    path.join(__dirname, "..", "renderer", "views", "zoyjogos", "zoyjogos.html")
  );

  // Habilita DevTools | Desative o DevTools em produção
  if (process.env.NODE_ENV === "development") {
    gptWindow.webContents.openDevTools();
  } else {
    gptWindow.webContents.closeDevTools();
  }
});


ipcMain.handle("abrir-blocklygames", () => {
  const gptWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false,
    },
  });

  gptWindow.loadFile(
    path.join(__dirname, "..", "renderer", "views", "blockly_Games", "index.html")
  );

  // Habilita DevTools | Desative o DevTools em produção
  if (process.env.NODE_ENV === "development") {
    gptWindow.webContents.openDevTools();
  } else {
    gptWindow.webContents.closeDevTools();
  }
});



// ----------------------------------------------------------------------------
// ----------- Handlers do IPC para abrir links externos ----------------------
// ----------------------------------------------------------------------------

ipcMain.handle("open-external", async (event, url) => {
  if (isSafeUrl(url)) {
    try {
      await shell.openExternal(url);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err.message };
    }
  } else {
    return { ok: false, reason: "URL não permitida" };
  }
});

// Função para verificar se a URL é segura (whitelist)
function isSafeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Permitindo apenas https:// para maior segurança
    if (parsedUrl.protocol !== "http:") {
      return false;
    }
    // Adicione outros domínios confiáveis conforme necessário
    const allowedDomains = ["zoy.com.br"];
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}


// -------------------------------------------------------------
// ----------- Lógica de inicialização do aplicativo -----------
// -------------------------------------------------------------
// Algumas APIs só podem ser usadas depois que este evento ocorre.
app.whenReady().then(() => {
  // Cria a janela principal
  createWindow();

  // No macOS, é comum recriar uma janela no aplicativo quando o ícone do dock é clicado e não há outras janelas abertas.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Desabilita os atalhos logo após a inicialização em modo produção
  if (process.env.NODE_ENV === "production") {
    disableDevToolsShortcuts();
  }
});


// ----------------------------------------------------
// ----------- Funções de configurações Globais -------
// ----------------------------------------------------
// Remover atalhos de inspeção (Desabilita F12, Ctrl+Shift+I e outros)
function disableDevToolsShortcuts() {
  // Desabilita os atalhos principais do DevTools
  globalShortcut.register("F12", () => {});
  globalShortcut.register("Ctrl+Shift+I", () => {});
  globalShortcut.register("Cmd+Opt+I", () => {}); // macOS
  globalShortcut.register("Ctrl+Shift+J", () => {});
  globalShortcut.register("Cmd+Opt+J", () => {}); // macOS
  globalShortcut.register("Ctrl+Alt+I", () => {});
  globalShortcut.register("Cmd+Alt+I", () => {}); // macOS
  
  // Desabilita atalhos adicionais
  globalShortcut.register("Ctrl+Shift+U", () => {});
  globalShortcut.register("Ctrl+Shift+P", () => {});
  globalShortcut.register("Ctrl+Shift+F", () => {});
  globalShortcut.register("F1", () => {});
}

// ========================================================================
// Eventos de encerramento — evita múltiplos handlers e garante finalização
// ========================================================================

let encerrando = false;

async function encerrarUnico() {
    if (encerrando) return;
    encerrando = true;
    await finalizarTudo();
}

async function finalizarTudo() {
    console.log("\n=== ENCERRANDO SISTEMA ===");

    // 1) Finaliza o Python, caso exista
    try {
        if (pythonProcess && !pythonProcess.killed) {
            console.log("[ENCERRAR] Encerrando Python...");
            pythonProcess.kill("SIGKILL");
        }
    } catch (err) {
        console.error("[ERRO] Ao encerrar pythonProcess:", err.message);
    }

    // 2) Finaliza o Python Vision (ADICIONE ISSO)
    try {
        if (visionProcess && !visionProcess.killed) {
            console.log("[ENCERRAR] Encerrando Zoy Vision...");
            visionProcess.kill("SIGKILL");
        }
    } catch (err) {
        console.error("[ERRO] Ao encerrar visionProcess:", err.message);
    }

    // 3) Desconecta a serial corretamente
    try {
        console.log("[ENCERRAR] Fechando porta serial...");
        await serialService.desconectarPorta();
    } catch (err) {
        console.error("[ERRO] Ao encerrar porta serial:", err.message);
    }

    // 4) Limpa timers, sandbox, fila ou serviços adicionais
    try {
        if (blocklyService?.finalizar) {
            console.log("[ENCERRAR] Finalizando serviço Blockly...");
            blocklyService.finalizar();
        }
    } catch (err) {
        console.error("[ERRO] Ao finalizar serviço Blockly:", err.message);
    }

    console.log("[OK] Encerramento completo.");
    process.exit(0);
}

// Sai quando todas as janelas são fechadas, exceto no macOS. Lá, é comum
// que os aplicativos e sua barra de menu permaneçam ativos até que o usuário saia
// explicitamente com Cmd + Q.
app.on("window-all-closed", async () => {
  console.log("[EVENT] window-all-closed");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// CTRL + C no terminal
process.on("SIGINT", async () => {
    console.log("[EVENT] SIGINT");
    await encerrarUnico();
});

// Encerramento normal
app.on("before-quit", async (e) => {
    console.log("[EVENT] before-quit");
    e.preventDefault();
    await encerrarUnico();
});

// Sinais do SO
process.on("SIGTERM", async () => {
    console.log("[EVENT] SIGTERM");
    await encerrarUnico();
});

// Segurança extra para exceptions não tratadas
process.on("uncaughtException", async (err) => {
    console.error("[ERRO FATAL]", err);
    await encerrarUnico();
});