var fs = require("fs");
const path = require('path');
   
const folder = path.join(__dirname,'..','vendors');
const getvendorlist = (req,res)=>{
    try{
        var result = [];
        const folders = fs.readdirSync(folder);
        // console.log(folders)
         folders.forEach(fold=>{
         result.push(fold);
            // console.log(result);
               });
        res.json(result);
    }
    catch{
            console.log("error")
    }

}

module.exports = getvendorlist;

