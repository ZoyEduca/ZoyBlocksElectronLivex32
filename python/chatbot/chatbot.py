import sys
import os
import json
import difflib

# --- FORÇA O PYTHON A USAR UTF-8 PARA SAÍDA DE TEXTO ---
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 1. Localiza o arquivo JSON
current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, "faq_data.json")

def carregar_dados():
    """Carrega o arquivo JSON garantindo UTF-8."""
    try:
        # Importante: encoding='utf-8' aqui é essencial
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        return {"ajuda": f"Erro ao carregar base: {str(e)}"}

def buscar_resposta(pergunta_usuario, faq_data):
    pergunta_usuario = pergunta_usuario.lower().strip()
    perguntas_conhecidas = list(faq_data.keys())
    
    matches = difflib.get_close_matches(pergunta_usuario, perguntas_conhecidas, n=1, cutoff=0.4)
    
    if matches:
        return faq_data[matches[0]]
    
    return "Ainda não tenho uma resposta exata. Tente palavras-chave como 'ligar' ou 'bluetooth'."

def main():
    base_conhecimento = carregar_dados()
    
    # Notifica o Electron (usando ensure_ascii=False para não escapar acentos)
    print(json.dumps({"status": "ready", "count": len(base_conhecimento)}, ensure_ascii=False))
    sys.stdout.flush()

    for line in sys.stdin:
        try:
            data = json.loads(line)
            pergunta = data.get("pergunta", "")
            
            if pergunta:
                resposta = buscar_resposta(pergunta, base_conhecimento)
                
                # O segredo: ensure_ascii=False mantém os caracteres originais
                resultado_json = json.dumps({"resposta": resposta}, ensure_ascii=False)
                
                sys.stdout.write(resultado_json + '\n')
                sys.stdout.flush()
        except Exception as e:
            err_msg = json.dumps({"erro": str(e)}, ensure_ascii=False)
            print(err_msg, file=sys.stderr)
            sys.stderr.flush()

if __name__ == "__main__":
    main()