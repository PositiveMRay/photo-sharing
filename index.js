const express = require('express');
const path = require('path');
const async = require('async');
const fs = require('fs');

const app = express();

app.get('/', function (req, res) {
    res.end('Hello World!');
});

app.get('/albums.json', handle_list_albums);
app.get('/albums/:album_name.json', handle_get_album);
app.get('/content/:filename', function(req, res) {
  serve_static_file('content/' + req.params.filename, res);
});
app.get('/templates/:template_name', function(req, res) {
  serve_static_file("templates/" + req.params.template_name, res);
});
app.get('/pages/:page_name', serve_page);
app.get('/pages/:page_name/:sub_page', serve_page);
app.get('*', four_oh_four);

function four_oh_four(req, res) {
  send_failure(res, 404, invalid_resource());
}

function load_album_list(callback) {
  // we will just assume that any diretory in our 'albums'
  // subfolder is an album.
  fs.readdir("albums", (err, files) => {
    if(err) {
      callback(err);
      return;
    }
    
    let only_dirs = [];
    
    let iterator = (index) => {
      if(index == files.length) {
        callback(null, only_dirs);
        return;
      }
      
      fs.stat("albums/" + files[index], (err, stats) => {
        if(err) {
          callback(err);
          return;
        }
        if (stats.isDirectory()) {
          only_dirs.push(files[index]);
        }
        iterator(index + 1);
      });
    }
    iterator(0);
  });
}

function handle_incoming_request(req, res) {
  console.log("INCOMING REQUEST: " + req.method + " " + req.url);
  load_album_list((err, albums) => {
    if(err) {
      res.writeHead(500, {"Content-Type": "application/json"});
      res.end(JSON.stringify(err) + "\n");
      return;
    }
      
    var out = {error: null, data: {albums: albums});
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(out) + "\n");
  });
}

function get_album_name(req) {
  return req.params.album_name;
}

function get_template_name(req) {
  return req.params.template_name;
}

function get_query_params(req) {
  return req.query;
}

function get_page_name(req) {
  return req.params.page_name;
}

app.listen(8080);
