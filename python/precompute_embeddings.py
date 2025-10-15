import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer

# Carrega manual
manual_path = os.path.join(os.path.dirname(__file__), 'docs', 'manual.json')
with open(manual_path, 'r', encoding='utf-8') as f:
    manual = json.load(f)

# Coleta todo o conteúdo FAQ
def coletar_conteudo(obj):
    resultados = []
    for chave, valor in obj.items():
        if isinstance(valor, str):
            resultados.append({'texto': valor})
        elif isinstance(valor, list):
            for item in valor:
                if isinstance(item, dict) and 'pergunta' in item and 'resposta' in item:
                    resultados.append({'pergunta': item['pergunta'], 'resposta': item['resposta']})
                elif isinstance(item, dict):
                    resultados.extend(coletar_conteudo(item))
        elif isinstance(valor, dict):
            resultados.extend(coletar_conteudo(valor))
    return resultados

conteudos = coletar_conteudo(manual)
faq_items = [item for item in conteudos if 'pergunta' in item and 'resposta' in item]

# Inicializa modelo
model = SentenceTransformer('all-MiniLM-L6-v2')

# Calcula embeddings das perguntas
embeddings = [model.encode(item['pergunta']).tolist() for item in faq_items]

# Salva embeddings e respostas
np.savez_compressed(
    os.path.join(os.path.dirname(__file__), 'faq_embeddings.npz'),
    embeddings=embeddings,
    respostas=[item['resposta'] for item in faq_items]
)

print("Embeddings pré-calculados salvos com sucesso!")
