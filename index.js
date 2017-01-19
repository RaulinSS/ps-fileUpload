"use strict";
(function(){
    document.addEventListener("DOMContentLoaded",function($event){                                
        //se cria um escuta para o error do fileUpload
        $(document).on("error.ps.fileUpload",function($event,errorType,fileWithError,component){
            const file = fileWithError ? fileWithError : void(0);
            createFileWithError(errorType,file,component);  
        })

        $(document).on("sucess.ps.fileUpload", function($event,component){
            debugger;
            //updateStatusBtnSend();
        })

        // se cria a referença para o botão enviar
        const btnSend = document.getElementById("btn-send-documents"),
              listComponents = document.getElementById("");

        if(btnSend){
            btnSend.addEventListener("click", function(){
                showMessageSuccess();
            });
        }

        let idIncrementalError = 0;
    
        const createFileWithError = function(errorType,file,component){
            
            if(!errorType || !file || !component )
                return;
                                    
            const container = document.createElement("div");
            container.innerHTML = component.templateItem;

            const itemList = container.children[0];

            //criamos um id para o file
            file.IdError = idIncrementalError;

            container.querySelector("[data-item]").setAttribute("data-item-key", "key-error-" +  file.IdError);
            container.querySelector("[data-item-filename]").innerHTML = file.name;        
            container.querySelector("[data-item-size]").innerHTML = file.formattedSize.join(" ");

            /* apagamos o botao visualizar quando é um arquivo de erro*/
            const visualizeOption = container.querySelector("[data-visualize]");

            if(visualizeOption)
                visualizeOption.parentElement.removeChild(visualizeOption);

            /* se adiciona a mensagem de erro */            
            addMessageErrorToItem(itemList,errorType,component);

            container.querySelector("[data-delete]").addEventListener("click", function($event){            
                removeItem(file.IdError,component);
            },false);

            itemList.classList.add("error-file");
                        
            //se obtem a lista que contem os files do componente que está sendo utilizado.
            const fileList = document.getElementById(component.options.target);

            if(fileList){
                //se adiciona o file com erro na lista de files.
                fileList.appendChild(itemList);
            }            

            idIncrementalError++;
    
            //validamos a quantiade de arquivos anexados para habilitar/desabilitar o componente 
            component.element.disabled = !component.canAttachFile(component.maxAmountAllowed);

            //se valida se o componente é válido.  
            component.valid = component.isValid();
        };

        const removeItem =  function(key, component){
            const itemKey = "key-error-" + key;
            const identifierItem = "[data-item-key=" + "'" + itemKey + "'" + "]";
            const idParentItem = "#" + component.options.target;
            const itemList = document.querySelector(idParentItem + " " + identifierItem);

            if(itemList){
                //se apaga o item do DOM.
                itemList.parentElement.removeChild(itemList); 
                
                //se atualiza o contador de erros;
                component.filesWithError--;            
            }

            //validamos a quantiade de arquivos anexados para habilitar/desabilitar o componente            
            component.element.disabled = !component.canAttachFile(component.maxAmountAllowed);

            //se valida se o componente é válido.  
            component.valid = component.isValid();
        };    
        
        const addMessageErrorToItem = function(itemList,errorType,component){
            if(!itemList || !errorType || !component){
                throw Error("error na função addMessageErrorToItem");
            }
            
            const msgErrorSize = "Seu arquivo ultrapassou o tamanho permitido, envie um arquivo de até " + component.maxSizeAllowed + "MB.";
            const msgErrorFormat = "Seu arquivo não está no formato correto (JPG, GIF, PNG e PDF).";
            const _span = document.createElement("span");
            
            switch(errorType){
                case "size":
                        _span.textContent = msgErrorSize;       
                    break;
                case "format":
                        _span.textContent = msgErrorFormat;                                             
                    break; 
                default:                        
                    break;                
            }

            //se adiciona a classe no span criado
            _span.classList.add("file-error-message");

            //se adiciona a mensagem na lista
            itemList.appendChild(_span);
        };

        const validateComponents = function(){
        };

        const showMessageSuccess = function(){
            debugger;
            alert("arquivos enviados ...");
        };

        const updateStatusBtnSend = function(status){
            btnSend.disabled = status;
        };
    })  
}())