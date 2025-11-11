/*************************************************************************
 * File Name           : zoy_steam_firmware.ino
 * Author              : Oliveira, Majela
 *                     : Lourenço, Moises
 *                     : Correia, Felipe
 * Updated             : Correia, Felipe
 * Version             : v0.8.1 (Implementação Serial_print)
 * Date                : 11/11/2025
 * Description         : Firmware desenvolvido exclusivamente para o robô educacional Zoy STEAM
 * MODIFICADO para comunicação Assíncrona e Não-Bloqueante
 * License             : Licença Pública Geral Menor GNU(LGPL)
 * Copyright (C) 2025 Zoy Educa. All right reserved.
 * http://www.zoy.com.br/
 **************************************************************************/
#include <Arduino.h>
#include <Wire.h> // I2C além dos pinos 0 e 1
#include <SoftwareSerial.h>

int tempo = 20; // Variável de tempo mantida, mas usada para servoTempoEntrePassos

const int LED_LEFT = 15;
const int LED_RIGHT = 16;

const int MOTOR_E1 = 3;
const int MOTOR_E2 = 5;
const int MOTOR_D1 = 6;
const int MOTOR_D2 = 11;

const int BUZZER = 12; // Opcional, se quiser BEEP
const int LED_13 = 13;

// Controle assíncrono do LED_LEFT
bool piscaLeftAtivo = false;
int piscaLeftRestantes = 0;
unsigned long tempoAnteriorLeft = 0;
bool estadoLedLeft = LOW;
const unsigned long intervaloLedLeft = 300;

// Controle assíncrono do LED_RIGHT
bool piscaRightAtivo = false;
int piscaRightRestantes = 0;
unsigned long tempoAnteriorRight = 0;
bool estadoLedRight = LOW;
const unsigned long intervaloLedRight = 300;

// Controle assíncrono do LED_13
bool pisca13Ativo = false;
int pisca13Restantes = 0;
unsigned long tempoAnterior13 = 0;
bool estadoLed13 = LOW;
const unsigned long intervaloLed13 = 300;

// --- Variáveis para controle de debounce de um botão (assíncrono) ---
int botao_zoy_debounce;
int button_zoy_State; // Estado atual (HIGH = solto, LOW = pressionado)
int lastButton_zoy_State = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;
bool debounceActive = false;

// ==== VARIÁVEIS GLOBAIS PARA CONTROLE DE FLUXO E TEMPO NÃO-BLOQUEANTE ====
unsigned long tempoFimPausa = 0;
bool pausaAtiva = false; // TRUE se AGUARDA/PAUSA foi ativado

// Variáveis para Movimento Progressivo do Servo (A/C)
int servoTargetAngle = -1; // -1: Inativo, 0-175: Ângulo Final
int servoCurrentAngle = -1; // Ângulo atual do movimento progressivo
unsigned long servoLastMoveTime = 0;
const int servoTempoEntrePassos = 20; // 20ms (usa o 'tempo' original)
const int servoPasso = 10; // 10 graus por passo
// ==============================================================================

int servo360Pin = -1; // Pino do servo
int pulsoServo360 = 1500; // Pulso atual (1500 = parado)
String buffer = ""; 

// Protótipo da função processarComando, pois é chamada antes de ser definida
void processarComando(String cmd);

// --- Função para ler o estado de um botão com debounce (assíncrono) ---
int debouncedButtonRead(int buttonPin)
{
  int reading = digitalRead(buttonPin); // Leitura bruta do pino

  if (reading != lastButton_zoy_State)
  {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay)
  {
    if (reading != button_zoy_State)
    {
      button_zoy_State = reading; // O botão mudou de estado estável
    }
  }

  lastButton_zoy_State = reading; // Guarda a última leitura bruta
  return button_zoy_State;        // Retorna o estado estável do botão
}

// === Função de leitura do Ultrassom (retorna float para maior precisão) ===
float ler_ultrassom(int trigPin, int echoPin)
{
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  unsigned long duracao = pulseIn(echoPin, HIGH);
  float distancia_cm = duracao / 29.6 / 2.0;

  return distancia_cm;
}

