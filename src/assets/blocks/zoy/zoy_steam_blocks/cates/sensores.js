(() => {
  // Defini a cor da categoria e blocos
  const COR_BLOCOS = "#A7072D";

  const sensores = () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: "zoy_ultrassom_distancia",
        message0: "Ler distância do sensor trig %1 echo %2",
        args0: [
          {
            type: "field_dropdown",
            name: "TRIG",
            options: [["Pino D7", "7"]],
          },
          {
            type: "field_dropdown",
            name: "ECHO",
            options: [["Pino D8", "8"]],
          },
        ],
        output: "Number",
        colour: COR_BLOCOS,
        tooltip: "Retorna a distância lida pelo sensor ultrassônico em cm",
        helpUrl: "",
      },

      {
        type: "sensor_seguidor_linha",
        message0: "Leitura sensor de linha %1",
        args0: [
          {
            type: "field_dropdown",
            name: "PINO",
            options: [
              ["Direito (A3)", "A3"],
              ["Central (A6)", "A6"],
              ["Esquerdo (A7)", "A7"],
            ],
          },
        ],
        output: "Number",
        colour: COR_BLOCOS,
        tooltip: "Lê o valor do sensor seguidor de linha",
        helpUrl: "",
      },
    ]);

    // Geração de código Python
    Blockly.Python["zoy_ultrassom_distancia"] = function (block) {
      var trig = block.getFieldValue("TRIG");
      var echo = block.getFieldValue("ECHO");
      var code = `ler_ultrassom("ULTRASSOM","${trig}, ${echo}")\n`;
      return [code, Blockly.Python.ORDER_ATOMIC];
    };

    Blockly.Python["sensor_seguidor_linha"] = function (block) {
      const pino = block.getFieldValue("PINO");
      return [`ler_analogico('${pino}')`, Blockly.Python.ORDER_FUNCTION_CALL];
    };
  };

  const categoriaSensores = {
    kind: "category",
    name: "Sensores",
    colour: COR_BLOCOS,
    contents: [
      { kind: "block", type: "zoy_ultrassom_distancia" },
      { kind: "block", type: "sensor_seguidor_linha" },
    ],
  };

  // Registra blocos
  window.zoySteamRegistry = window.zoySteamRegistry || [];
  window.zoySteamRegistry.push({ init: sensores, category: categoriaSensores });
})();
