/*
 * * Module dependencies
 * */
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')


var app = express()

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))
app.use(express.bodyParser());

app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' }
  )
})
app.get('/about', function (req, res) {
  var cp = require("child_process");
  res.render('about',
  { title : 'Home' }
  )
})

var util = require('util');
app.post('/launch', function(req, res){
  	var cp = require("child_process");
        var jobTitle = req.body.jobtitle;
        var jobContents = req.body.fif;
	var jobEmail = req.body.email;
        cp.exec("jobs/touch " + jobTitle + ".json");
        cp.exec("echo " + jobContents + " >> jobs/" + jobTitle + ".json");
        //var sbatch_command = 'sbatch fresco-mpi --fif ' + jobTitle;
	res.render('launched', {job: jobTitle, email: jobEmail})
});

app.listen(3000)
