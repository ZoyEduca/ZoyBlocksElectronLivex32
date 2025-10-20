const serialService = require('./serial-services');

async function executarCodigo(codigoPython) {
    const logs = [];
    const comandosEnviados = [];

    const regex = /(\w+)\((.*?)\)/g;
    let match;

    logs.push(`[INFO] Código recebido:\n${codigoPython}`);

    while ((match = regex.exec(codigoPython)) !== null) {
        const funcao = match[1];
        const argsString = match[2];
        const args = argsString
            .split(',')
            .map(arg => arg.trim().replace(/^['"]|['"]$/g, ''));

        // Argumentos de comando, onde args[0] é o comando e args[1] são os parâmetros
        const comando = args[0];
        const argumentos_comando = args.slice(1).join(',');  // Juntar todos os argumentos após o primeiro
        let comandoSerial = null;

        //  === Funções enviadas dos blocos do Blockly para os dispositivos via serial ===
        try {
            switch (funcao) {
                case 'led_pisca_n':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'led_left':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'led_right':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'pausa':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'som_nota':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'motor_esquerdo_frente':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'motor_direito_frente':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'motor_esquerdo_tras':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'motor_direito_tras':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'set_pin_mode':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'digital_write':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'definir_pino_digital': {
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                }
                case 'analog_write':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'ler_ultrassom':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'servo':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'servo360':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'mover_frente':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'mover_tras':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'parar_motor':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                case 'iniciar_zoy':
                    comandoSerial = `<${comando}:${argumentos_comando}>`;
                    break;
                default:
                    logs.push(`[AVISO] Função desconhecida: ${funcao}`);
            }

            if (comandoSerial) {
                logs.push(`[INFO] ${funcao} -> Traduzido para: ${comandoSerial}`);
                comandosEnviados.push(serialService.enviarComandoSerial(comandoSerial));
            } else {
                logs.push(`[AVISO] Comando serial não gerado para: ${funcao}`);
            }

        } catch (err) {
            logs.push(`[ERRO] Erro ao processar ${funcao}: ${err.message}`);
        }
    }

    try {
        await Promise.all(comandosEnviados);
        logs.push(`[SUCESSO] Todos os comandos enviados com sucesso.`);
        return { status: true, mensagem: "Execução concluída", logs };
    } catch (error) {
        logs.push(`[ERRO] Falha no envio serial: ${error.message}`);
        return { status: false, mensagem: "Erro ao executar comandos", logs };
    }
}

module.exports = { executarCodigo };
