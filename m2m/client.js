const { Client } = require('m2m');

const client = new Client({name:'Client Demo', location:'Anywhere', description:'m2m websocket application integration'});

client.connect('https://www.node-m2m.com');

module.exports = client;

  
