(() => {
const funcao = () => {
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

const categoriaFuncao = {
  kind: "category",
  name: "Funções",
  custom: "PROCEDURE",
  colour: "290",
};
 // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaFuncao);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(funcao);

})();