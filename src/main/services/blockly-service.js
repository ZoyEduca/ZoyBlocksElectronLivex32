// blockly-service.js

const serialService = require("./serial-services"); // Importa o serviço serial
const vm = require("node:vm"); // ✅ Sandbox seguro do Node.js

// --- Função para prevenir loops infinitos ---
function protegerLoops(codigo) {
  const loopCounterVar = "__loopCounter";
  const limitVar = "__loopLimit";

  const header = `
    let ${loopCounterVar} = 0;
    const ${limitVar} = 5;
    function __checkLoop() {
      if (++${loopCounterVar} > ${limitVar}) {
        throw new Error("⚠️ Execução interrompida — limite máximo(5) de repetições atingido");
      }
    }
  `;

  // Versão corrigida das substituições
  const protegido = codigo
    // Adiciona a checagem dentro dos blocos de repetição, sem quebrar a sintaxe
    .replace(/while\s*\((.*?)\)\s*\{/g, "while($1){ __checkLoop();")
    .replace(/for\s*\((.*?)\)\s*\{/g, "for($1){ __checkLoop();")
    .replace(/do\s*\{/g, "do { __checkLoop(); ");

  return header + "\n" + protegido;
}


async function executarCodigo(codigoJavaScript) {
  const logs = [];
  logs.push(`[INFO] Código JavaScript recebido:\n${codigoJavaScript}`);

  // Protege o código antes de rodar
  const codigoProtegido = protegerLoops(codigoJavaScript);

  // === Mapeamento das Funções do Blockly para a Ação Serial ===
  const blocklyFunctions = {
    // Função utilitária: adiciona o comando à fila serial
    enviarComando: async (funcao, comando, argumentos_comando = "") => {
      let comandoSerial = `<${comando}:${argumentos_comando}>`;
      logs.push(`[INFO] [${funcao}] Traduzido para: ${comandoSerial}`);

      // Chama o serialService.enviarComandoSerial (adicionarComandoNaFila)
      const resultadoEnvio = await serialService.enviarComandoSerial( comandoSerial);

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
    definir_pino_pwm: async (comando, argsString) =>
      blocklyFunctions.enviarComando("definir_pino_pwm", comando, argsString),
    pausa: async (comando, argsString) =>
      blocklyFunctions.enviarComando("pausa", comando, argsString), // Inclui aguarde_segundos

    // ----------- Funções LED ----------------------
    led_pisca_n: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_pisca_n", comando, argsString),
    led_left: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_left", comando, argsString),
    led_right: async (comando, argsString) =>
      blocklyFunctions.enviarComando("led_right", comando, argsString),

    // ----------- Funções Motores -------------------
    mover_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("mover_frente", comando, argsString),
    mover_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("mover_tras", comando, argsString),
    motor_esquerdo_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_esquerdo_frente", comando, argsString),
    motor_direito_frente: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_direito_frente", comando, argsString),
    motor_esquerdo_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_esquerdo_tras", comando, argsString),
    motor_direito_tras: async (comando, argsString) =>
      blocklyFunctions.enviarComando("motor_direito_tras", comando, argsString),

    parar_motor: async (comando, argsString) =>
      blocklyFunctions.enviarComando("parar_motor", comando, argsString),
    parar_motor_esquerdo: async (comando, argsString) =>
      blocklyFunctions.enviarComando("parar_motor_esquerdo", comando, argsString),
    parar_motor_direito: async (comando, argsString) =>
      blocklyFunctions.enviarComando("parar_motor_direito", comando, argsString),



    // ----------- Funções Servo -------------------
    servo: async (comando, argsString) =>
      blocklyFunctions.enviarComando("servo", comando, argsString),
    servo360: async (comando, argsString) =>
      blocklyFunctions.enviarComando("servo360", comando, argsString),

    // ----------- Funções Sensores -------------------
    ler_ultrassom: async (comando, argsString) =>
      blocklyFunctions.enviarComando("ler_ultrassom", comando, argsString),

    // ----------- Funções Som -------------------
    som_nota: async (comando, argsString) =>
      blocklyFunctions.enviarComando("som_nota", comando, argsString),

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
    // Cria um sandbox isolado e seguro
    const contexto = vm.createContext({
      ...blocklyFunctions,
      logs,
      console,
      setTimeout,
      clearTimeout,
    });

    // Compila e executa o script dentro do sandbox com limite de tempo
    const script = new vm.Script(`(async () => { ${codigoProtegido} })()`);
    await script.runInContext(contexto, { timeout: 2000 }); // 2s por execução
  } catch (err) {
    logs.push(`[Interrupção] Erro durante a execução: ${err.message}`);
    return {
      status: false,
      mensagem: `Erro de execução: ${err.message}`,
      logs,
    };
  }

  logs.push(`[SUCESSO] Execução concluída com sucesso.`);
  return { status: true, mensagem: "Execução (Adição à fila) concluída", logs };
}

module.exports = { executarCodigo };
