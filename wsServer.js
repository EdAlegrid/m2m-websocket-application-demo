const { parse } = require('url');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const express = require('express');
const app = express();

app.use(express.static('public'));

let watchDataWs = null;
let watchInputWs = null;

const server = createServer(app);
const wss1 = new WebSocketServer({ noServer: true });
const wss2 = new WebSocketServer({ noServer: true });

var client = require('./m2m/client.js');

wss1.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('wss1 /device1 received: %s', data);
    try{
      let pl = JSON.parse(data);
      console.log('wss1 pl', pl);
      if(Array.isArray(pl.id) && Array.isArray(pl.pin)){
        if(pl.state){ 
          pl.id.forEach((id) => {
            console.log('id', id); 
            pl.pin.forEach((pin) => {
              client.output(id, pin).on();
              ws.send(JSON.stringify(pl));
            });
          });
        }  
        else{
          pl.id.forEach((id)=> {
            pl.pin.forEach((pin) => {
              client.output(id, pin).off();
              ws.send(JSON.stringify(pl));
            });
          });
        }
        return;
      }
      else if(pl.getState){
        client.input(pl.id, pl.pin).getState((state) => {
          console.log('getState', state);
          pl.state = state;
          ws.send(JSON.stringify(pl));
        });
      }
      else if(pl.watch){
        watchInputWs = ws; // persist ws connection during index.html page loading
        client.input(pl.id, pl.pin).watch((state) => {
          console.log('watch', state);
          pl.state = state;
          watchInputWs.send(JSON.stringify(pl));
        });
      }
      else if(pl.unwatch){
        client.input(pl.id, pl.pin).unwatch((state) => {
          console.log('unwatch', state);
          pl.state = state;
          ws.send(JSON.stringify(pl));
        });
      }
      else if(pl.state){
        client.output(pl.id, pl.pin).on((state) => {
          pl.state = state;
          ws.send(JSON.stringify(pl));
        });
      }
      else{
        client.output(pl.id, pl.pin).off((state) => {
          pl.state = state;
          ws.send(JSON.stringify(pl));
        });
      }
    }
    catch(e){
      console.log('wss1 connection error', e);
    }
  });
});

wss2.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('wss2 /device2 received: %s', data);
    try{
      let pl = JSON.parse(data);
      console.log('wws2 pl', pl);
      if(pl.method === 'getData' && pl.channel){
        client.getData(pl.id, pl.channel, (data) => {
          console.log('getData', data);
          pl.data = data;
          ws.send(JSON.stringify(pl));
        });
      }
      else if(pl.method === 'watchData' && pl.channel){
        watchDataWs = ws; // persist ws connection during index.html page loading
        client.watch(pl.id, pl.channel, (data) => {
          console.log('watchdata', data);
          pl.data = data;
          watchDataWs.send(JSON.stringify(pl));
        });
      }
      else if(pl.method === 'unwatchData' && pl.channel){
        client.unwatch(pl.id, pl.channel, (data) => {
          console.log('unwatchdata', data);
          pl.data = data;
          ws.send(JSON.stringify(pl));
        });
      }
      else if(pl.method === 'sendData' && pl.payload){
        client.sendData(pl.id, pl.channel, pl.payload, (data) => {
          console.log('sendData', data);
          pl.data = data;
          ws.send(JSON.stringify(pl));
        });
      }
    }
    catch(e){
      console.log('wss2 connection error', e);
    }
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  if (pathname === '/demo1') {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
  } else if (pathname === '/demo2') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(5000);
console.log('websocket server listening on port 5000');
