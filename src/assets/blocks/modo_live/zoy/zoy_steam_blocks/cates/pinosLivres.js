
(() => {
// Defini a cor da categoria e blocos
const COR_BLOCOS = "#C95555";

const pinosLivres = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      "type": "ler_pino_digital",
      "message0": "Ler pino digital %1  entrada: %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PIN",
          "options": [
            ["D2", "2"],
            ["D9", "9"],
            ["D10", "10"],
            ["D12", "12"],
            ["D13", "13"],
            ["A0/D14", "14"],
            ["A4/D18", "18"],
            ["A5/D19", "19"],
          ],
        },
        {
          "type": "field_dropdown",
          "name": "MODO",
          "options": [
            ["INPUT", "INPUT"],
            ["INPUT_PULLUP", "INPUT_PULLUP"],
          ],
        },
      ],
      "colour": COR_BLOCOS,
      "output": "Boolean",
      "tooltip":
        "Realiza a leitura de um pino digital e configura o modo de entrada (INPUT ou INPUT_PULLUP).",
      "helpUrl": "",
    },

    {
      "type": "definir_pino_digital",
      "message0": "Definir pino digital %1 como %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PIN",
          "options": [
            ["D2", "2"],
            ["D9", "9"],
            ["D10", "10"],
            ["D12", "12"],
            ["D13", "13"],
            ["A0/D14", "14"],
            ["A4/D18", "18"],
            ["A5/D19", "19"],
          ],
        },
        {
          "type": "field_dropdown",
          "name": "LEVEL",
          "options": [
            ["HIGH", "HIGH"],
            ["LOW", "LOW"],
          ],
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": COR_BLOCOS,
      "tooltip": "Define o estado ALTO (HIGH) ou BAIXO (LOW) de um pino digital.",
      "helpUrl": "",
    },

    {
      "type": "ler_pino_analogico",
      "message0": "Ler pino analógico %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PIN",
          "options": [
            ["A0", "A0"],
            ["A4", "A4"],
            ["A5", "A5"],
          ],
        },
      ],
      "output": "Number",
      "colour": COR_BLOCOS,
      "tooltip": "Lê o valor de um pino analógico",
      "helpUrl": "",
    },
  ]);

  // Geração de código Python
  Blockly.Python["ler_pino_digital"] = function (block) {
    const pin = block.getFieldValue("PIN");
    const modo = block.getFieldValue("MODO");
    return [
      `ler_pino_digital("${pin}", "${modo}")`,
      Blockly.Python.ORDER_FUNCTION_CALL,
    ];
  };

  Blockly.Python["definir_pino_digital"] = function (block) {
    const pin = block.getFieldValue("PIN");
    const level = block.getFieldValue("LEVEL");
    return `definir_pino_digital("DIGITAL_WRITE","${pin}, ${level}")\n`;
  };

  Blockly.Python["ler_pino_analogico"] = function (block) {
    const pin = block.getFieldValue("PIN");
    // Já existe uma função ler_analogico no app.py, usaremos ela.
    return [`ler_analogico("${pin}")`, Blockly.Python.ORDER_FUNCTION_CALL];
  };
};

const categoriaPinosLivres = {
  kind: "category",
  name: "Pinos Livres",
  colour: COR_BLOCOS,
  contents: [
    { kind: "block", type: "ler_pino_digital" },
    { kind: "block", type: "definir_pino_digital" },
    { kind: "block", type: "ler_pino_analogico" },
  ],
};

// Exporta os blocos de pinos livres e sua categoria toolbox como módulo duplo
//export { pinosLivres, categoriaPinosLivres };
  
// Registra blocos
window.zoySteamRegistry = window.zoySteamRegistry || [];
window.zoySteamRegistry.push({ init: pinosLivres, category: categoriaPinosLivres });
})();