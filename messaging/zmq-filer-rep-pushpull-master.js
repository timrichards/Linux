'use strict';

const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq'),
  meout = module.filename.substring(module.filename.lastIndexOf('/') + 1) + ' SEZ: ';

let nReady = 0;
const nREADYSET = 3;

function log(str)
{
  console.log(meout + str);
}

if (cluster.isMaster)
{
  const
    pusher = zmq.socket('push').bind('ipc://from_master.ipc'),
    puller = zmq.socket('pull').bind('ipc://to_master.ipc');
  
  // fork some worker processes
  for (let i = 0; i < nREADYSET; i++)
  {
    cluster.fork();
  }

  puller.on('message', function(data)
  {
    let job = null;
    
    try
    {
      job = JSON.parse(data.toString());
    }
    catch (er)
    {
      log("Threw puller.on; data = " + data);
      throw er;
    }

    if ((nReady < nREADYSET) && job.ready)
    {
      ++nReady;
      console.log("Ready:", nReady);
      
      if (nReady >= nREADYSET)
      {
        const nJOBS = 30;
        
        // wait until pullers are connected and ready, then send 30 jobs ...
        console.log("sending " + nJOBS + " jobs.");
  
        for (let i = 0; i < nJOBS; i++)
        {
          pusher.send(JSON.stringify(
          {
            id : i
          }));
        }
      }
    }
    else
    {
      // do the work described in the job
    }
    
    log('puller message: ' + data.toString());
  });
    
  // listen for workers to come online
  cluster.on('online', function(worker)
  {
    log('Worker ' + worker.process.pid + ' is online.');
  });
  
  // close the responder when the Node process ends
  process.on('exit', function()
  {
    log('Shutting down...');
    cluster.disconnect();
    responder.close();
  });

  cluster.on('disconnect', function(worker)
  {
    log('Worker ' + worker.process.pid + ' has disconnected');
  });

//  process.on('uncaughtException', function(err)
//  {
//    log('Caught exception: ' + err);
//  });
}
else    // WORKER -------------------------------
{
  log(process.pid + ' worker code reached.');
  
  const
    zmq = require('zmq'),
    puller = zmq.socket('pull').connect('ipc://from_master.ipc'),
    pusher = zmq.socket('push').connect('ipc://to_master.ipc');

  function send(obj)
  {
  //  pusher.send(JSON.stringify({ process.pid, obj }));
  }

  puller.on("message", function(data)
  {
    let job = JSON.parse(data.toString());

    console.log(process.pid + " Received pull:", job);
    pusher.send(JSON.stringify({
      pid: process.pid,
      job: job
    }));
  });

  pusher.send('{"ready":true}');
}

