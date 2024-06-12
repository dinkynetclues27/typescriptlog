const { parentPort, workerData } = require('worker_threads');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const sendSSE = (data, vendor) => {
  parentPort.postMessage({ data, vendor });
};

const processVendorFile = async ({ vendor }) => {
  const filePath = path.join(__dirname, '..', 'vendors', vendor, `${vendor}.csv`);
  if (!fs.existsSync(filePath)) {
    sendSSE({ error: 'CSV file not found' }, vendor);
    return;
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const logPromises = results.map((row, index) => new Promise(async (resolve, reject) => {
          try {
            const existingProducts = await sequelize.query(
              'SELECT * FROM product WHERE product_id = ?',
              { replacements: [row.product_id], type: QueryTypes.SELECT }
            );

            setTimeout(async () => {
              if (existingProducts.length > 0) {
                const existing = existingProducts[0];

                const existingPrice = parseFloat(existing.price).toFixed(2);
                const newPrice = parseFloat(row.price).toFixed(2);
                const existingQuantity = parseInt(existing.quantity, 10);
                const newQuantity = parseInt(row.quantity, 10);

                if (existingPrice !== newPrice || existingQuantity !== newQuantity) {
                  await sequelize.query(
                    'UPDATE product SET product_name = ?, quantity = ?, price = ? WHERE product_id = ?',
                    { replacements: [row.product_name, row.quantity, row.price, row.product_id], type: QueryTypes.UPDATE }
                  );
                  successCount++;
                  sendSSE({ message: `Product ${row.product_id} updated successfully `, type: 'update' }, vendor);
                } else {
                  skippedCount++;
                  sendSSE({ message: `Product ${row.product_id} skipped `, type: 'skip' }, vendor);
                }
              } else {
                await sequelize.query(
                  'INSERT INTO product (product_id, product_name, quantity, price) VALUES (?, ?, ?, ?)',
                  { replacements: [row.product_id, row.product_name, row.quantity, row.price], type: QueryTypes.INSERT }
                );
                successCount++;
                sendSSE({ message: `Product ${row.product_id} inserted successfully`, type: 'insert' }, vendor);
              }
              resolve();
            }, index * 1000);
          } catch (error) {
            failureCount++;
            sendSSE({ message: `Product ${row.product_id} failed to process: ${error.message}`, type: 'fail' }, vendor);
            resolve();
          }
        }));

        await Promise.all(logPromises);

        const fileStatus = failureCount > 0 ? 'fail' : 'success';

        const existingLog = await sequelize.query(
          'SELECT * FROM log_status WHERE vendor_name = ?',
          { replacements: [vendor], type: QueryTypes.SELECT }
        );

        if (existingLog.length > 0) {
          await sequelize.query(
            'UPDATE log_status SET success = ?, failure = ?, skipped = ?, file_status = ?, created_at = ? WHERE vendor_name = ?',
            {
              replacements: [
                successCount,
                failureCount,
                skippedCount,
                fileStatus,
                new Date(),
                vendor
              ],
              type: QueryTypes.UPDATE
            }
          );
        } else {
          await sequelize.query(
            'INSERT INTO log_status (success, failure, skipped, file_status, created_at, vendor_name) VALUES (?, ?, ?, ?, ?, ?)',
            {
              replacements: [
                successCount,
                failureCount,
                skippedCount,
                fileStatus,
                new Date(),
                vendor
              ],
              type: QueryTypes.INSERT
            }
          );
        }

        sendSSE({ message: "Product processing completed successfully" }, vendor);
      } catch (error) {
        console.log(error);
        sendSSE({ error: "Internal server error" }, vendor);
      }
    });
};

processVendorFile(workerData);
