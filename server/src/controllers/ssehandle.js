const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

let clients = [];

const sendSSE = (data) => {
  console.log('Sending SSE:', data);
  clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
};

const sseHandler = (req, res) => {
  const vendor = req.query.vendor;
  console.log('SSE client connected', vendor);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write(': ping\n\n');

  const clientId = Date.now();
  const newClient = { id: clientId, res, vendor };
  clients.push(newClient);

  const message = (data, vendormsg) => {
    if (vendormsg === vendor) {
      const client = clients.find(c => c.vendor === vendor);
      if (client) {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    }
  };

  eventEmitter.on('message', message);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
    eventEmitter.off('message', message);
  });
};

module.exports = {sseHandler,eventEmitter,sendSSE}