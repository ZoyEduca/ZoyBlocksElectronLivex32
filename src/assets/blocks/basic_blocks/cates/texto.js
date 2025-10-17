(() => {
const texto = () => {
  // Blockly.defineBlocksWithJsonArray([

  // ]);

  // Geração de código Python

};

const categoriaTexto = {
  kind: "category",
  name: "Texto",
  colour: "160",
  contents: [
    { kind: "block", type: "text" },
    { kind: "block", type: "text_join" },
  ],
};

 // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaTexto);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(texto);

})();