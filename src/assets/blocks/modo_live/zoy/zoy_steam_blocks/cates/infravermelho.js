(() => {

// Cor padrão para blocos IR
const COR_IR = "#8E44AD";

const infravermelho = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      "type": "ir_read",
      "message0": "Ler sensor IR no pino %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PIN",
          "options": [
            ["A0", "A0"],
            ["A1", "A1"],
            ["D2", "D2"],
            ["D3", "D3"]
          ],
        },
      ],
      "output": "Boolean",  // retorna True/False
      "colour": COR_IR,
      "tooltip": "Retorna True se o sensor IR detectar obstáculo",
      "helpUrl": "",
    },

    {
      "type": "ir_value",
      "message0": "Valor do sensor IR no pino %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PIN",
          "options": [
            ["A0", "A0"],
            ["A1", "A1"],
            ["D2", "D2"],
            ["D3", "D3"]
          ],
        },
      ],
      "output": "Number",
      "colour": COR_IR,
      "tooltip": "Retorna o valor digital/analógico do sensor IR",
      "helpUrl": "",
    },

    {
      "type": "ir_if_detect",
      "message0": "Se sensor IR no pino %1 detectar obstáculo",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PIN",
          "options": [
            ["A0", "A0"],
            ["A1", "A1"],
            ["D2", "D2"],
            ["D3", "D3"]
          ],
        },
      ],
      "message1": "faça %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DO",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": COR_IR,
      "tooltip": "Executa ações se o sensor detectar obstáculo",
      "helpUrl": "",
    },
  ]);

  // Geração de código Python
  Blockly.Python["ir_read"] = (block) => {
    const pin = block.getFieldValue("PIN");
    const code = `ir_read("${pin}")`;
    return [code, Blockly.Python.ORDER_FUNCTION_CALL];
  };

  Blockly.Python["ir_value"] = (block) => {
    const pin = block.getFieldValue("PIN");
    const code = `ir_value("${pin}")`;
    return [code, Blockly.Python.ORDER_FUNCTION_CALL];
  };

  Blockly.Python["ir_if_detect"] = (block) => {
    const pin = block.getFieldValue("PIN");
    const statements = Blockly.Python.statementToCode(block, "DO");
    return `if ir_read("${pin}"):\n${statements}`;
  };
};

// Categoria para toolbox
const categoriaInfravermelho = {
  kind: "category",
  name: "Infravermelho",
  colour: COR_IR,
  contents: [
    { kind: "block", type: "ir_read" },
    { kind: "block", type: "ir_value" },
    { kind: "block", type: "ir_if_detect" },
  ],
};

// Exporta os blocos de IR
//export { infravermelho, categoriaInfravermelho };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: infravermelho, category: categoriaInfravermelho });
})();