// Defini a cor da categoria e blocos
const COR_BLOCOS = "#C95555";

const pinos = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "ler_pino_digital",
      message0: "Ler pino digital %1  entrada: %2",
      args0: [
        {
          type: "field_dropdown",
          name: "PIN",
          options: [
            ["D0", "0"],
            ["D1", "1"],
            ["D2", "2"],
            ["D3", "3"],
            ["D4", "4"],
            ["D5", "5"],
            ["D6", "6"],
            ["D7", "7"],
            ["D8", "8"],
            ["D9", "9"],
            ["D10", "10"],
            ["D11", "11"],
            ["D12", "12"],
            ["D13", "13"],
            ["A0/D14", "14"],
            ["A1/D15", "15"],
            ["A2/D16", "16"],
            ["A3/D17", "17"],
            ["A4/D18", "18"],
            ["A5/D19", "19"],
          ],
        },
        {
          type: "field_dropdown",
          name: "LEVEL",
          options: [
            ["INPUT", "INPUT"],
            ["INPUT_PULLUP", "INPUT_PULLUP"],
          ],
        },
      ],
      colour: COR_BLOCOS,
      output: "Boolean",
      tooltip:
        "Realiza a leitura de um pino digital e configura o modo de entrada (INPUT ou INPUT_PULLUP).",
      helpUrl: "",
    },

    {
      type: "definir_pino_digital",
      message0: "Definir pino digital %1 como %2",
      args0: [
        {
          type: "field_dropdown",
          name: "PIN",
          options: [
            ["D0", "0"],
            ["D1", "1"],
            ["D2", "2"],
            ["D3", "3"],
            ["D4", "4"],
            ["D5", "5"],
            ["D6", "6"],
            ["D7", "7"],
            ["D8", "8"],
            ["D9", "9"],
            ["D10", "10"],
            ["D11", "11"],
            ["D12", "12"],
            ["D13", "13"],
            ["A0/D14", "14"],
            ["A1/D15", "15"],
            ["A2/D16", "16"],
            ["A3/D17", "17"],
            ["A4/D18", "18"],
            ["A5/D19", "19"],
          ],
        },
        {
          type: "field_dropdown",
          name: "LEVEL",
          options: [
            ["HIGH", "HIGH"],
            ["LOW", "LOW"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COR_BLOCOS,
      tooltip: "Define o estado ALTO (HIGH) ou BAIXO (LOW) de um pino digital.",
      helpUrl: "",
    },

    {
      type: "ler_pino_analogico",
      message0: "Ler pino analógico %1",
      args0: [
        {
          type: "field_dropdown",
          name: "PIN",
          options: [
            ["A0", "A0"],
            ["A1", "A1"],
            ["A2", "A2"],
            ["A3", "A3"],
            ["A4", "A4"],
            ["A5", "A5"]
          ],
        },
      ],
      output: "Number",
      colour: COR_BLOCOS,
      tooltip: "Lê o valor de um pino analógico",
      helpUrl: "",
    },

    {
      type: "definir_pino_pwm",
      message0: "Definir pino %1 com saída: %2 PWM (0-255)",
      args0: [
        {
          type: "field_dropdown",
          name: "PIN",
          options: [
            ["D3", "3"],
            ["D5", "5"],
            ["D6", "6"],
            ["D9", "9"],
            ["D10", "10"],
            ["D11", "11"],
          ],
        },
        {
          type: "field_number",
          name: "VALUE",
          value: 0,
          min: 0,
          max: 255,
          precision: 1,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COR_BLOCOS,
      tooltip: "Define o valor PWM (0-255) de um pino.",
      helpUrl: "",
    },

    {
      type: "definir_pino_porcentagem",
      message0: "Definir pino %1 com saída: %2 %% (0-100%%)",
      args0: [
        {
          type: "field_dropdown",
          name: "PIN",
          options: [
            ["D3", "3"],
            ["D5", "5"],
            ["D6", "6"],
            ["D9", "9"],
            ["D10", "10"],
            ["D11", "11"],
          ],
        },
        {
          type: "field_number",
          name: "VALUE",
          value: 0,
          min: 0,
          max: 100,
          precision: 1,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COR_BLOCOS,
      tooltip:
        "Define o valor de potencia (0-100%) de um pino, convertendo para 0-255.",
      helpUrl: "",
    },
  ]);

  // Geração de código Python
  Blockly.Python["ler_pino_digital"] = function (block) {
    const pin = block.getFieldValue("PIN");
    const level = block.getFieldValue("LEVEL");
    return [
      `ler_pino_digital("${pin}", "${level}")`,
      Blockly.Python.ORDER_FUNCTION_CALL,
    ];
  };

  Blockly.Python["definir_pino_digital"] = function (block) {
    const pin = block.getFieldValue("PIN");
    const level = block.getFieldValue("LEVEL");
    return `definir_pino_digital("${pin}", "${level}")\n`;
  };

  Blockly.Python["ler_pino_analogico"] = function (block) {
    const pin = block.getFieldValue("PIN");
    // Já existe uma função ler_analogico no app.py, usaremos ela.
    return [`ler_analogico("${pin}")`, Blockly.Python.ORDER_FUNCTION_CALL];
  };

  Blockly.Python["definir_pino_pwm"] = function (block) {
    const pin = block.getFieldValue("PIN");
    const value = block.getFieldValue("VALUE"); // Valor de 0 a 255
    // Assume que você terá uma função `definir_pino_pwm` no app.py
    return `definir_pino_pwm("${pin}", ${value})\n`;
  };

  Blockly.Python["definir_pino_porcentagem"] = function (block) {
    const pin = block.getFieldValue("PIN");
    const percentage = block.getFieldValue("VALUE");
    // Converte porcentagem (0-100) para valor PWM (0-255)
    const pwm_value = Math.round((percentage / 100) * 255);
    return `definir_pino_pwm("${pin}", ${pwm_value})\n`;
  };
};
const categoriaPinos = {
  kind: "category",
  name: "Pinos",
  colour: COR_BLOCOS,
  contents: [
    { kind: "block", type: "ler_pino_digital" },
    { kind: "block", type: "definir_pino_digital" },
    { kind: "block", type: "ler_pino_analogico" },
    { kind: "block", type: "definir_pino_pwm" },
    { kind: "block", type: "definir_pino_porcentagem" },
  ],
};

// Exporta os blocos de motores e sua categoria toolbox como módulo duplo
export { pinos, categoriaPinos };
