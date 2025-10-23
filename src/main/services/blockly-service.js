// blockly-service.js

const serialService = require("./serial-services"); // Importa o serviço serial

async function executarCodigo(codigoJavaScript) {
  const logs = [];
  logs.push(`[INFO] Código JavaScript recebido:\n${codigoJavaScript}`);

  // === Mapeamento das Funções do Blockly para a Ação Serial ===
  const blocklyFunctions = {
    // Função utilitária: adiciona o comando à fila serial
    enviarComando: async (funcao, comando, argumentos_comando = "") => {
      let comandoSerial = `<${comando}:${argumentos_comando}>`;
      logs.push(`[INFO] [${funcao}] Traduzido para: ${comandoSerial}`);

      // Chama o serialService.enviarComandoSerial (adicionarComandoNaFila)
      const resultadoEnvio = await serialService.enviarComandoSerial(
        comandoSerial
      );

      if (!resultadoEnvio.status) {
        const erro = `Falha ao adicionar à fila: ${resultadoEnvio.mensagem}`;
        logs.push(`[ERRO] [${funcao}] ${erro}`);
        // Quebra a execução do script JS se a serial não estiver aberta
        throw new Error(`Falha de conexão: ${resultadoEnvio.mensagem}`);
      }
    },

    // Mapeamento de todas as funções dos seus blocos:

    // ----------- Funções gerais -------------------
    iniciar_zoy: async (comando, argsString) =>
      blocklyFunctions.enviarComando("iniciar_zoy", comando, argsString),
    set_pin_mode: async (comando, argsString) =>
      blocklyFunctions.enviarComando("set_pin_mode", comando, argsString),
    digital_write: async (comando, argsString) =>
      blocklyFunctions.enviarComando("digital_write", comando, argsString),
    definir_pino_digital: async (comando, argsString) =>
      blocklyFunctions.enviarComando("definir_pino_digital", comando, argsString),
    analog_write: async (comando, argsString) =>
      blocklyFunctions.enviarComando("analog_write", comando, argsString),
    pausa: async (comando, argsString) =>
      blocklyFunctions.enviarComando("pausa", comando, argsString), // Inclui aguarde_segundos

    // ----------- Funções LED ----------------------
    led_pisca_n: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_pisca_n", comando, argsString),
    led_left: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_left", comando, argsString),
    led_right: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_right", comando, argsString),
    som_nota: async (comando, argsString) =>
      blocklyFunctions.enviarComando("som_nota", comando, argsString),

    // ----------- Funções Mover -------------------
    motor_esquerdo_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_esquerdo_frente", comando, argsString),
    motor_direito_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_direito_frente", comando, argsString),
    motor_esquerdo_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_esquerdo_tras", comando, argsString),
    motor_direito_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_direito_tras", comando, argsString),

    // ----------- Funções Motores -------------------
    ler_ultrassom: async (comando, argsString) =>
      blocklyFunctions.enviarComando("ler_ultrassom", comando, argsString),
    mover_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("mover_frente", comando, argsString),
    mover_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("mover_tras", comando, argsString),
    parar_motor: async (comando, argsString) =>
      blocklyFunctions.enviarComando("parar_motor", comando, argsString),

    servo: async (comando, argsString) =>
      blocklyFunctions.enviarComando("servo", comando, argsString),
    servo360: async (comando, argsString) =>
      blocklyFunctions.enviarComando("servo360", comando, argsString),

    // ----------- Funções Serial -------------------
    serial_println_cmd: async (msg) => {
      // Remove aspas da string para o comando serial, se houver
      const args = String(msg).replace(/^['"]|['"]$/g, "");
      // NOTA: O firmware do Arduino deve reconhecer o comando 'SERIAL_PRINT'
      return blocklyFunctions.enviarComando(
        "serial_println",
        "SERIAL_PRINT",
        args
      );
    },

    serial_read_cmd: async () => {
      // NOTA: O bloco 'serial_read' é complexo.
      // Por enquanto, apenas enviamos a requisição e retornamos um valor padrão '0'.
      await blocklyFunctions.enviarComando(
        "serial_read",
        "SERIAL_READ_REQ",
        ""
      );
      return "0"; // Retorna 0 para evitar que o código JavaScript quebre
    },
  };

  try {
    // Envolve o código do usuário em uma função assíncrona auto-executável (IIFE).
    const wrappedCode = `(async () => { ${codigoJavaScript} })()`;

    // Cria a função de execução para injetar as variáveis (funções do robô e logs).
    const runInContext = new Function(
      ...Object.keys(blocklyFunctions), // Nomes das funções (e.g., 'pausa', 'mover_frente')
      "logs",
      wrappedCode // Passa a função async auto-executável
    );

    // O 'await' está aqui, dentro da função 'async executarCodigo', o que é o lugar correto.
    await runInContext(...Object.values(blocklyFunctions), logs);
  } catch (err) {
    logs.push(
      `[ERRO FATAL] Erro durante a execução do código JavaScript: ${err.message}`
    );
    return {
      status: false,
      mensagem: `Erro de execução: ${err.message}`,
      logs,
    };
  }

  logs.push(
    `[SUCESSO] Todos os comandos do script JavaScript (incluindo laços de repetição) foram adicionados à fila de execução serial com sucesso.`
  );
  return { status: true, mensagem: "Execução (Adição à fila) concluída", logs };
}

module.exports = { executarCodigo };
