// const { QueryTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const csv = require('csv-parser');
// const path = require('path');
// const fs = require('fs');
// const { sendSSE } = require('./ssehandle');

// const productinsert = async (req, res) => {
//   const vendor = req.body.vendor;
//   if (!vendor) {
//     return res.status(400).json({ error: 'Vendor not found' });
//   }

//   const filePath = path.join(__dirname, '..', 'vendors', vendor, `${vendor}.csv`);
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: 'CSV file not found' });
//   }

//   const results = [];
//   let successCount = 0;
//   let failureCount = 0;
//   let skippedCount = 0;

//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', async () => {
//       try {
//         for (const [index, row] of results.entries()) {
//           try {
//             const existingProducts = await sequelize.query(
//               'SELECT * FROM product WHERE product_id = ?',
//               { replacements: [row.product_id], type: QueryTypes.SELECT }
//             );

//             await new Promise(resolve => setTimeout(resolve, index * 1000)); // Introduce delay

//             if (existingProducts.length > 0) {
//               const existing = existingProducts[0];
//               const existingPrice = parseFloat(existing.price).toFixed(2);
//               const newPrice = parseFloat(row.price).toFixed(2);
//               const existingQuantity = parseInt(existing.quantity, 10);
//               const newQuantity = parseInt(row.quantity, 10);

//               if (existingPrice !== newPrice || existingQuantity !== newQuantity) {
//                 await sequelize.query(
//                   'UPDATE product SET product_name = ?, quantity = ?, price = ? WHERE product_id = ?',
//                   { replacements: [row.product_name, row.quantity, row.price, row.product_id], type: QueryTypes.UPDATE }
//                 );
//                 successCount++;
//                 sendSSE({ message: `Product ${row.product_id} updated successfully`, type: 'update' });
//               } else {
//                 skippedCount++;
//                 sendSSE({ message: `Product ${row.product_id} skipped`, type: 'skip' });
//               }
//             } else {
//               await sequelize.query(
//                 'INSERT INTO product (product_id, product_name, quantity, price) VALUES (?, ?, ?, ?)',
//                 { replacements: [row.product_id, row.product_name, row.quantity, row.price], type: QueryTypes.INSERT }
//               );
//               successCount++;
//               sendSSE({ message: `Product ${row.product_id} inserted successfully`, type: 'insert' });
//             }
//           } catch (error) {
//             failureCount++;
//             sendSSE({ message: `Product ${row.product_id} failed to process: ${error.message}`, type: 'fail' });
//           }
//         }

//         const fileStatus = failureCount > 0 ? 'fail' : 'success';

//         const existingLog = await sequelize.query(
//           'SELECT * FROM log_status WHERE vendor_name = ?',
//           { replacements: [vendor], type: QueryTypes.SELECT }
//         );

//         if (existingLog.length > 0) {
//           await sequelize.query(
//             'UPDATE log_status SET success = ?, failure = ?, skipped = ?, file_status = ?, created_at = ? WHERE vendor_name = ?',
//             {
//               replacements: [
//                 successCount,
//                 failureCount,
//                 skippedCount,
//                 fileStatus,
//                 new Date(),
//                 vendor
//               ],
//               type: QueryTypes.UPDATE
//             }
//           );
//         } else {
//           await sequelize.query(
//             'INSERT INTO log_status (success, failure, skipped, file_status, created_at, vendor_name) VALUES (?, ?, ?, ?, ?, ?)',
//             {
//               replacements: [
//                 successCount,
//                 failureCount,
//                 skippedCount,
//                 fileStatus,
//                 new Date(),
//                 vendor
//               ],
//               type: QueryTypes.INSERT
//             }
//           );
//         }

//         res.status(200).json({ message: "Product processing completed successfully" });
//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal server error" });
//       }
//     });
// };

// module.exports = productinsert;

// const { QueryTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const {parentPort,workerData} = require("worker_threads");

const { Worker } = require('worker_threads');
const path = require('path');
const { eventEmitter } = require('./ssehandle'); 

const productinsert = (req, res) => {
  const vendor = req.body.vendor;
  if (!vendor) {
    return res.status(400).json({ error: 'Vendor not found' });
  }

  const worker = new Worker(path.join(__dirname, 'productWorker.js'), {
    workerData: { vendor }
  });

  let responseSent = false;

  worker.on('message', (message) => {
    if (message.error) {
      console.error(message.error);
      if (!responseSent) {
        res.status(500).json({ error: 'Internal server error' });
        responseSent = true;
      }
    } else {
      eventEmitter.emit('message', message.data, message.vendor);
    }
  });

  worker.on('error', (error) => {
    console.error(error);
    if (!responseSent) {
      res.status(500).json({ error: 'Internal server error' });
      responseSent = true;
    }
  });

  worker.on('exit', (code) => {
    if (!responseSent) {
      if (code !== 0) {
        res.status(500).json({ error: `Worker stopped with exit code ${code}` });
      } else {
        res.status(200).json({ message: 'Product processing completed successfully' });
      }
      responseSent = true;
    }
  });
};

module.exports = productinsert;
