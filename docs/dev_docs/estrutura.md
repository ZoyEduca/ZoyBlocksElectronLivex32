zoyblocks/
├── build/                         # recursos para build do electron-builder
│
├── dist/                          # gerado automaticamente (output do builder)
│
├── docs/                     # documentação de suporte
│   ├── dev_docs/             # documentação de suporte para devs(arquiteturas, tutoriais ...)
│   │   ├── estrutura.md     # Estrutura do projeto / arvore de diretorios
│   │   └── ...
│   ├── manual.json            # manual para gerar faq de perguntas e resposta para o chatbot
│   └── ...
│
├── python/                         # scripts auxiliares em Python
│   ├── chatbot.py                  # script principal do chatbot
│   ├── chatbot_fast.py
│   └── precompute_embeddings.py
│
├── arduino_cli/                   # binários do arduino-cli
│   ├── linux/arduino-cli
│   └── windows/arduino-cli.exe
│
├── node_modules/                  # ambiente node
|
├── src/                           # estrutura-fonte principal
│   ├── assets/               # arquivos estáticos globais
│   │   ├── blocks/           # conjunto de blocos para modo gravar e live
│   │   │   ├── modo_gravar/            # blocos para modo gravar
│   │   │   ├── modo_live/              # blocos para modo live
│   │   │   │   ├── arduino/
│   │   │   │   │   ├── nano_blocks/
│   │   │   │   │   └── uno_blocks/
│   │   │   │   ├── basic_blocks/       #blocos básicos presente em todos os dispositivos
│   │   │   │   │   ├── cates/
│   │   │   │   │   │   ├── controle.js
│   │   │   │   │   │   ├── funcao.js
│   │   │   │   │   │   └──  basic_blocks.js
│   │   │   │   │   └──  basic_blocks.js
│   │   │   │   └── zoy/
│   │   │   │   │   ├── zoy_maker_blocks/
│   │   │   │   │   └── zoy_steam_blocks/
│   │   ├── icons/
│   │   ├── imgs/
│   │   ├── libs/
│   │   │   ├── blockduino/    # arquivos da biblioteca blocklyduino
│   │   │   ├── blockly/       #arquivo copiado da node_module por script
│   │   │   └── bootstrap/     # bootstrap local
│   │   └── styles/
│   │   │   └── base.css       #Estilo global
│   │
│   ├── main/                           # processo principal do Electron
│   │   ├── main.js
│   │   ├── services/                   # lógica de negócio e comunicação
│   │   │   ├── blockly-service.js      # regras dos blocos
│   │   │   └── serial-service.js
│   │   └── preload/
│   │       └── preload.js
│   │
│   ├── renderer/                 # interface gráfica
│   │   ├── views/                # telas da IDE(separadas por html,css e js)
│   │   │   ├── home/             # tela principal
│   │   │   │   ├── home.html
│   │   │   │   ├── home.css
│   │   │   │   └── home.js
│   │   │   └── outra_view_ex/    # outra tela (exemplo)
│   │   │       ├── outra_view_ex.html
│   │   │       ├── outra_view_ex.css
│   │   │       └── outra_view_ex.js
│   │   └── utils/                # funções de utilitarios para o front end
│   │   │   └── assetLoader.js    # trata tipos de importação(css,js,img ...)
│
├── venv/                  # ambiente virtual Python
│   ├── Scripts/           # (Windows)
│   └── bin/               # (Linux/macOS)
│
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── packageBackup.json         # copia do package.json que funcion, caso o original seja alterado
├── requirements.txt          # dependencias do venv
└── README.md



Atualização da biblioteca blockly
rode o script `npm run copy-blockly` que está presente no package.json