# m2m websocket-application demo

![](https://raw.githubusercontent.com/EdoLabs/src2/master/quicktour4.svg?sanitize=true)
[](quicktour.svg)

This is a quick demo on how to integrate *m2m* into your websocket application project.

The demo consists of a simple front-end setup using a browser websocket client and a back-end server using node, ws module and express.

The back-end server can be hosted from any platform - Linux, Windows or Mac. The server acting as *m2m* client will then access and communicate with the remote devices - *device1* and *device2* which are running on their own independent processes.

The remote devices ideally should be a Raspberry Pi device. However, if their are not available, you can just use any computers - Linux or Windows instead.

## Option1 - Remote Devices Setup using Raspberry Pi with Led Actuator
On both devices, install an led actuator on pin 33 and 35.

On device 100, install push-button switches on pin 11 and 13.

#### Remote Device1

##### 1. Create a device project directory and install m2m and array-gpio inside the directory.
```js
$ npm install m2m array-gpio
```
##### 2. Save the code below as device.js in your device project directory.

```js
const { Device } = require('m2m');

let device = new Device(100);

let myData = 'myData';

device.connect('https://dev.node-m2m.com', () => {

  device.setGpio({mode:'input', pin:[11, 13]}, (gpio) => console.log(gpio.pin, gpio.state));
  device.setGpio({mode:'output', pin:[33, 35]});

  device.setData('get-data', (data) => {
    data.send(myData);
  });

  device.setData('send-data', (data) => {
    if(data.payload){
      myData = data.payload;
      data.send(data.payload);
    }
  });

  // error listener
  device.on('error', (err) => console.log('error:', err))
});
```
##### 3. Start your device application.
```js
$ node device.js
```
#### Remote Device2

##### 1. Create a device project directory and install m2m and array-gpio inside the directory.
```js
$ npm install m2m array-gpio
```
##### 2. Save the code below as device.js in your device project directory.

```js
const { Device } = require('m2m');

const device = new Device(200);

device.connect('https://dev.node-m2m.com', () => {
  device.setGpio({mode:'out', pin:[33, 35]}, gpio => console.log(gpio.pin, gpio.state));

  device.setData('random-number', (data) => {
    let r = Math.floor(Math.random() * 100) + 25;
    data.send(r);
    console.log('random', r);
  });
});
```
##### 3. Start your device application.
```js
$ node device.js
```
## Option2 - Remote Devices Setup using Windows or Linux
#### Remote Device1
##### Here, we don't need to install array-gpio instead the gpio output will run in simulation mode.
##### 1. Create a device project directory and install m2m inside the directory.
```js
$ npm install m2m
```
##### 2. Save the code below as device.js in your device project directory.

```js
const { Device } = require('m2m');

let device = new Device(100);

let myData = 'myData';

device.connect('https://dev.node-m2m.com', () => {

  device.setGpio({mode:'input', pin:[11, 13], type:'simulation'}, (gpio) => console.log(gpio.pin,  gpio.state));
  device.setGpio({mode:'output', pin:[33, 35], type:'simulation'});

  device.setData('get-data', (data) => {
    data.send(myData);
  });

  device.setData('send-data', (data) => {
    if(data.payload){
      myData = data.payload;
      data.send(data.payload);
    }
  });

  // error listener
  device.on('error', (err) => console.log('error:', err))
});
```
##### 3. Start your device application.
```js
$ node device.js
```
#### Remote Device2

##### 1. Create a device project directory and install m2m inside the directory.
```js
$ npm install m2m
```
##### 2. Save the code below as device.js in your device project directory.

```js
const { Device } = require('m2m');

const device = new Device(200);

device.connect('https://dev.node-m2m.com', () => {
  device.setGpio({mode:'out', pin:[33, 35], type:'simulation'}, gpio => console.log(gpio.pin, gpio.state));

  device.setData('random-number', (data) => {
    let r = Math.floor(Math.random() * 100) + 25;
    data.send(r);
    console.log('random', r);
  });
});
```
##### 3. Start your device application.
```js
$ node device.js
```

## Websocket Application Setup

##### 1. Download the *m2m-websocket-application-demo* project from *GitHub*.
```js
$ git clone https://github.com/EdAlegrid/m2m-websocket-application-demo.git
```
##### 2. Install all node dependencies inside *m2m-websocket-application-demo* directory.
```js
$ cd m2m-websocket-application-demo
```
```js
$ npm install
```
##### 3. Start the web application server.
```js
$ node wsServer
```
##### 4. Open a browser tab.
`http://127.0.0.1:5000`

The websocket application page should show the various sections with control buttons to try out how *m2m* communicates with the remote devices to control gpio outputs and access data using websocket.
