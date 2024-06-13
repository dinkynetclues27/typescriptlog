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
