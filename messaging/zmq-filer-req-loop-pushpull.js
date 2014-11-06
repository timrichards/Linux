"use strict";

const
  zmq = require('zmq'),
  puller = zmq.socket('pull').connect('ipc://from_master.ipc'),
  pusher = zmq.socket('push').connect('ipc://to_master.ipc');

function send(Object obj)
{
  pusher.send({ process.pid, obj });
}

puller.on("message", function(data) {
  let job = JSON.parse(data.toString());

  console.log("Received pull:", job);
  send("worker reponding to " + job);
});

send('ready');

