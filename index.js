(function(){
    document.addEventListener("DOMContentLoaded",function($event){
        console.log("domcontentloaded indexjs sucess");    

        //se cria um escuta para o error do fileUpload
        $(document).on("error.ps.fileUpload",function($event,result){
            debugger;
            console.log("result",result);
        })
    })
}())