(() => {
// Defini a cor da categoria e blocos
const COR_BLOCOS = "#9300DB";

const botao = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      "type": "zoy_botao",
      "message0": "Ler botão ZOY ",
      "args0": [],
      "colour": COR_BLOCOS,
      "output": "Boolean",
      "tooltip": "Botão Zoy sem debounce",
      "helpUrl": "",
    },
    {
      "type": "zoy_botao_debounce",
      "message0": "Ler botão ZOY (debounce) ",
      "args0": [],
      "colour": COR_BLOCOS,
      "output": "Boolean",
      "tooltip": "Botão Zoy com debounce",
      "helpUrl": "",
    },
  ]);

  // Geração de código Python
  Blockly.Python["zoy_botao"] = function () {
    return [
      `ler_pino_digital("4", "INPUT_PULLUP")`,
      Blockly.Python.ORDER_FUNCTION_CALL,
    ];
  };

  Blockly.Python["zoy_botao_debounce"] = function (block) {
    return [
      `ler_botao_debounce("4", "INPUT_PULLUP")`,
      Blockly.Python.ORDER_FUNCTION_CALL,
    ];
  };
};
const categoriaBotao = {
  kind: "category",
  name: "Botão",
  colour: COR_BLOCOS,
  contents: [
    { kind: "block", type: "zoy_botao" },
    // Removido temporariamente para evitar erro do debounce
    // { kind: "block", type: "zoy_botao_debounce" },
  ],
};

// Exporta os blocos de botões e sua categoria toolbox como módulo duplo
//export { botao, categoriaBotao };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: botao, category: categoriaBotao });
})();