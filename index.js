(function(){
    document.addEventListener("DOMContentLoaded",function($event){
        console.log("domcontentloaded indexjs sucess");    

        //se cria um escuta para o error do fileUpload
        $(document).on("error.ps.fileUpload",function($event,result){
            const file = result ? result : void(0);
            createFileWithError(file);
        })
    
     //variaveis globais
     const $userTemplate = document.getElementById("data-template-fileUpload").textContent,
           _idSelectorListToRender = "list-preview-files2";
           $previewList = document.getElementById(_idSelectorListToRender);
    
     let idIncrementalError = 0;

     const createFileWithError = function(file){
        if(!file)
            return;
        
        const container = document.createElement("div");
        container.innerHTML = $userTemplate;

        const itemList = container.children[0];

        //criamos um id para o file
        file.IdError = idIncrementalError;

        container.querySelector("[data-item]").setAttribute("data-item-key", "key-error-" +  file.IdError);
        container.querySelector("[data-item-filename]").innerHTML = file.name;        
        container.querySelector("[data-item-size]").innerHTML = file.formattedSize.join(" ");

        container.querySelector("[data-delete]").addEventListener("click", function($event){            
            removeItem(file.IdError);
        },false);

        itemList.classList.add("error-file");

        //se adiciona o file com erro na lista de files.
        $previewList.appendChild(itemList);

        idIncrementalError++;
     };

    const removeItem =  function(key){        
        const itemKey = "key-error-" + key;
        const identifierItem = "[data-item-key=" + "'" + itemKey + "'" + "]";
        const idParentItem = "#" + _idSelectorListToRender;
        const itemList = document.querySelector(idParentItem + " " + identifierItem);

        if(itemList){
            //se apaga o item do DOM.
            itemList.parentElement.removeChild(itemList); 
        }
    };

     const clearFileError = function(idFile){

     }; 

    })  
}())