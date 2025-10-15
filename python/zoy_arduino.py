import sys, json, subprocess, os, platform, serial, time

# === Caminhos e utilitários ===

def get_base_path():
    # Caminho base relativo ao empacotamento
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def get_arduino_cli_path():
    base = os.path.join(get_base_path(), "arduino_cli")
    if platform.system() == "Windows":
        return os.path.join(base, "windows", "arduino-cli.exe")
    else:
        return os.path.join(base, "linux", "arduino-cli")

# === Funções auxiliares ===

def salvar_sketch(codigo):
    temp_dir = os.path.join(get_base_path(), "temp_sketch")
    os.makedirs(temp_dir, exist_ok=True)
    sketch_path = os.path.join(temp_dir, "arduino_sketch.ino")
    with open(sketch_path, "w", encoding="utf-8") as f:
        f.write(codigo)
    return sketch_path

def run_cli(command):
    """Executa um comando e retorna saída padrão e erro."""
    result = subprocess.run(command, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

# === Ações ===

def compilar(codigo, placa="uno"):
    sketch = salvar_sketch(codigo)
    fqbn_map = {
        "uno": "arduino:avr:uno",
        "nano": "arduino:avr:nano",
        "nano_old": "arduino:avr:nano:cpu=atmega328old",
        "zoySTEAM": "arduino:avr:nano",
    }
    fqbn = fqbn_map.get(placa, "arduino:avr:uno")

    cli = get_arduino_cli_path()
    code, out, err = run_cli([cli, "compile", "--fqbn", fqbn, os.path.dirname(sketch)])
    return {
        "status": "sucesso" if code == 0 else "erro",
        "mensagem": "Compilado com sucesso" if code == 0 else "Erro ao compilar",
        "stdout": out,
        "stderr": err,
    }

def gravar(codigo, porta, placa="uno"):
    sketch = salvar_sketch(codigo)
    fqbn_map = {
        "uno": "arduino:avr:uno",
        "nano": "arduino:avr:nano",
        "nano_old": "arduino:avr:nano:cpu=atmega328old",
        "zoySTEAM": "arduino:avr:nano",
    }
    fqbn = fqbn_map.get(placa, "arduino:avr:uno")

    cli = get_arduino_cli_path()

    # Compila primeiro
    run_cli([cli, "compile", "--fqbn", fqbn, os.path.dirname(sketch)])
    code, out, err = run_cli(
        [cli, "upload", "--fqbn", fqbn, "--port", porta, os.path.dirname(sketch)]
    )
    return {
        "status": "sucesso" if code == 0 else "erro",
        "mensagem": "Gravação concluída" if code == 0 else "Erro ao gravar",
        "stdout": out,
        "stderr": err,
    }

def listar_portas():
    try:
        import serial.tools.list_ports
        ports = [
            {"port": p.device, "description": p.description}
            for p in serial.tools.list_ports.comports()
        ]
        return {"status": "sucesso", "portas": ports}
    except Exception as e:
        return {"status": "erro", "mensagem": str(e)}

# === Entrada/saída principal ===

if __name__ == "__main__":
    try:
        data = json.loads(sys.stdin.read())
        action = data.get("action")

        if action == "compilar":
            print(json.dumps(compilar(data["codigo"], data.get("placa"))))
        elif action == "gravar":
            print(
                json.dumps(gravar(data["codigo"], data["porta"], data.get("placa")))
            )
        elif action == "listar_portas":
            print(json.dumps(listar_portas()))
        else:
            print(json.dumps({"status": "erro", "mensagem": f"Ação desconhecida: {action}"}))
    except Exception as e:
        print(json.dumps({"status": "erro", "mensagem": str(e)}))
