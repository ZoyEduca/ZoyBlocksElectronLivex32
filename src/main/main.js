// chamada dos serviços
const serialService = require("../main/services/serial-services");
const blocklyService = require("../main/services/blockly-service");

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

let pythonProcess = null;

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
});

// Handler de pergunta ao chatbot
ipcMain.handle("perguntar", async (event, pergunta) => {
  return new Promise((resolve, reject) => {
    if (!pythonProcess || pythonProcess.killed) {
      reject("O processo do Python não está ativo.");
      return;
    }

    let resposta = "";

    const onData = (data) => {
      resposta += data.toString();
      try {
        const json = JSON.parse(resposta.trim());
        pythonProcess.stdout.removeListener("data", onData);
        resolve(json.resposta);
      } catch (e) {
        // Continua esperando por mais dados
      }
    };

    pythonProcess.stdout.on("data", onData);

    pythonProcess.stdin.write(JSON.stringify({ pergunta }) + "\n");
  });
});

// === LOG DE CONVERSAS ===
ipcMain.handle("log-conversation", async (event, pergunta, resposta) => {
  const logDir = path.join(app.getPath("home"), "logs"); // Diretório para salvar os logs, ex: desktop/logs
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

// -------------------------- Funções Utilitárias ------------------------------
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

  const scriptPath = path.join(basePath, "python", "chatbot.py");

  return { pythonPath, scriptPath };
}

// Inicia o processo Python
function startPythonProcess() {
  const { pythonPath, scriptPath } = getPythonPaths();

  pythonProcess = spawn(pythonPath, [scriptPath], {
    cwd: path.dirname(scriptPath),
    stdio: ["pipe", "pipe", "pipe"],
  });

  pythonProcess.stderr.setEncoding("utf8");
  pythonProcess.stdout.setEncoding("utf8");

  pythonProcess.on("error", (err) =>
    console.error("❌ Erro ao iniciar Python:", err)
  );
  pythonProcess.stderr.on("data", (d) =>
    console.error("🐍 Python stderr:", d.toString())
  );
  pythonProcess.on("exit", (code) =>
    console.log("🐍 Processo Python encerrado com código:", code)
  );
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





// ----------------------------------------------------------------------------
// ----------- Handlers do IPC para Executar blocos ---------------------------
// ----------------------------------------------------------------------------

ipcMain.handle("executar-codigo", (event, comando) =>
  blocklyService.executarCodigo(comando)
);





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
    if (parsedUrl.protocol !== "https:") {
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

// Sai quando todas as janelas são fechadas, exceto no macOS. Lá, é comum
// que os aplicativos e sua barra de menu permaneçam ativos até que o usuário saia
// explicitamente com Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
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
