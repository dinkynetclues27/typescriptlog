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

//if i m selecting vendor from dropdown it is showing me vendor name with view button right. this way multiple vendor are showing on selecting right.now what i want to do is if i click on view then log of that particular person should only show and when i click on another view then log of that vendor should only show . if i m parallely starting two views then it is mixing logs in one another also if possible open different section for every vendors view seleccted and only that person log should be shown in their own view