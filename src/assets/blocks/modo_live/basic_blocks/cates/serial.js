(() => {
// Cor da categoria
const COR_SERIAL = "160";

const serial = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      "type": "serial_println",
      "message0": "Serial println %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
          "check": "String",
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": COR_SERIAL,
      "tooltip": "Imprime uma linha na serial",
      "helpUrl": ""
    },
    {
      "type": "serial_read",
      "message0": "Ler Serial",
      "args0": [],
      "output": null,
      "colour": COR_SERIAL,
      "tooltip": "Lê dados da serial",
      "helpUrl": ""
    }
  ]);

  // ----------  Gerador para Arduino(C++) ----------
  // Posso deixar sem o gerador arduino pois ele já existe nativamente no arduino_compressed
  // Blockly.Arduino['serial_println'] = function (block) {
  //   const msg = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
  //   Blockly.Arduino.setups_['serial_begin'] = 'Serial.begin(9600);';
  //   return `Serial.println(${msg});\n`;
  // };

  // Blockly.Arduino['serial_read'] = function (block) {
  //   Blockly.Arduino.setups_['serial_begin'] = 'Serial.begin(9600);';
  //   return ['Serial.read()', Blockly.Arduino.ORDER_ATOMIC];
  // };

  // ----------  Gerador para Python  ----------
  Blockly.Python['serial_println'] = function (block) {
    const msg = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_NONE) || '""';
    return `print(${msg})\n`;
  };

  Blockly.Python['serial_read'] = function (block) {
    return ['input()', Blockly.Python.ORDER_ATOMIC];  // ou uma simulação como input_serial()
  };
};

// Categoria Serial
const categoriaSerial = {
  kind: "category",
  name: "Serial",
  colour: COR_SERIAL,
  contents: [
    { kind: "block", type: "serial_println" },
    { kind: "block", type: "serial_read" }
  ]
};
 // Registra globalmente
  window.basicCategories = window.basicCategories || [];
  window.basicCategories.push(categoriaSerial);

  window.basicInitFunctions = window.basicInitFunctions || [];
  window.basicInitFunctions.push(serial);

})();