// funcao.js

(() => {
    // Definição da cor da categoria
    const COR_FUNCAO = "290";

    const funcao = () => {
        // --- Definição de Cores ---
        // Usando a propriedade 'colour'
        if (Blockly.Blocks['procedures_defreturn']) {
            Blockly.Blocks['procedures_defreturn'].colour = COR_FUNCAO;
        }

        if (Blockly.Blocks['procedures_defnoreturn']) {
            Blockly.Blocks['procedures_defnoreturn'].colour = COR_FUNCAO;
        }
        
        if (Blockly.Blocks['procedures_callreturn']) {
            Blockly.Blocks['procedures_callreturn'].colour = COR_FUNCAO;
        }
        if (Blockly.Blocks['procedures_callnoreturn']) {
            Blockly.Blocks['procedures_callnoreturn'].colour = COR_FUNCAO;
        }

        // =================================================================
        // =========== Geradores de Código JavaScript para Funções =========
        // =================================================================

        // Bloco: procedures_defnoreturn (Definição de função SEM retorno)
        Blockly.JavaScript.forBlock['procedures_defnoreturn'] = function(block) {
            // Acesso estático ao nameDB_
            const funcName = Blockly.JavaScript.nameDB_.getName(
                block.getFieldValue('NAME'), 
                Blockly.PROCEDURE_CATEGORY_NAME
            );
            
            // CORREÇÃO: Usando Blockly.JavaScript.statementToCode
            let branch = Blockly.JavaScript.statementToCode(block, 'STACK');
            
            if (!branch) {
                branch = '  ;\n';
            }

            const args = [];
            const variables = block.getVars();
            for (let i = 0; i < variables.length; i++) {
                args[i] = Blockly.JavaScript.nameDB_.getName(variables[i],
                    Blockly.VARIABLE_CATEGORY_NAME);
            }

            let code = `async function ${funcName}(${args.join(', ')}) {\n${branch}}`;
            
            Blockly.JavaScript.definitions_['%' + funcName] = code;
            
            return null;
        };

        // Bloco: procedures_defreturn (Definição de função COM retorno)
        Blockly.JavaScript.forBlock['procedures_defreturn'] = function(block) {
            // CORREÇÃO: Usando Blockly.JavaScript.statementToCode e valueToCode
            let branch = Blockly.JavaScript.statementToCode(block, 'STACK');
            const returnValue = Blockly.JavaScript.valueToCode(block, 'RETURN',
                Blockly.JavaScript.ORDER_NONE) || '';
            
            if (returnValue) {
                branch += '  return ' + returnValue + ';\n';
            }
            
            const funcName = Blockly.JavaScript.nameDB_.getName(
                block.getFieldValue('NAME'), 
                Blockly.PROCEDURE_CATEGORY_NAME
            );
            const args = [];
            const variables = block.getVars();
            for (let i = 0; i < variables.length; i++) {
                args[i] = Blockly.JavaScript.nameDB_.getName(variables[i],
                    Blockly.VARIABLE_CATEGORY_NAME);
            }

            let code = `async function ${funcName}(${args.join(', ')}) {\n${branch}}`;
            Blockly.JavaScript.definitions_['%' + funcName] = code;
            
            return null;
        };


        // Bloco: procedures_callnoreturn (Chamada de função SEM retorno)
        Blockly.JavaScript.forBlock['procedures_callnoreturn'] = function(block) {
            const funcName = Blockly.JavaScript.nameDB_.getName(
                block.getFieldValue('NAME'), 
                Blockly.PROCEDURE_CATEGORY_NAME
            );
            
            const args = [];
            for (let i = 0; i < block.arguments_.length; i++) {
                // CORREÇÃO: Usando Blockly.JavaScript.valueToCode
                args[i] = Blockly.JavaScript.valueToCode(block, 'ARG' + i,
                    Blockly.JavaScript.ORDER_COMMA) || 'null';
            }
            
            const code = `await ${funcName}(${args.join(', ')});\n`;
            return code;
        };

        // Bloco: procedures_callreturn (Chamada de função COM retorno)
        Blockly.JavaScript.forBlock['procedures_callreturn'] = function(block) {
            const funcName = Blockly.JavaScript.nameDB_.getName(
                block.getFieldValue('NAME'), 
                Blockly.PROCEDURE_CATEGORY_NAME
            );
            
            const args = [];
            for (let i = 0; i < block.arguments_.length; i++) {
                // CORREÇÃO: Usando Blockly.JavaScript.valueToCode
                args[i] = Blockly.JavaScript.valueToCode(block, 'ARG' + i,
                    Blockly.JavaScript.ORDER_COMMA) || 'null';
            }
            
            const code = `await ${funcName}(${args.join(', ')})`;
            return [code, Blockly.JavaScript.ORDER_AWAIT];
        };
    };

    const categoriaFuncao = {
        kind: "category",
        name: "Funções",
        custom: "PROCEDURE",
        colour: COR_FUNCAO,
    };
    
    // Registra globalmente
    window.basicCategories = window.basicCategories || [];
    window.basicCategories.push(categoriaFuncao);

    window.basicInitFunctions = window.basicInitFunctions || [];
    window.basicInitFunctions.push(funcao);

})();