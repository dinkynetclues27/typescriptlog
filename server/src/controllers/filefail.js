const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');


const filefail = async(req,res) =>{
    try{
        
       const fail =  await sequelize.query(`Select * from log_status where file_status="fail"`,{type:QueryTypes.SELECT});
       res.json(fail);
    }
    catch(error){
        console.error("Error fetching success file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

module.exports = filefail;