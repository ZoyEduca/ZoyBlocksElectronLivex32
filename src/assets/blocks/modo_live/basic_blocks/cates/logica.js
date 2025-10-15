(() => {
// Defini a cor da categoria e blocos
const COR_BLOCOS = 120;

const logica = () => {
  // Blockly.defineBlocksWithJsonArray([
  //   {
  //     // Local para criar blocos personalizados
  //     // "type": "blocoPersonalizado",
  //   },
  // ]);

  // Geração de blocos personalizados
  //   Blockly.Python['blocoPersonalizado'] = () =>
  //     'função()\n';

  // Redefinição de blocos com nova cor
  Blockly.Blocks["logic_compare_custom"] = Object.assign(
    {},
    Blockly.Blocks["logic_compare"]
  );
  Blockly.Blocks["logic_compare_custom"].init = function () {
    Blockly.Blocks["logic_compare"].init.call(this);
    this.setColour(COR_BLOCOS);
  };
  Blockly.Python["logic_compare_custom"] = function (block) {
    return Blockly.Python["logic_compare"](block);
  };

  Blockly.Blocks["logic_operation_custom"] = Object.assign(
    {},
    Blockly.Blocks["logic_operation"]
  );
  Blockly.Blocks["logic_operation_custom"].init = function () {
    Blockly.Blocks["logic_operation"].init.call(this);
    this.setColour(COR_BLOCOS);
  };
  Blockly.Python["logic_operation_custom"] = function (block) {
    return Blockly.Python["logic_operation"](block);
  };

  Blockly.Blocks["logic_negate_custom"] = Object.assign(
    {},
    Blockly.Blocks["logic_negate"]
  );
  Blockly.Blocks["logic_negate_custom"].init = function () {
    Blockly.Blocks["logic_negate"].init.call(this);
    this.setColour(COR_BLOCOS);
  };
  Blockly.Python["logic_negate_custom"] = function (block) {
    return Blockly.Python["logic_negate"](block);
  };

  Blockly.Blocks["logic_boolean_custom"] = Object.assign(
    {},
    Blockly.Blocks["logic_boolean"]
  );
  Blockly.Blocks["logic_boolean_custom"].init = function () {
    Blockly.Blocks["logic_boolean"].init.call(this);
    this.setColour(COR_BLOCOS);
  };
  Blockly.Python["logic_boolean_custom"] = function (block) {
    return Blockly.Python["logic_boolean"](block);
  };
};

const categoriaLogica = {
  kind: "category",
  name: "Lógica",
  colour: COR_BLOCOS,
  contents: [
    { kind: "block", type: "logic_compare_custom" },
    { kind: "block", type: "logic_operation_custom" },
    { kind: "block", type: "logic_negate_custom" },
    { kind: "block", type: "logic_boolean_custom" },
  ],
};

 // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaLogica);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(logica);

})();