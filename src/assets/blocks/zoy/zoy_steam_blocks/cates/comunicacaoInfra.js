(() => {
  const COR_IR = "#8E44AD";

  const comunicacaoInfra = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "ir_send",
        message0: "Enviar IR %1",
        args0: [
          {
            type: "input_value",
            name: "MSG",
            check: ["String", "Number"],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COR_IR,
        tooltip: "Envia mensagem pelo transmissor infravermelho",
        helpUrl: "",
      },

      {
        type: "ir_receive",
        message0: "Receber mensagem IR",
        output: "String",
        colour: COR_IR,
        tooltip: "Retorna a última mensagem recebida via infravermelho",
        helpUrl: "",
      },

      {
        type: "ir_if_message",
        message0: "Se mensagem IR recebida for %1",
        args0: [
          {
            type: "input_value",
            name: "MSG",
            check: ["String", "Number"],
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
        colour: COR_IR,
        tooltip: "Executa ações quando mensagem recebida via IR for igual",
        helpUrl: "",
      },
      {
        type: "ir_print",
        message0: "Mostrar mensagem IR recebida",
        previousStatement: null,
        nextStatement: null,
        colour: COR_IR,
        tooltip: "Mostra no console a mensagem recebida via IR",
        helpUrl: "",
      },
    ]);

    // ---------- Geradores Python ----------
    Blockly.Python["ir_send"] = (block) => {
      const msg =
        Blockly.Python.valueToCode(block, "MSG", Blockly.Python.ORDER_ATOMIC) ||
        '""';
      return `ir_send(${msg})\n`;
    };

    Blockly.Python["ir_receive"] = (block) => {
      const code = "ir_receive()";
      return [code, Blockly.Python.ORDER_FUNCTION_CALL];
    };

    Blockly.Python["ir_if_message"] = (block) => {
      const msg =
        Blockly.Python.valueToCode(block, "MSG", Blockly.Python.ORDER_ATOMIC) ||
        '""';
      const statements = Blockly.Python.statementToCode(block, "DO");
      return `if ir_receive() == ${msg}:\n${statements}`;
    };
    Blockly.Python["ir_print"] = function (block) {
      return "print(ir_receive())\n";
    };
  };

  // Categoria na toolbox
  const categoriaComunicacaoInfra = {
    kind: "category",
    name: "ComunicacaoInfra",
    colour: COR_IR,
    contents: [
      { kind: "block", type: "ir_send" },
      { kind: "block", type: "ir_receive" },
      { kind: "block", type: "ir_if_message" },
      { kind: "block", type: "ir_print" },
    ],
  };

  //export { comunicacaoInfra, categoriaComunicacaoInfra };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({
    init: comunicacaoInfra,
    category: categoriaComunicacaoInfra,
  });
})();
