const { SerialPort, ReadlineParser } = require('serialport');
const { BrowserWindow } = require('electron');

let serialPort = null;
let parser = null;

function enviarDadosSerial(dados) {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('onDadosSerial', dados);
            win.webContents.send('onRespostaSerial', dados);
        }
    });
}

function enviarStatusSerial(data) {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('onStatusSerial', data);
        }
    });
}

async function listarPortas() {
    try {
        const ports = await SerialPort.list();
        const portPaths = ports.map(port => port.path);
        console.log(`[INFO] Portas encontradas: ${portPaths.join(', ')}`);
        return portPaths;
    } catch (error) {
        console.error("Erro ao listar portas:", error);
        return [];
    }
}

async function conectarPorta(porta, baudRate) {
    try {
        if (serialPort && serialPort.isOpen) {
            await serialPort.close();
        }

        serialPort = new SerialPort({
            path: porta,
            baudRate: baudRate,
        });

        // Adiciona um listener para o evento de 'open' para logar a conexão.
        serialPort.on('open', () => {
            console.log(`[INFO] Conectado à porta ${porta} com baudrate ${baudRate}`);
            enviarStatusSerial({ mensagem: `Conectado à porta ${porta}` });
        });

        parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
        parser.on('data', data => {
            const trimmedData = data.toString().trim();
            if (trimmedData) {
                enviarDadosSerial(trimmedData);
            }
        });

        serialPort.on('close', () => {
            console.log(`[INFO] Desconectado da porta ${porta}`);
            enviarStatusSerial({ mensagem: `Desconectado da porta ${porta}` });
        });

        // Captura e reporta erros de forma mais detalhada.
        serialPort.on('error', (err) => {
            console.error(`[ERRO] Erro na porta serial: ${err.message}`);
            enviarStatusSerial({ mensagem: `Erro na porta serial: ${err.message}` });
        });
        
        return { status: true, mensagem: `Conectado à porta ${porta}` };
    } catch (error) {
        console.error("Erro ao conectar na porta:", error);
        enviarStatusSerial({ mensagem: `Falha ao conectar: ${error.message}` });
        return { status: false, mensagem: `Erro ao conectar: ${error.message}` };
    }
}

async function desconectarPorta() {
    if (serialPort && serialPort.isOpen) {
        try {
            await serialPort.close();
            console.log("[INFO] Desconectando...");
            return { status: true, mensagem: "Desconectado com sucesso." };
        } catch (error) {
            console.error("Erro ao desconectar:", error);
            return { status: false, mensagem: `Erro ao desconectar: ${error.message}` };
        }
    } else {
        return { status: false, mensagem: "Nenhum dispositivo conectado." };
    }
}

async function enviarComandoSerial(comando) {
    try {
        if (!serialPort || !serialPort.isOpen) {
            throw new Error('Dispositivo não conectado.');
        }

        // Converte o comando para um Buffer, replicando a codificação do Python
        const comandoBuffer = Buffer.from(comando + '\n', 'utf-8');

        await new Promise((resolve, reject) => {
            serialPort.write(comandoBuffer, (err) => {
                if (err) {
                    return reject(err);
                }

                serialPort.drain((drainErr) => {
                    if (drainErr) {
                        return reject(drainErr);
                    }
                    console.log(`[INFO] Comando enviado e buffer esvaziado: ${comando}`);
                    resolve();
                });
            });
        });

        return { status: true, mensagem: `Comando enviado: ${comando}` };
    } catch (error) {
        console.error("Erro ao enviar comando:", error);
        return { status: false, mensagem: `Erro ao enviar comando: ${error.message}` };
    }
}


module.exports = {
    listarPortas,
    conectarPorta,
    desconectarPorta,
    enviarComandoSerial,
};