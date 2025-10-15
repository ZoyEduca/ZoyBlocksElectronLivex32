//const serialService = require('./serial-service');

async function executarCodigo(codigoPython) {
    const logs = [];
    const comandosEnviados = [];
    let comandoValido = true;

    // Regex para encontrar chamadas de função e seus argumentos.
    const regex = /(\w+)\((.*?)\)/g;
    let match;

    while ((match = regex.exec(codigoPython)) !== null) {
        const funcao = match[1];
        const argsString = match[2];
        const args = argsString.split(',').map(arg => arg.trim().replace(/^['"]|['"]$/g, ''));

        let comandoSerial = '';

        if (args.length > 1) {
            // Se a função tem múltiplos argumentos, assume que o primeiro é o comando e o segundo são os valores
            // Ex: mover_frente("MOTOR_FRENTE", "150,150") -> <MOTOR_FRENTE:150,150>
            const nomeComando = args[0];
            const valores = args[1];
            comandoSerial = `<${nomeComando}:${valores}>`;
        } else {
            // Se a função não tem argumentos (ou tem apenas um), usa o switch
            switch (funcao) {
                case 'iniciar_zoy':
                    comandoSerial = `<INICIAR_ZOY>`;
                    break;
                case 'pausa':
                    comandoSerial = `<PAUSA: ${args[0]}>`;
                    break;
                case 'som_nota':
                    comandoSerial = `<SOM_NOTA:${args[0]},${args[1]}>`;
                    break;
                // Os comandos de motor sem argumentos
                case 'motor_esquerdo_frente':
                    comandoSerial = `<MOTOR_ESQUERDO_FRENTE:150>`;
                    break;
                case 'motor_direito_frente':
                    comandoSerial = `<MOTOR_DIREITO_FRENTE:150>`;
                    break;
                case 'motor_esquerdo_tras':
                    comandoSerial = `<MOTOR_ESQUERDO_TRAS:150>`;
                    break;
                case 'motor_direito_tras':
                    comandoSerial = `<MOTOR_DIREITO_TRAS:150>`;
                    break;
                case 'set_pin_mode':
                    comandoSerial = `<SET_PIN_MODE:${args[0]},${args[1]}>`;
                    break;
                case 'digital_write':
                    comandoSerial = `<DIGITAL_WRITE:${args[0]},${args[1]}>`;
                    break;
                case 'analog_write':
                    comandoSerial = `<ANALOG_WRITE:${args[0]},${args[1]}>`;
                    break;
                case 'ler_ultrassom':
                    comandoSerial = `<ULTRASSOM:${args[0]},${args[1]}>`;
                    break;
                case 'servo':
                    comandoSerial = `<SERVO_ANGULO:${args[0]},${args[1]}>`;
                    break;
                case 'servo360':
                    comandoSerial = `<SERVO_360:${args[0]},${args[1]}>`;
                    break;
                default:
                    logs.push(`[AVISO] Função desconhecida: ${funcao}`);
                    comandoValido = false;
                    break;
            }
        }

        if (comandoValido) {
            comandosEnviados.push(serialService.enviarComandoSerial(comandoSerial));
            logs.push(`[INFO] Comando traduzido: ${comandoSerial}`);
        }
    }

    try {
        await Promise.all(comandosEnviados);
        logs.push(`[SUCESSO] Todos os comandos foram enviados.`);
        return { logs: logs, mensagem: 'Execução concluída com sucesso!', status: true };
    } catch (error) {
        logs.push(`[ERRO] Ocorreu um erro durante a execução: ${error.mensagem}`);
        return { logs: logs, mensagem: `Ocorreu um erro: ${error.mensagem}`, status: false };
    }
}

module.exports = {
    executarCodigo
};