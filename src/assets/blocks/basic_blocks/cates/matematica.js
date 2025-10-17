(() => {
const matematica = () => {
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

const categoriaMatematica = {
  kind: "category",
  name: "Matemática",
  colour: "230",
  contents: [
    { kind: "block", type: "math_number" },
    { kind: "block", type: "math_arithmetic" },
    { kind: "block", type: "math_single" },
    { kind: "block", type: "math_constant" },
    { kind: "block", type: "math_number_property" },
    { kind: "block", type: "math_modulo" },
    { kind: "block", type: "math_round" },
    {
      kind: "block",
      type: "math_constrain",
      inputs: {
        LOW: {
          shadow: {
            type: "math_number",
            fields: { NUM: 1 },
          },
        },
        HIGH: {
          shadow: {
            type: "math_number",
            fields: { NUM: 100 },
          },
        },
      },
    },
    {
      kind: "block",
      type: "math_random_int",
      inputs: {
        FROM: {
          shadow: {
            type: "math_number",
            fields: { NUM: 1 },
          },
        },
        TO: {
          shadow: {
            type: "math_number",
            fields: { NUM: 10 },
          },
        },
      },
    },
    { kind: "block", type: "math_random_float" },
  ],
};

 // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaMatematica);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(matematica);

})();