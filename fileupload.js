"use strict";
(function($){
    function Fileupload(element,options){
        this.element = element;
        this.options = options;

        this.init().initializeEvents();
    };

    /* public methods */
    Fileupload.prototype = {
        init : function(){
            this.attachmentFiles = [];
            this.filesWithError = 0;
            this.maxSizeAllowed = this.options.maxSize ? parseInt(this.options.maxSize) : 3; //in MB , default 3MB
            this.maxAmountAllowed = this.options.amount ? parseInt(this.options.amount) : 3; // default 3 arquivos
            this.validFormats = ["image/jpeg","image/gif","image/png","application/pdf"];
            this.imageFormats = ["image/jpeg","image/gif","image/png"];
            this.idItemKey = 0;
            this.valid = false;

            return this;            
        },

        initializeEvents : function(){
            this.setTemplateItem();            
        },

        setTemplateItem: function(){
            this.templateItem = document.getElementById(this.options.idTemplate).textContent;
        },

        build: function(event){            
            const self = this, filesAttached = self.element.files; 
                
            if(filesAttached){                
                for(let property in filesAttached){
                    if(property && isNaN(property)){
                        continue;
                    }
                    
                    //se obtem o arquivo anexado e sua informacao         
                    const fileAttached = filesAttached[property];
                    
                    //adicionamos uma nova propiedade ao objeto file com o peso formatado para leitura.
                    fileAttached.formattedSize = calculateFileSize(fileAttached.size);
                    
                    //se valida o tamanho maximo de arquivos permitidos
                    if(!this.canAttachFile(this.maxAmountAllowed)){
                        console.log("o máximo de arquivos que pode anexar é: " + this.maxAmountAllowed);
                        continue;
                    }

                    //validamos se o arquivo anexado já existe na lista de arquivos anexados                     
                    if(this.isAttached(fileAttached.name)){
                        console.log("o arquivo " + fileAttached.name + " já foi anexado.");
                                                
                        //trigger error
                        //this: componente             
                        $(document).trigger("repeatedItem.ps.fileUpload",[fileAttached,this]);
                        continue;
                    }

                    //validamos se o arquivo anexado tem o peso permitido.
                    if(!this.isAllowedSize(fileAttached.size)){
                        console.log("o arquivo " + fileAttached.name + " não tem o peso permitido.");                    
                        //adicionamos ao contador de erros
                        this.filesWithError++;

                        //trigger error
                        //this: componente             
                        $(document).trigger("error.ps.fileUpload",["size",fileAttached,this]);
                        continue;
                    }

                    //validamos se o arquivo anexado é do formato permitido.
                    if(!this.isAllowedType(fileAttached.type)){
                        console.log("o arquivo" + fileAttached.name + " não tem o formato permitido.");

                        //adicionamos ao contador de erros
                        this.filesWithError++;

                        //trigger Error
                        //this: componente
                        $(document).trigger("error.ps.fileUpload",["format", fileAttached,this]);
                        continue;
                    }

                    //criamos um identificador inteiro para cada arquivo.
                    const key = this.idItemKey++;
                                                            
                    //adicionamos o arquivo na lista de arquivos anexados
                    this.attachmentFiles.push({key: key, file: fileAttached});
                    
                    //criamos o template do arquivo anexado
                    const templateItem = this.createItem(key,fileAttached);
                                                                                
                    //validamos se o arquivo anexado é uma imagem caso contrario não precisa
                    //o uso do objeto FileReader.renderItem                    
                    if(!this.isImage(fileAttached.type)){
                        this.renderItem(self.options.target,templateItem, this.isPDF(fileAttached.type), fileAttached);                        
                        continue;
                    }

                    //criaçao da imagem do arquivo anexado.                    
                    const fileReader =  new FileReader();

                    fileReader.readAsDataURL(fileAttached);

                    fileReader.onload = function($event){
                        //this.result: src da imagem
                        const image = createImage(this.result);
                        //adicionamos a imagem no template
                        templateItem.querySelector("[data-item-img]").appendChild(image);
                        
                        const optionVisualize = templateItem.querySelector("[data-visualize]");
                        
                        if(optionVisualize){
                            optionVisualize.addEventListener("click",function(){
                                openFileInNewWindow(image,true);
                            })
                        }
                    };

                    this.renderItem(self.options.target,templateItem);
                }
                //limpamos o valor do inputfile utilizado pelo componente ápos de anexar os arquivos.
                this.element.value = "";
                
                //validamos a quantiade de arquivos anexados para habilitar/desabilitar o componente
                this.element.disabled = !this.canAttachFile(this.maxAmountAllowed);

                //se valida se o componente é válido. 
                this.valid = this.isValid();

                //informamos o estado de sucesso ao anexar o arquivo
                //this: componente
                $(document).trigger("sucess.ps.fileUpload",[this]);
            }
        },

        createItem: function(key,itemInfo){
            const templateItem = document.createElement("div"), self = this;
            
            templateItem.innerHTML = this.templateItem;
            templateItem.querySelector("[data-item]").setAttribute("data-item-key", parseInt(key));
            templateItem.querySelector("[data-item-filename]").innerHTML = itemInfo.name;        
            templateItem.querySelector("[data-item-size]").innerHTML = itemInfo.formattedSize.join(" ");

            templateItem.querySelector("[data-delete]").addEventListener("click", function($event){
                self.removeItem(key);
            },false)
            
            return templateItem.children[0] ? templateItem.children[0] : void(0);
        },

        removeItem: function(key){
            const itemKey = parseInt(key);
            const identifierItem = "[data-item-key=" + "'" + itemKey + "'" + "]";
            const idParentItem = "#" + this.options.target;
            const itemList = document.querySelector(idParentItem + " " + identifierItem);

            if(itemList){
                //se apaga o item do DOM.
                itemList.parentElement.removeChild(itemList);

                //se apaga o item da lista de arquivos anexados.
                if(!isNaN(itemKey)){
                    this.attachmentFiles.forEach(function(file,indexFile,arrayFiles){
                        if(file.key == itemKey){
                            arrayFiles.splice(indexFile,1);
                        }
                    })
                }    

                //validamos a quantiade de arquivos anexados para habilitar/desabilitar o componente
                this.element.disabled = !this.canAttachFile(this.maxAmountAllowed);

                //se valida se o componente é válido.
                this.valid = this.isValid();

                $(document).trigger("removeItem.ps.fileUpload",[this]);
            }                     
        },
                
        isAllowedSize: function(filesize){
            const maxSizeinBytes = convertMegabytesToBytes(this.maxSizeAllowed);
            return maxSizeinBytes >= filesize;
        },
        
        isAllowedType: function(typeFile){
            return this.validFormats.some(function(allowedType,index,array){ return allowedType === typeFile});
        },

        isImage: function(typeFile){
            return this.imageFormats.some(function(imageType,index,array){ return imageType === typeFile});
        },

        isPDF: function(typeFile){
            return typeFile == "application/pdf";
        },

        isAttached: function(filename){
            if(this.attachmentFiles.length > 0){
                return this.attachmentFiles.some(function(attachmentFile,index, array){            
                    return attachmentFile.file.name == filename
                });
            }
            return false;
        },
        
        canAttachFile: function(maxAmountAllowedComponent){
            //se valida a quantidade de files anexados e a quantidade de files anexados com erro            
            return this.attachmentFiles.length + this.filesWithError < maxAmountAllowedComponent;
        },

        getAllAttachmentFiles: function(){
            return this.attachmentFiles;
        },

        isValid: function(){
            if(this.filesWithError == 0 && this.attachmentFiles.length >= 1)
                return true;
            return false;
        },
        
        /*
        place : identificador do container onde renderizara o bloco documento anexado
        template : container do documento anexado.
        image: imagem que sera anexada */
        renderItem: function(place,template,isPDF,file){
            
            if(place && template){
                const container = document.getElementById(place);
                                
                if(container){     

                    if(isPDF){
                        //obtemos o selector que tem a classe data-item-img 
                        const containerImage =  template.querySelector("[data-item-img]");
                        
                        //se o container existe
                        if(containerImage)
                            containerImage.classList.add("pdf-file");
                                                
                        if(file){
                            const optionVisualize = template.querySelector("[data-visualize]");

                            if(optionVisualize)
                                optionVisualize.addEventListener("click", function(){                                                                    
                                    createViewerPDF(file);
                                });
                        }                          
                    }

                    //se adiciona o item na lista de files anexados
                    container.appendChild(template);        
                }
            }
            else{
                throw Error("developer precisa especificar o lugar onde renderizará o item.");
            }
        }
    };

    /* private methods */
    function extendDefaults(source, properties) {
        for (let property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    };

    function createImage(srcImage){
        const image = document.createElement("img");
        image.src = srcImage;
        image.classList.add("img-thumb");
        return image;
    };

    function calculateFileSize(size){
        const amountOfBytesInOneKb = 1000, // 1000 bytes = 1KB 
              amountOfBytesInOneMb = 1000000; // 1000000 bytes = 1MB

        if(size >= amountOfBytesInOneMb){
            //size in MB
            return [(size / amountOfBytesInOneMb).toFixed(1), "MB"];
        }else{
            //size in KB
            return [(size / amountOfBytesInOneKb).toFixed(1), "KB"];
        }        
    };

    function openFileInNewWindow(file,isImage){
        if(!file)
            return;
        
        if(isImage){
            const _window = window.open("");
            _window.document.write(file.outerHTML);
            return;
        }

        const _window = window.open("");

        if(_window){
            _window.document.body.style.margin = "0px";
            _window.document.body.appendChild(file);
        }
        else {
            alert("desabilitar o bloqueador de pop-ups para poder visualizar o arquivo pdf selecionado.");
        }
    };

    function convertMegabytesToBytes(sizeInMb){
        return sizeInMb * 1000000;
    };

    function createViewerPDF(attachFile){        
        const fileReader = new FileReader();

        fileReader.onload = function(){
            const typedarray = new Uint8Array(this.result);
            const container = document.createElement("div");
            container.style.backgroundColor = "#ccc";
            container.style.textAlign = "center";

            PDFJS.getDocument(typedarray).then(function(pdf) {                
                      //loop
            for (let i = 1; i <= pdf.numPages; i++) {
                pdf.getPage(i).then(function(page) {
                const scale = 1.5;
                const viewport = page.getViewport(scale);
                const div = document.createElement("div");

                // Set id attribute with page-#{pdf_page_number} format
                div.setAttribute("id", "page-" + (page.pageIndex + 1));

                // This will keep positions of child elements as per our needs
                div.setAttribute("style", "position: relative");

                // Append div within div#container
                container.appendChild(div);
                
                const canvas = document.createElement("canvas");

                div.appendChild(canvas);

                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                // Render PDF page
                page.render(renderContext);                                                     
                })
            }//end for                      
                return;                    
            }).then(function(){                  
                setTimeout(function(){                    
                    openFileInNewWindow(container,false);
                },1000);
            })
        };

        fileReader.readAsArrayBuffer(attachFile);
    };
    
    //engine do fileupload    
    Element.prototype.fileuploadEngine= function(option){
        const _this = this, componentName = "componentAttach", options = extendDefaults({}, _this.dataset);
                
        let data = _this.hasOwnProperty(componentName);
                                         
        if(!data) {
            const fileupload = new Fileupload(_this,options);
            _this[componentName] = fileupload;
        }

        if(option && typeof option === "string") 
            _this[componentName][option]();
    };
    
    //ativando os listeners do componente    
    document.addEventListener("change",function($event){
        const target = $event.target;
        if(target && target.type == "file" && target.hasAttribute("data-fileupload")){
            const _self = target;            
            _self.fileuploadEngine('build');
            return;
        }
    },true);    
}(jQuery))