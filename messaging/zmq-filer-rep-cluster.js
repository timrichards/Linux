/***
 * Excerpted from "Node.js the Right Way",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material, 
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose. 
 * Visit http://www.pragmaticprogrammer.com/titles/jwnode for more book information.
***/
'use strict';
const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq'),
  meout = module.filename.substring(module.filename.lastIndexOf('/') + 1) + ' SEZ: ';

function log(str)
{
  console.log(meout + str);
}

if (cluster.isMaster) {
  
  // master process - create ROUTER and DEALER sockets, bind endpoints
  const
    router = zmq.socket('router').bind('tcp://127.0.0.1:5433'), 
    dealer = zmq.socket('dealer').bind('ipc://filer-dealer.ipc'); 
  
  // forward messages between router and dealer
  router.on('message', function() {
    const frames = Array.prototype.slice.call(arguments);
    dealer.send(frames);
  log('router message: ' + frames);
  });
  
  dealer.on('message', function() {
    const frames = Array.prototype.slice.call(arguments);
    router.send(frames);
  log('dealer message: ' + frames);
  });
  
  // listen for workers to come online
  cluster.on('online', function(worker) {
    log('Worker ' + worker.process.pid + ' is online.');
  });
  
// close the responder when the Node process ends
process.on('exit', function() {
  log('Shutting down...');
cluster.disconnect();
  responder.close();
});

cluster.on('disconnect', function(worker) {
  log('Worker ' + worker.process.pid + ' has disconnected');
});

process.on('uncaughtException', function(err) {
  log('Caught exception: ' + err);
});

  // fork three worker processes
  for (let i = 0; i < 3; i++) {
    cluster.fork();
  }
  
} else {
      log(process.pid + ' worker');
  
  // worker process - create REP socket, connect to DEALER
  const responder = zmq.socket('rep').connect('ipc://filer-dealer.ipc');
  
  responder.on('message', function(data) {
      log(process.pid + ' message');
    
    // parse incoming message
    const request = JSON.parse(data);
    log(process.pid + ' received request for: ' + request.path);
    
const responderSend = (function(err, data) {
{
      log(process.pid + ' sending response');
      responder.send(JSON.stringify({
        pid: process.pid,
	err: err,
        data: data ? data.toString() : data,
        timestamp: Date.now()
      }));
}
    });

if (typeof request.path !== "string")
{
  responderSend(meout + "ERR path is not a string: " + request.path);  
}
else
{
    // read file and reply with content
    fs.readFile(request.path, responderSend);
}      
  });
}