// === Função do Servo Motor ===
void moverServo(int pino, int angulo)
{                                        
  float pausa;                                         
  pausa = angulo * 2000.0 / 180.0 + 700; // Calculamos a largura da pulsação
  // O loop interno é mantido, pois é o SoftPWM necessário para gerar o pulso do servo
  for (int i = 0; i < 10; i += 2)        // envia ~10 pulsos
  {                                     
    digitalWrite(pino, HIGH);          
    delayMicroseconds(pausa);          
    digitalWrite(pino, LOW);           
    delayMicroseconds(25000 - pausa); 
  }
}

void setup()
{
  Serial.begin(9600);
  // Inicialização de pinos
  pinMode(LED_LEFT, OUTPUT);
  pinMode(LED_RIGHT, OUTPUT);
  pinMode(MOTOR_E1, OUTPUT);
  pinMode(MOTOR_E2, OUTPUT);
  pinMode(MOTOR_D1, OUTPUT);
  pinMode(MOTOR_D2, OUTPUT);
  pinMode(LED_13, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  // Garante que os LEDs estejam desligados no início
  digitalWrite(LED_LEFT, LOW);
  digitalWrite(LED_RIGHT, LOW);
  digitalWrite(LED_13, LOW);
}

void loop()
{
  // 1. === GERENCIADOR DE PAUSA GLOBAL (AGUARDA/PAUSA) ===
  if (pausaAtiva) {
    if (millis() >= tempoFimPausa) {
      pausaAtiva = false; // Pausa concluída
      Serial.println("PAUSA_FIM"); // AVISO CRÍTICO PARA O NODE.JS (ACK de tempo)
    }
  }

  // 2. === GERENCIADOR DE MOVIMENTO DE SERVO PROGRESSIVO (A e C) ===
  if (servo360Pin != -1 && servoTargetAngle != -1 && servoCurrentAngle != servoTargetAngle) {
      if (millis() - servoLastMoveTime >= servoTempoEntrePassos) {
          servoLastMoveTime = millis();
          
          // Movimenta em direção ao target
          if (servoCurrentAngle < servoTargetAngle) {
              servoCurrentAngle += servoPasso;
              if (servoCurrentAngle > servoTargetAngle) servoCurrentAngle = servoTargetAngle;
          } else {
              servoCurrentAngle -= servoPasso;
              if (servoCurrentAngle < servoTargetAngle) servoCurrentAngle = servoTargetAngle;
          }
          
          moverServo(servo360Pin, servoCurrentAngle);
          
          // Verifica a conclusão
          if (servoCurrentAngle == servoTargetAngle) {
              servoTargetAngle = -1; // Movimento concluído
              Serial.println("SERVO_FIM"); // AVISO CRÍTICO PARA O NODE.JS (ACK de movimento)
          }
      }
  }
  
  // Lógica de leitura serial para comandos
  while (Serial.available())
  {
    char c = Serial.read();
    if (c == '<') // Início de um novo comando
    {
      buffer = "";
      buffer += c;
    }
    else if (buffer.length() > 0) // Continua lendo o comando
    {
      buffer += c;
      if (c == '>') // Fim do comando
      {
        processarComando(buffer); // Processa o comando completo
        buffer = "";              // Limpa o buffer para o próximo comando
      }
    }
  }

  // --- Controle Assíncrono do debounce
  if (debounceActive)
  {
    debouncedButtonRead(botao_zoy_debounce);
  }

  // --- Controle Assíncrono dos LEDs (permanecem no loop, pois são baseados em millis()) ---
  // Controle assíncrono do LED_13
  if (pisca13Ativo && pisca13Restantes > 0)
  {
    unsigned long agora = millis();
    if (agora - tempoAnterior13 >= intervaloLed13)
    {
      tempoAnterior13 = agora;
      estadoLed13 = !estadoLed13;
      digitalWrite(LED_13, estadoLed13 ? HIGH : LOW);
      if (!estadoLed13) // Decrementa a contagem quando o LED apaga
      {
        pisca13Restantes--;
        if (pisca13Restantes == 0)
        {
          pisca13Ativo = false;
          Serial.println("PAUSA_FIM");
        }
      }
    }
  }
  // Pisca LED_LEFT com millis()
  if (piscaLeftAtivo && millis() - tempoAnteriorLeft >= intervaloLedLeft)
  {
    tempoAnteriorLeft = millis();
    estadoLedLeft = !estadoLedLeft;
    digitalWrite(LED_LEFT, estadoLedLeft);
    if (!estadoLedLeft)
    {
      piscaLeftRestantes--;
      if (piscaLeftRestantes <= 0)
      {
        piscaLeftAtivo = false;
        digitalWrite(LED_LEFT, LOW);
        Serial.println("PAUSA_FIM");
      }
    }
  }

  
  // Pisca LED_RIGHT com millis()
  if (piscaRightAtivo && millis() - tempoAnteriorRight >= intervaloLedRight)
  {
    tempoAnteriorRight = millis();
    estadoLedRight = !estadoLedRight;
    digitalWrite(LED_RIGHT, estadoLedRight);
    if (!estadoLedRight)
    {
      piscaRightRestantes--;
      if (piscaRightRestantes <= 0)
      {
        piscaRightAtivo = false;
        digitalWrite(LED_RIGHT, LOW);
        Serial.println("PAUSA_FIM");
      }
    }
  }
    // Servo 360 Contínuo
    if (servo360Pin != -1 && servoTargetAngle == -1) { // Só roda se não estiver em movimento progressivo
    
      digitalWrite(servo360Pin, HIGH);
      delayMicroseconds(pulsoServo360);
      digitalWrite(servo360Pin, LOW);
      delayMicroseconds(20000 - pulsoServo360);
    }
}

// === Função para mapear pino analógico ===
int lerAnalogico(String pino)
{
  pino.trim();
  if (pino == "A0")
    return analogRead(A0);
  if (pino == "A3")
    return analogRead(A3);
  if (pino == "A4")
    return analogRead(A4);
  if (pino == "A5")
    return analogRead(A5);
#if defined(__AVR_ATmega328P__) // Ex: Arduino Nano
  if (pino == "A6")
    return analogRead(A6);
  if (pino == "A7")
    return analogRead(A7);
#endif
  return -1; // pino inválido
}

// === Função para processar comandos recebidos via Serial ===
void processarComando(String cmd)
{
  cmd.remove(0, 1);           // remove '<' do início
  cmd.remove(cmd.length() - 1); // remove '>' do final

  int sepCmdArg = cmd.indexOf(':');
  String comando_temp;
  String argumentos_temp;

  if (sepCmdArg == -1) // Se não houver ':'
  {
    comando_temp = cmd;
    argumentos_temp = "";
  }
  else
  {
    comando_temp = cmd.substring(0, sepCmdArg);
    argumentos_temp = cmd.substring(sepCmdArg + 1);
  }
  comando_temp.trim();
  argumentos_temp.trim();
  
  // ===  SERIAL_PRINT  - <SERIAL_PRINT:"Mensagem"> ===
  if (comando_temp == "SERIAL_PRINT") {
    argumentos_temp.trim();

    // Remove aspas se existirem
    if (argumentos_temp.startsWith("\"") && argumentos_temp.endsWith("\"")) {
      argumentos_temp.remove(0, 1);
      argumentos_temp.remove(argumentos_temp.length() - 1);
    }

    // Imprime o texto puro recebido
    Serial.println(argumentos_temp);

    // Opcional: sinal para o Node.js de fim de execução
    // Serial.println("PAUSA_FIM");
    return;
  }

  // === SOM (PWM, TEMPO) ===
  if (comando_temp == "SOM") {
    int sep1 = argumentos_temp.indexOf(','); // posição do 1º separador
    if (sep1 == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_SOM");
      return;
    }

    String nivelStr = argumentos_temp.substring(0, sep1);
    String tempoStr = argumentos_temp.substring(sep1 + 1);

    nivelStr.trim();
    tempoStr.trim();
    unsigned int valorPwm = (unsigned int)nivelStr.toInt();
    unsigned int valorTempo = (unsigned int)tempoStr.toInt();
    
    tone(BUZZER, valorPwm, valorTempo);
    // REMOVIDO: delay(valorTempo);
    Serial.println("OK_SOM_INICIO"); 
    // O Node.js deve esperar o valorTempo e, opcionalmente, o firmware pode enviar SOM_FIM (usando um timer extra)
    // Por enquanto, o Node.js deve assumir o tempo.
    return;
  }
  // === NOVO: PAUSA (TEMPO) - AGORA NÃO-BLOQUEANTE ===
  if (comando_temp == "PAUSA"){
    argumentos_temp.trim();
    unsigned long valorTempo = (unsigned long)argumentos_temp.toInt();
    
    noTone(BUZZER);
    
    pausaAtiva = true;
    tempoFimPausa = millis() + valorTempo;
    
    Serial.println("OK_PAUSA_INICIO"); // Resposta imediata, Node.js aguarda PAUSA_FIM
    return;
  }

  // === NOVO: DIGITAL_WRITE (pinos digitais) ===
  if (comando_temp == "DIGITAL_WRITE") {
    int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_DIGITAL_WRITE");
      return;
    }
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String nivelStr = argumentos_temp.substring(sep_arg + 1);

    pinoStr.trim();
    nivelStr.trim();

    // Converte o pino para int (ex: "D3" -> 3; "13" -> 13)
    int pino = -1;
    if (pinoStr.startsWith("D"))
    {
      pino = pinoStr.substring(1).toInt();
    }
    else
    {
      pino = pinoStr.toInt();
    }

    int nivel = -1; // HIGH=1, LOW=0
    if (nivelStr == "HIGH")
    {
      nivel = HIGH;
    }
    else if (nivelStr == "LOW")
    {
      nivel = LOW;
    }

    // Verifica se o pino e o nível são válidos
    // (Para pinos digitais, números inteiros geralmente entre 0 e 13 para Arduino UNO/Nano)
    if (pino != -1 && (nivel == HIGH || nivel == LOW))
    {
      pinMode(pino, OUTPUT); // Garante que o pino está configurado como OUTPUT
      digitalWrite(pino, nivel);
      Serial.println("OK");
      return;
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_DIGITAL_WRITE_INVALIDOS");
      return;
    }
  }

  // === NOVO: PWM_WRITE (pinos PWM) ===
  if (comando_temp == "PWM_WRITE") {
   int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_PWM_WRITE");
      return;
    }
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String valorStr = argumentos_temp.substring(sep_arg + 1);

    pinoStr.trim();
    valorStr.trim();

    // Converte o pino para int (ex: "D3" -> 3; "9" -> 9)
    int pino = -1;
    if (pinoStr.startsWith("D"))
    {
      pino = pinoStr.substring(1).toInt();
    }
    else
    {
      pino = pinoStr.toInt();
    }

    int valor = valorStr.toInt();

    // Verifica se o valor PWM é válido (0-255)
    // (Pinos PWM geralmente 3, 5, 6, 9, 10, 11 no Arduino UNO/Nano)
    if (pino != -1 && valor >= 0 && valor <= 255)
    {
      pinMode(pino, OUTPUT); // Garante que o pino está configurado como OUTPUT
      analogWrite(pino, valor);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_PWM_WRITE_INVALIDOS");
    }
    return;
  }

  // === LER SENSOR ULTRASSOM ===
  if (comando_temp == "ULTRASSOM") {
    int primeiro_virgula = argumentos_temp.indexOf(',');
    if (primeiro_virgula != -1)
    {
      int trigPin = argumentos_temp.substring(0, primeiro_virgula).toInt();
      int echoPin = argumentos_temp.substring(primeiro_virgula + 1).toInt();

      // CORREÇÃO: 'arguments_temp' para 'argumentos_temp'
      if (trigPin == 0 && argumentos_temp.substring(0, primeiro_virgula) != "0" ||
          echoPin == 0 && argumentos_temp.substring(primeiro_virgula + 1) != "0")
      {
        Serial.println("ERRO:PINOS_ULTRASSOM_INVALIDOS");
        return;
      }

      float distancia = ler_ultrassom(trigPin, echoPin);
      Serial.print("DISTANCIA:");
      Serial.println(distancia, 2); // Imprime a distância com 2 casas decimais
      // REMOVIDO: Serial.println("OK"); para evitar linhas extras
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_ULTRASSOM_AUSENTES"); // Se faltar a vírgula
    }
    return; // Importante: Sai da função processarComando após lidar com o comando ULTRASSOM
  }

  // ===  DIGITAL_READ (ler pino digital) ===
  // Comando esperado do Python: <DIGITAL_READ:PINO,MODO>
  // Ex: <DIGITAL_READ:2,INPUT> ou <DIGITAL_READ:13,INPUT_PULLUP>
  if (comando_temp == "DIGITAL_READ")
  {
    int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_DIGITAL_READ");
      return;
    }
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String modoStr = argumentos_temp.substring(sep_arg + 1);

    pinoStr.trim();
    modoStr.trim();

    int pino = pinoStr.toInt(); // Pega o número do pino diretamente

    int modo = -1;
    if (modoStr == "INPUT")
    {
      modo = INPUT;
    }
    else if (modoStr == "INPUT_PULLUP")
    {
      modo = INPUT_PULLUP;
    }
    else
    {
      Serial.println("ERRO:MODO_INVALIDO");
      return;
    }

    // Valida o pino (geralmente pinos digitais de 0 a 19 para Nano/Uno, incluindo os analógicos como digitais)
    // Adapte este range conforme seu microcontrolador específico e pinos utilizados.
    if (pino >= 0 && pino <= 19 && modo != -1)
    {
      pinMode(pino, modo); // Configura o modo do pino
      int valor = digitalRead(pino);
      Serial.print("DIGITAL_VALOR:");
      Serial.println(valor); // Retorna 0 para LOW e 1 para HIGH
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_DIGITAL_READ_INVALIDOS");
    }
    return; // Sai da função após processar o comando
  }

  // --- COMANDO BOTAO_DEBOUNCE (usa a função de debounce assíncrona) ---
  if (comando_temp == "BOTAO_DEBOUNCE")
  {
   int sep_arg = argumentos_temp.indexOf(',');
    if (sep_arg == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_BOTAO_DEBOUNCE");
      return;
    }
    String pinoStr = argumentos_temp.substring(0, sep_arg);
    String modoStr = argumentos_temp.substring(sep_arg + 1);

    pinoStr.trim();
    modoStr.trim();

    int pino = pinoStr.toInt();

    int modo = -1;
    if (modoStr == "INPUT")
    {
      modo = INPUT;
    }
    else if (modoStr == "INPUT_PULLUP")
    {
      modo = INPUT_PULLUP;
    }
    else
    {
      Serial.println("ERRO:MODO_INVALIDO");
      return;
    }

    if (pino >= 0 && pino <= 19 && modo != -1)
    {
      pinMode(pino, modo);
      botao_zoy_debounce = pino;
      debounceActive = true;

      // Força uma leitura inicial para não retornar valor antigo
      debouncedButtonRead(pino);

      Serial.print("BOTAO_DEBOUNCE_VALOR:");
      Serial.println(button_zoy_State); // Agora é atualizado constantemente
    }
    else
    {
      Serial.println("ERRO:PARAMETROS_BOTAO_DEBOUNCE_INVALIDOS");
    }
    return;
  }

  // === LER SENSOR ANALÓGICO (IR, LDR, Potenciômetro, etc.) ===
  if (comando_temp == "ANALOG_READ")  {
  
    int valor = lerAnalogico(argumentos_temp);
    if (valor != -1)
    {                                // -1 significa pino inválido
      Serial.print("ANALOG_VALOR:"); // Resposta formatada para o Python
      Serial.println(valor);
      // REMOVIDO: Serial.println("OK"); para evitar linhas extras
    }
    else
    {
      Serial.println("ERRO:PINO_ANALOGICO_INVALIDO"); // Mensagem de erro mais específica
    }
    return; // Sai da função após processar o comando
  }
  // === LED_TREZE ===
  if (comando_temp == "LED_TREZE") {
  
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(LED_13, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(LED_13, LOW);
      Serial.println("OK");
    }
    else
    {
      int vezes = argumentos_temp.toInt();
      if (vezes > 0)
      {
        pisca13Restantes = vezes;
        pisca13Ativo = true;
        tempoAnterior13 = millis();
        estadoLed13 = LOW; // Começa apagado para o primeiro pisca
        digitalWrite(LED_13, estadoLed13);
        Serial.println("OK");
      }
      else
      {
        Serial.println("ERRO:ARG_INVALIDO");
      }
    }
    return;
  }
  // === LED LEFT ===
  if (comando_temp == "LED_LEFT")  {
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(LED_LEFT, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(LED_LEFT, LOW);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }
  // === LED RIGHT ===
  if (comando_temp == "LED_RIGHT")  {
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(LED_RIGHT, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(LED_RIGHT, LOW);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }
  // === ACIONA OS PINOS DO MOTOR (D3, D5, D6, D11) ===
  if (comando_temp == "D3" || comando_temp == "D5" || comando_temp == "D6" || comando_temp == "D11")  {
    int pinoAlvo = comando_temp.substring(1).toInt(); // Extrai o número do pino (ex: de "D3" pega 3)
    if (argumentos_temp == "HIGH")
    {
      digitalWrite(pinoAlvo, HIGH);
      Serial.println("OK");
    }
    else if (argumentos_temp == "LOW")
    {
      digitalWrite(pinoAlvo, LOW);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO_PINO");
    }
    return;
  }
  // === MOTOR ESQUERDO_FRENTE ===
  if (comando_temp == "MOTOR_ESQUERDO_FRENTE")  {
    int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_E1, velA);
    analogWrite(MOTOR_E2, 0);
    Serial.println("OK");
    return;
  }
  // === MOTOR ESQUERDO_TRAS ===
  if (comando_temp == "MOTOR_ESQUERDO_TRAS")  {
    int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, velA);
    Serial.println("OK");
    return;
  }
  // === MOTOR DIREITO_FRENTE ===
  if (comando_temp == "MOTOR_DIREITO_FRENTE")  {
     int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_D1, velA);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  // === MOTOR DIREITO_TRAS ===
  if (comando_temp == "MOTOR_DIREITO_TRAS")  {
    int velA = argumentos_temp.toInt();
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, velA);
    Serial.println("OK");
    return;
  }
  // === MOTOR FRENTE ===
  if (comando_temp == "MOTOR_FRENTE")  {
   int sep = argumentos_temp.indexOf(',');
    if (sep == -1)
    {
      Serial.println("ERRO:ARGUMENTOS");
      return;
    }
    int velA = argumentos_temp.substring(0, sep).toInt();
    int velB = argumentos_temp.substring(sep + 1).toInt();
    analogWrite(MOTOR_E1, velA);
    analogWrite(MOTOR_E2, 0);
    analogWrite(MOTOR_D1, velB);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  // === MOTOR TRAS ===
  if (comando_temp == "MOTOR_TRAS")  {
    int sep = argumentos_temp.indexOf(',');
    if (sep == -1)
    {
      Serial.println("ERRO:ARGUMENTOS");
      return;
    }
    int velA = argumentos_temp.substring(0, sep).toInt();
    int velB = argumentos_temp.substring(sep + 1).toInt();
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, velA);
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, velB);
    Serial.println("OK");
    return;
  }
  // === PARAR TODOS OS MOTORES ===
  if (comando_temp == "PARAR")  {
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, 0);
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  // === PARAR MOTOR Esquerdo ou Direito ===
  if (comando_temp == "PARAR_ESQUERDO")  {
    analogWrite(MOTOR_E1, 0);
    analogWrite(MOTOR_E2, 0);
    Serial.println("OK");
    return;
  }

  if (comando_temp == "PARAR_DIREITO")  {
    analogWrite(MOTOR_D1, 0);
    analogWrite(MOTOR_D2, 0);
    Serial.println("OK");
    return;
  }
  // === AGUARDA:N segundos - AGORA NÃO-BLOQUEANTE ===
  if (comando_temp == "AGUARDA")  {
    argumentos_temp.trim();
    float segundos = argumentos_temp.toFloat();  // ✅ Lê corretamente 1.5
    
    pausaAtiva = true;
    tempoFimPausa = millis() + (unsigned long)(segundos * 1000.0f); // ✅ converte para ms com fração
    
    Serial.println("OK_AGUARDA_INICIO");
    return;
  }

  // === BEEP:N ms - AGORA NÃO-BLOQUEANTE ===
  if (comando_temp == "BEEP") {
    int duracao = argumentos_temp.toInt();
    // REMOVIDO: digitalWrite(BUZZER, HIGH); delay(duracao); digitalWrite(BUZZER, LOW);
    tone(BUZZER, 1000, duracao); // Usa tone com duração
    Serial.println("OK_BEEP");
    return;
  }
  // === LED_PISCA_LEFT ===
  if (comando_temp == "LED_PISCA_LEFT") {
    int vezes = argumentos_temp.toInt();
    if (vezes > 0)
    {
      piscaLeftAtivo = true;
      piscaLeftRestantes = vezes;
      tempoAnteriorLeft = millis();
      estadoLedLeft = LOW; // Inicia apagado para piscar
      digitalWrite(LED_LEFT, estadoLedLeft);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }
  // === LED_PISCA_RIGHT ===
  if (comando_temp == "LED_PISCA_RIGHT")  {
    int vezes = argumentos_temp.toInt();
    if (vezes > 0)
    {
      piscaRightAtivo = true;
      piscaRightRestantes = vezes;
      tempoAnteriorRight = millis();
      estadoLedRight = LOW; // Inicia apagado para piscar
      digitalWrite(LED_RIGHT, estadoLedRight);
      Serial.println("OK");
    }
    else
    {
      Serial.println("ERRO:ARG_INVALIDO");
    }
    return;
  }
   // === SERVO MOTOR <A:9> (Abrir a garra) - AGORA NÃO-BLOQUEANTE ===
  if (comando_temp == "A"){
     int servoPin = argumentos_temp.toInt();
     pinMode(servoPin, OUTPUT);
     digitalWrite(servoPin, LOW);
     
     // Configura o movimento progressivo
     servo360Pin = servoPin;
     servoCurrentAngle = 175; // Posição inicial
     servoTargetAngle = 0;   // Posição final
     servoLastMoveTime = millis();
     
     Serial.println("OK_ABRIR_GARRA_INICIO"); // Resposta imediata, Node.js aguarda SERVO_FIM
     return;
  } 
  // === SERVO MOTOR <C:9> (Fechar a garra) - AGORA NÃO-BLOQUEANTE ===
  else if (comando_temp == "C") {
     int servoPin = argumentos_temp.toInt();
     pinMode(servoPin, OUTPUT);
     digitalWrite(servoPin, LOW);
     
     // Configura o movimento progressivo
     servo360Pin = servoPin;
     servoCurrentAngle = 0; // Posição inicial
     servoTargetAngle = 175; // Posição final
     servoLastMoveTime = millis();
     
     Serial.println("OK_FECHAR_GARRA_INICIO"); // Resposta imediata, Node.js aguarda SERVO_FIM
     return;
  }
  // === SERVO MOTOR 360 GIRAR <HO:PINO>===
  else if (comando_temp == "HO") {
    int sep1 = argumentos_temp.indexOf(','); // posição do 1º separador
    if (sep1 == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_SOM");
      return;
    }
    String nivelStr = argumentos_temp.substring(0, sep1);
    String tempoStr = argumentos_temp.substring(sep1 + 1);

    nivelStr.trim();
    tempoStr.trim();
    servo360Pin = (unsigned int)nivelStr.toInt();
    unsigned int velocidade = (unsigned int)tempoStr.toInt();
    
    pinMode(servo360Pin, OUTPUT);
    digitalWrite(servo360Pin, LOW);
    pulsoServo360 = velocidade;

    char msg[50];
    sprintf(msg, "Servo do pino %d ROTAÇÃO HORÁRIA", servo360Pin);
    Serial.println(msg);
    return;


  // === SERVO MOTOR 360 GIRAR <AH:PINO>===
  } else if (comando_temp == "AH") {
    int sep1 = argumentos_temp.indexOf(','); // posição do 1º separador
    if (sep1 == -1)
    {
      Serial.println("ERRO:ARG_INVALIDO_SOM");
      return;
    }
    String nivelStr = argumentos_temp.substring(0, sep1);
    String tempoStr = argumentos_temp.substring(sep1 + 1);

    nivelStr.trim();
    tempoStr.trim();
    servo360Pin = (unsigned int)nivelStr.toInt();
    unsigned int velocidade = (unsigned int)tempoStr.toInt();
    pulsoServo360 = velocidade;
    char msg[50];
    sprintf(msg, "Servo do pino %d ROTAÇÃO ANTIHORÁRIA", servo360Pin);
    Serial.println(msg);
    return;

  // === SERVO MOTOR 360 PARAR <P:PINO>===
  } else if (comando_temp == "P") {
    servo360Pin = argumentos_temp.toInt(); // global
    pinMode(servo360Pin, OUTPUT);
    digitalWrite(servo360Pin, LOW);
    pulsoServo360 = 1500; // parar

    char msg[50];
    sprintf(msg, "Servo do pino %d PARAR ROTAÇÃO", servo360Pin);
    Serial.println(msg);
    return;
  }

  // === Comando ZOY de firmware ===
  if (comando_temp == "ZOY" && argumentos_temp == "ZOY") {
    Serial.println("FIRMWARE:ZOY_STEAM:v0.8.1"); // Versão atualizada
    return;
  }
  
  // Se o comando não foi reconhecido
  Serial.println("ERRO:COMANDO_INVALIDO");
}