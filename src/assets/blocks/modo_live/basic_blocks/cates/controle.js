(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = 210;

  const controle = () => {
    // Verifica se o bloco já foi definido
    if (!Blockly.Blocks["aguarde_segundos"]) {
      Blockly.defineBlocksWithJsonArray([
        {
          type: "aguarde_segundos",
          message0: "aguarde %1 segundos",
          args0: [
            {
              type: "field_number",
              name: "TEMPO",
              value: 1,
              min: 0,
              precision: 0.1,
            },
          ],
          previousStatement: null,
          nextStatement: null,
          colour: COR_BLOCOS,
          tooltip: "Pausa a execução por N segundos",
          helpUrl: "",
        },
      ]);

      Blockly.Python["aguarde_segundos"] = (block) =>
        `time.sleep(${block.getFieldValue("TEMPO")})\n`;
    }

    // Redefinição de blocos com nova cor
    Blockly.Blocks["controls_repeat_ext_custom"] = Object.assign(
      {},
      Blockly.Blocks["controls_repeat_ext"]
    );
    Blockly.Blocks["controls_repeat_ext_custom"].init = function () {
      Blockly.Blocks["controls_repeat_ext"].init.call(this);
      this.setColour(COR_BLOCOS);
    };
    Blockly.Python["controls_repeat_ext_custom"] = function (block) {
      return Blockly.Python["controls_repeat_ext"](block);
    };

    Blockly.Blocks["controls_whileUntil_custom"] = Object.assign(
      {},
      Blockly.Blocks["controls_whileUntil"]
    );
    Blockly.Blocks["controls_whileUntil_custom"].init = function () {
      Blockly.Blocks["controls_whileUntil"].init.call(this);
      this.setColour(COR_BLOCOS);
    };
    Blockly.Python["controls_whileUntil_custom"] = function (block) {
      return Blockly.Python["controls_whileUntil"](block);
    };

    Blockly.Blocks["controls_for_custom"] = Object.assign(
      {},
      Blockly.Blocks["controls_for"]
    );
    Blockly.Blocks["controls_for_custom"].init = function () {
      Blockly.Blocks["controls_for"].init.call(this);
      this.setColour(COR_BLOCOS);
    };
    Blockly.Python["controls_for_custom"] = function (block) {
      return Blockly.Python["controls_for"](block);
    };
  };

  const categoriaControle = {
    kind: "category",
    name: "Controle",
    colour: COR_BLOCOS,
    contents: [
      // { kind: "label", text: "Controle de Condição:" },
      { kind: "block", type: "controls_if" },

      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      // { kind: "label", text: "Controle de repetição:" },
      { kind: "block", type: "controls_repeat_ext_custom" },
      { kind: "block", type: "controls_whileUntil_custom" },
      { kind: "block", type: "controls_for_custom" },
      // Adicionando um separador visual
      { kind: "sep", gap: "50" },

      // { kind: "label", text: "Controle de tempo:" },
      // bloco customizado aguarda segundos
      { kind: "block", type: "aguarde_segundos" },
    ],
  };

  // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaControle);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(controle);

})();