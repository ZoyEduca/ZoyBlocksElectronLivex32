import cv2
import sys

def main():
    # Tenta abrir a câmera (0 é geralmente a integrada, 1 ou 2 são externas)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Erro: Não foi possível acessar a câmera.")
        return

    window_name = "Zoy Vision - Teste de Camera"
    
    print("Pressione 'q' para sair.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Erro ao receber frame.")
            break

        # 1. Espelhamento e Dimensões
        frame = cv2.flip(frame, 1)
        height, width, _ = frame.shape
        
        # 2. Definição das Zonas (Mantendo sua lógica original)
        left_bound = width // 3
        right_bound = 2 * width // 3
        mid_height = height // 2

        # 3. Desenho da Interface Visual (Feedback para o aluno)
        # Linhas Verticais
        cv2.line(frame, (left_bound, 0), (left_bound, height), (255, 0, 0), 2)
        cv2.line(frame, (right_bound, 0), (right_bound, height), (255, 0, 0), 2)
        # Linhas Horizontais (apenas nas laterais)
        cv2.line(frame, (0, mid_height), (left_bound, mid_height), (0, 255, 0), 2)
        cv2.line(frame, (right_bound, mid_height), (width, mid_height), (0, 255, 0), 2)

        # 4. Textos Indicativos
        cv2.putText(frame, "ESQ CIMA", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(frame, "DIR CIMA", (right_bound + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(frame, "CENTRO (PARAR)", (left_bound + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

        # Exibição
        cv2.imshow(window_name, frame)

        # Sai se pressionar 'q' ou fechar a janela
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        
        # Previne erro se a janela for fechada no 'X'
        if cv2.getWindowProperty(window_name, cv2.WND_PROP_VISIBLE) < 1:
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Câmera encerrada.")

if __name__ == "__main__":
    main()