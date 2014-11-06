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
  fs = require('fs'),
  file = require('file'),
  rdfParser = require('./lib/rdf-parser.js');

console.log('beginning directory walk');

let sPath = __dirname + '/cache';
sPath = fs.readlinkSync(sPath) || sPath;

file.walk(sPath, function(err, dirPath, dirs, files){
  if (err)
  {
    console.log("SEZ err: " + err);
    return;
  }
  files.forEach(function(path){
    rdfParser(path, function(err, doc) {
      if (err) {
        throw err;
      } else {
        console.log(doc);
      }
    });
  });
});


