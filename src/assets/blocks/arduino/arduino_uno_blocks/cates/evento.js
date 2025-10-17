// Defini a cor da categoria e blocos
const COR_BLOCOS = "#A55B80";

const eventos = () => {
  Blockly.defineBlocksWithJsonArray([
    {
        "type": "iniciar_nano",
        "message0": "Iniciar Arduino Nano",
        "nextStatement": null,
        "tooltip": "Bloco de início do programa ZOY STEAM",
        "helpUrl": "",
        "style": "hat_blocks",   // (alternativo, se você usa theme)
        "hat": "true" // ESSENCIAL para evento
    }
  ]);

  // Geração de código Python
  Blockly.Python["iniciar_nano"] = () =>
    `iniciar_zoy( "ZOY", "ZOY")\n`;
  
};

const categoriaEventos = {
  kind: "category",
  name: "Iniciar Arduino",
  colour: COR_BLOCOS,
  contents: [
    { kind: "block", type: "iniciar_nano" }
  ],
};

// Exporta os blocos de eventos e sua categoria toolbox como módulo duplo
export { eventos, categoriaEventos };