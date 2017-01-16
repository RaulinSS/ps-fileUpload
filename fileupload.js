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
            this.maxSizeAllowed = this.options.maxSize ? parseInt(this.options.maxSize) : 3; //in MB , default 3MB
            this.maxAmountAllowed = this.options.amount ? parseInt(this.options.amount) : 3; // default 3 arquivos
            this.validFormats = ["image/jpeg","image/gif","image/png","application/pdf"];
            this.imageFormats = ["image/jpeg","image/gif","image/png"];
            this.idItemKey = 0;

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
                    
                    //se valida o tamanho maximo de arquivos permitidos
                    if(!this.canAttachFile(this.maxAmountAllowed)){                    
                        console.log("o máximo de arquivos que pode anexar é: " + this.maxAmountAllowed);
                        continue;
                    }

                    //validamos se o arquivo anexado tem o peso permitido.
                    if(!this.isAllowedSize(fileAttached.size)){
                        console.log("o arquivo " + fileAttached.name + " não tem o peso permitido.");

                        //trigger Error
                        $(document).trigger("error.ps.fileUpload",[fileAttached]);

                        continue;
                    }

                    //validamos se o arquivo anexado é do tipo permitido.
                    if(!this.isAllowedType(fileAttached.type)){
                        console.log("o arquivo" + fileAttached.name + " não tem o formato permitido.");

                        //trigger Error
                        $(document).trigger("error.ps.fileUpload",[fileAttached]);

                        continue;
                    }

                    //criamos um identificador inteiro para cada arquivo.
                    const key = this.idItemKey++;
                                        
                    //adicionamos o arquivo na lista de arquivos anexados
                    this.attachmentFiles.push({key : key, file : fileAttached});

                    //criamos o template do arquivo anexado
                    const templateItem = this.createItem(key,fileAttached);
                                                                                
                    //validamos se o arquivo anexado é uma imagem caso contrario não precisa
                    //o uso do objeto FileReader.
                    if(!this.isImage(fileAttached.type)){
                        this.renderItem(self.options.target,templateItem, this.isPDF(fileAttached.type));
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
                    };

                    this.renderItem(self.options.target,templateItem)
                }
            }
        },

        createItem: function(key,itemInfo){
            const templateItem = document.createElement("div"), self = this;
            
            templateItem.innerHTML = this.templateItem;
            templateItem.querySelector("[data-item]").setAttribute("data-item-key", parseInt(key));
            templateItem.querySelector("[data-item-filename]").innerHTML = itemInfo.name;
            templateItem.querySelector("[data-item-size]").innerHTML = calculateFileSize(itemInfo.size).join(" ");

            templateItem.querySelector("[data-delete]").addEventListener("click", function($event){
                self.removeItem(key);
            },false)
            
            return templateItem.children[0] ? templateItem.children[0] : void(0);
        },

        removeItem: function(key){
            const itemKey = parseInt(key);
            const identifierItem = "[data-item-key=" + "'" + key + "'" + "]";
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
            }                     
        },
        
        isAllowedSize : function(filesize){
            const maxSizeinBytes = convertMegabytesToBytes(this.maxSizeAllowed);
            return maxSizeinBytes >= filesize;
        },
        
        isAllowedType : function(typeFile){
            return this.validFormats.some(function(allowedType,index,array){ return allowedType === typeFile});
        },

        isImage : function(typeFile){
            return this.imageFormats.some(function(imageType,index,array){ return imageType === typeFile});
        },

        isPDF : function(typeFile){
            return typeFile == "application/pdf";
        },
        
        canAttachFile : function(maxAmountAllowedComponent){
            return this.attachmentFiles.length < maxAmountAllowedComponent
        },

        getAllAttachmentFiles : function(){
            return this.attachmentFiles;
        },
        
        /*
        place : identificador do container onde renderizara o bloco documento anexado
        template : container do documento anexado.
        image: imagem que sera anexada */
        renderItem: function(place,template,isPDF){
            
            if(place && template){
                const container = document.getElementById(place);
                                
                if(container){     

                    if(isPDF){
                        //obtemos o selector que tem a classe data-item-img 
                        const containerImage =  template.querySelector("[data-item-img]");
                        
                        //se o container existe
                        if(containerImage)
                            containerImage.classList.add("pdf-file");
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

    function convertMegabytesToBytes(sizeInMb){
        return sizeInMb * 1000000;
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
            console.log("init dentro do click do file ....");
            _self.fileuploadEngine('build');
            return;
        }
    },true);    
}(jQuery))