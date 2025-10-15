# python/server_core.py
import json
import sys
import os
import subprocess
import time
import serial
import serial.tools.list_ports

# === Função para enviar resposta JSON de volta ===
def responder(data):
    print(json.dumps(data))
    sys.stdout.flush()

# === Funções principais ===
def listar_portas():
    portas = []
    for p in serial.tools.list_ports.comports():
        portas.append({"port": p.device, "description": p.description})
    return {"status": "sucesso", "portas": portas}

def compilar_codigo(codigo, placa="arduino:avr:nano"):
    temp_dir = os.path.abspath("temp_sketch")
    os.makedirs(temp_dir, exist_ok=True)

    sketch_path = os.path.join(temp_dir, "temp.ino")
    with open(sketch_path, "w", encoding="utf-8") as f:
        f.write(codigo)

    cli_path = os.path.join(os.getcwd(), "arduino_cli", "linux", "arduino-cli")
    build_dir = os.path.join(temp_dir, "build")
    os.makedirs(build_dir, exist_ok=True)

    cmd = [cli_path, "compile", "--fqbn", placa, "--build-path", build_dir, sketch_path]
    process = subprocess.run(cmd, capture_output=True, text=True)
    logs = process.stdout + process.stderr

    if process.returncode == 0:
        return {"status": "sucesso", "mensagem": "Compilação concluída.", "logs": logs}
    else:
        return {"status": "erro", "mensagem": "Falha na compilação.", "logs": logs}

def gravar_firmware(placa, porta):
    cli_path = os.path.join(os.getcwd(), "arduino_cli", "linux", "arduino-cli")
    hex_path = os.path.join(os.getcwd(), "static", "firmware", "zoySTEAM_firmware.hex")

    cmd = [cli_path, "upload", "--fqbn", placa, "--port", porta, "--input-file", hex_path]
    process = subprocess.run(cmd, capture_output=True, text=True)
    logs = process.stdout + process.stderr

    if process.returncode == 0:
        return {"status": "sucesso", "mensagem": "Firmware gravado com sucesso.", "logs": logs}
    else:
        return {"status": "erro", "mensagem": "Erro ao gravar firmware.", "logs": logs}

# === Loop principal ===
def main():
    for line in sys.stdin:
        try:
            data = json.loads(line.strip())
            acao = data.get("acao")

            if acao == "listar_portas":
                responder(listar_portas())

            elif acao == "compilar":
                codigo = data.get("codigo", "")
                placa = data.get("placa", "arduino:avr:nano")
                responder(compilar_codigo(codigo, placa))

            elif acao == "gravar_firmware":
                placa = data.get("placa")
                porta = data.get("porta")
                responder(gravar_firmware(placa, porta))

            else:
                responder({"status": "erro", "mensagem": f"Ação desconhecida: {acao}"})

        except Exception as e:
            responder({"status": "erro", "mensagem": str(e)})

if __name__ == "__main__":
    main()
