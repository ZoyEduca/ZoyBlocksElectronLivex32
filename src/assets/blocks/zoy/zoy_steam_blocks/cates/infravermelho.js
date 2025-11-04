(() => {
  // Cor padrão para blocos IR
  const COR_BLOCOS = "#8E44AD";

  const infravermelho = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "ir_read",
        message0: "Ler sensor IR no pino %1 entrada: %2",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["A0/D14", "D14"],
              ["A4/D18", "D18"],
              ["A5/D19", "D19"],
              ["D2", "D2"],
              ["D9", "D9"],
              ["D10", "D10"],
              ["D12", "D12"],
              ["D13", "D13"],
            ],
          },
          {
            type: "field_dropdown",
            name: "MODO",
            options: [
              ["INPUT", "INPUT"],
              ["INPUT_PULLUP", "INPUT_PULLUP"],
            ],
          },
        ],
        output: "Boolean", // retorna True/False
        colour: COR_BLOCOS,
        tooltip: "Retorna Verdade/Falso se o sensor IR detectar obstáculo",
        helpUrl: "",
      },

      {
        type: "ir_value",
        message0: "Valor do sensor IR no pino %1",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["A0", "A0"],
              ["A4", "A4"],
              ["A5", "A5"],
            ],
          },
        ],
        output: "Number",
        colour: COR_BLOCOS,
        tooltip: "Retorna o valor analógico da leitura do sensor IR",
        helpUrl: "",
      },

      {
        type: "ir_if_detect",
        message0: "Se sensor IR no pino %1 como %2 detectar obstáculo",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["A0/D14", "D14"],
              ["A4/D18", "D18"],
              ["A5/D19", "D19"],
              ["D2", "D2"],
              ["D9", "D9"],
              ["D10", "D10"],
              ["D12", "D12"],
              ["D13", "D13"],
            ],
          },
          {
            type: "field_dropdown",
            name: "MODO",
            options: [
              ["INPUT", "INPUT"],
              ["INPUT_PULLUP", "INPUT_PULLUP"],
            ],
          },
        ],
        message1: "faça %1",
        args1: [
          {
            type: "input_statement",
            name: "DO",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Executa ações se o sensor detectar obstáculo",
        helpUrl: "",
      },

      {
        type: "ir_if_not_detect",
        message0: "Se sensor IR no pino %1 como %2 NÃO detectar obstáculo",
        args0: [
          {
            type: "field_dropdown",
            name: "PIN",
            options: [
              ["A0/D14", "D14"],
              ["A4/D18", "D18"],
              ["A5/D19", "D19"],
              ["D2", "D2"],
              ["D9", "D9"],
              ["D10", "D10"],
              ["D12", "D12"],
              ["D13", "D13"],
            ],
          },
          {
            type: "field_dropdown",
            name: "MODO",
            options: [
              ["INPUT", "INPUT"],
              ["INPUT_PULLUP", "INPUT_PULLUP"],
            ],
          },
        ],
        message1: "faça %1",
        args1: [
          {
            type: "input_statement",
            name: "DO"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_BLOCOS,
        tooltip: "Executa ações se o sensor NÃO detectar obstáculo",
        helpUrl: "",
      },
    ]);

    // Geração de código Javascript
    Blockly.JavaScript.forBlock["ir_read"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const modo = block.getFieldValue("MODO");
      // Adiciona "await" pois é uma função assíncrona
      const code = `await digital_read("DIGITAL_READ","${pin}, ${modo}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };

    Blockly.JavaScript.forBlock["ir_value"] = function (block) {
      const pin = block.getFieldValue("PIN");
      // Adiciona "await" pois é uma função assíncrona
      const code = `await analog_read("ANALOG_READ", "${pin}")`;
      return [code, Blockly.JavaScript.ORDER_AWAIT];
    };

    Blockly.JavaScript.forBlock["ir_if_detect"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const modo = block.getFieldValue("MODO");
      // Código dos blocos dentro do "faça"
      const statements = Blockly.JavaScript.statementToCode(block, "DO");
      const code = `if (await digital_read("DIGITAL_READ","${pin}, ${modo}")) {${statements}}`;
      return code;
    };

    Blockly.JavaScript.forBlock["ir_if_not_detect"] = function (block) {
      const pin = block.getFieldValue("PIN");
      const modo = block.getFieldValue("MODO");
      const statements = Blockly.JavaScript.statementToCode(block, "DO");
      const code = `if (!(await digital_read("DIGITAL_READ","${pin}, ${modo}"))) {${statements}}`;
      return code;
    };

  };

  // Categoria para toolbox
  const categoriaInfravermelho = {
    kind: "category",
    name: "Infravermelho",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "ir_read" },
      { kind: "block", type: "ir_value" },
      { kind: "block", type: "ir_if_detect" },
      { kind: "block", type: "ir_if_not_detect" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: infravermelho, category: categoriaInfravermelho });
})();
