import sys
import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer

def main():
    """
    Função principal que carrega os modelos e entra em um loop para processar perguntas.
    """
    # Carrega os embeddings e o modelo APENAS UMA VEZ na inicialização
    try:
        npz_path = 'faq_embeddings.npz'
        data = np.load(npz_path, allow_pickle=True)
        faq_embeddings = np.array(data['embeddings'])
        faq_respostas = data['respostas']
        print("Embeddings FAQ carregados com sucesso.", file=sys.stderr)
    except FileNotFoundError:
        print("Erro: Arquivo faq_embeddings.npz não encontrado.", file=sys.stderr)
        return

    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Modelo SentenceTransformer carregado com sucesso.", file=sys.stderr)
    except Exception as e:
        print(f"Erro ao carregar o modelo: {e}", file=sys.stderr)
        return

    def normalize(text):
        return text.lower().strip()

    def buscar_resposta(pergunta):
        pergunta_emb = model.encode(normalize(pergunta))
        scores = np.dot(faq_embeddings, pergunta_emb) / (np.linalg.norm(faq_embeddings, axis=1) * np.linalg.norm(pergunta_emb))
        idx = np.argmax(scores)
        if scores[idx] > 0.5:
            return faq_respostas[idx]
        return "Ainda não sei responder isso, mas logo vou aprender."

    # Loop principal para ler do stdin e responder via stdout
    print("Pronto para receber perguntas...", file=sys.stderr)
    for line in sys.stdin:
        try:
            # Tenta decodificar a linha como JSON
            input_data = json.loads(line)
            pergunta = input_data.get("pergunta", "")
            
            if pergunta:
                resposta = buscar_resposta(pergunta)
                # Envia a resposta como um JSON para o stdout
                sys.stdout.write(json.dumps({"resposta": resposta}) + '\n')
                sys.stdout.flush() # Importante para enviar a resposta imediatamente
        except json.JSONDecodeError:
            print("Erro ao decodificar JSON. Ignorando linha.", file=sys.stderr)
        except Exception as e:
            print(f"Erro ao processar a pergunta: {e}", file=sys.stderr)
            sys.stderr.flush()

if __name__ == "__main__":
    main()