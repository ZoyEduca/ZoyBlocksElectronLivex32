import { eventos, categoriaEventos } from './cates/evento.js';
import { pinos, categoriaPinos } from './cates/pin.js';
import { luz, categoriaLuz } from './cates/luz.js';
import { sensores, categoriaSensores } from './cates/sensores.js';

const arduinoNanoBlocks = () => {
  eventos(); //inicializa o bloco de eventos
  pinos(); //inicializa o bloco dos pinos
  luz();
  sensores(); //inicializa o bloco dos sensores
 };

const toolboxArduinoNano = {
  kind: "categoryToolbox",
  contents: [
    categoriaEventos,
    categoriaPinos,
    categoriaLuz,
    categoriaSensores
  ]
};

export { arduinoNanoBlocks, toolboxArduinoNano };
