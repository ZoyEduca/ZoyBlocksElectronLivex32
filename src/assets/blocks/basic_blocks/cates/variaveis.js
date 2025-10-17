(() => {

const variaveis = () => {
  // Blockly.defineBlocksWithJsonArray([
  //   {
  //     // Local para criar blocos personalizados
  //     // "type": "blocoPersonalizado",
  //   },
  // ]);

  // Geração de código Python
  //   Blockly.Python['blocoPersonalizado'] = () =>
  //     'função()\n';
};

const categoriaVariaveis = {
  kind: "category",
  name: "Variáveis",
  custom: "VARIABLE",
  colour: "330",
};
 // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaVariaveis);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(variaveis);

})();