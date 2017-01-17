"use strict";
(function(){
    document.addEventListener("DOMContentLoaded",function($event){                                
        //se cria um escuta para o error do fileUpload
        $(document).on("error.ps.fileUpload",function($event,fileWithError,component){     
            const file = fileWithError ? fileWithError : void(0);
            createFileWithError(file,component);  
        })
        
        let idIncrementalError = 0;

        const createFileWithError = function(file,component){
            
            if(!file || !component)
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
            
            //limpamos o valor do inputfile utilizado pelo componente
            component.element.value = "";
                        
            //validamos a quantiade de arquivos anexados para habilitar/desabilitar o componente
            component.isValid = isValidComponent(component);

            //se desabilita se o componente não é válido. 
            component.element.disabled = !component.canAttachFile(component.maxAmountAllowed);
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
        };    

        const isValidComponent = function(component){
            if(component.filesWithError + component.attachmentFiles.length >= component.maxAmountAllowed){                
                return false;
            }
            return true;
        };
    })  
}())