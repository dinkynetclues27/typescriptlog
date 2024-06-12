const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');


const filesuccess = async(req,res) =>{
    try{
        
       const success =  await sequelize.query(`Select * from log_status where file_status="success"`,{type:QueryTypes.SELECT});
       res.json(success);
    }
    catch(error){
        console.error("Error fetching success file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

module.exports = filesuccess;