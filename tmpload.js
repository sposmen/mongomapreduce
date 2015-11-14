/**
 * Created by SPOSMEN on 11/13/15.
 */

process.on("uncaughtException", function (err) {
  console.error((new Date()).toUTCString() + " uncaughtException: " + err.message);
  console.error(err.stack);
  process.exit(1);
});


var path = require('path'),
  fs = require('graceful-fs'),
  Lazy = require('lazy'),
  MongoWritableStream = require('mongo-writable-stream'),
  MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/mongomapreduce';

// Movies insertion

var movieInsertStream = new MongoWritableStream({
  url: url,
  collection: 'movies'
});

var moviesStream = fs.createReadStream(path.join(__dirname, 'data', 'movie_titles.txt'));

new Lazy(moviesStream).lines.forEach(function (row) {
  var rowData = row.toString().split(',');
  movieInsertStream.write({
    id: rowData[0],
    year: rowData[1],
    title: rowData[2]
  });
}).on('pipe', function () {
  movieInsertStream.end();
});

// Ratings insertion

var getTitle = function (movId) {
  return 'mv_' + (new Array(7 - movId.toString().length + 1).join('0')) + movId + '.txt';
};

var processMovie = function (movId, cb) {
  var title = getTitle(movId);

  var movieRankInsertStream = new MongoWritableStream({
    url: url,
    collection: 'movies'
  });

  var movieRankStream = fs.createReadStream(path.join(__dirname, 'data', 'training_set', title));

  var collection = dbConnection.collection("simple_document_insert_collection_no_safe");
  // Insert a single document
  collection.insertOne({hello:'world_no_safe'});

  new Lazy(movieRankStream).lines.map(String).skip(1).forEach(function (row) {

    var rowData = row.split(',');



    movieRankInsertStream.write({
      movieId: movId,
      customerId: rowData[0],
      rating: parseInt(rowData[1]),
      date: new Date(rowData[2])
    });
  }).on('pipe', function () {
    movieRankInsertStream.end();
    cb('MovieID:' + movId + ' ended');
  });
};

var singleThrottler = function (movId) {
  if (movId <= 17770) {
    console.log("Starting with ", movId, ' file.');
    processMovie(movId, function (text) {
      console.log(text);
      singleThrottler(movId++);
    })
  } else {
    console.log("Finished")
  }
};

var dbConnection = null;

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");


  dbConnection = db
  singleThrottler(1);

});;

