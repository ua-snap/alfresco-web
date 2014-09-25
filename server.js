#!/bin/env node
//  OpenShift sample Node application
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')

var server = express()

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

server.set('views', __dirname + '/views')
server.set('view engine', 'jade')
server.use(express.logger('dev'))
server.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
server.use(express.static(__dirname + '/public'))
server.use(express.bodyParser());

server.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' }
  )
})
server.get('/about', function (req, res) {
  var cp = require("child_process");
  res.render('about',
  { title : 'Home' }
  )
})

var util = require('util');
server.post('/launch', function(req, res){
  	var cp = require("child_process");
	var maxCores = 32;
        var jobTitle = req.body.jobtitle;
        var jobContents = req.body.fif;
	var jobEmail = req.body.email;
	var jobCores = req.body.cores;
	if (jobCores > maxCores){
		jobCores = maxCores;
	}
        cp.exec("echo " + jobContents + " > jobs/" + jobTitle + ".json");
	var sbatchFile = "";
	sbatchFile += "#SBATCH --ntasks=" + jobCores + "\n";
	sbatchFile += "#SBATCH --account=snap\n";
	sbatchFile += "#SBATCH -p main\n\n";
	sbatchFile += "mpirun -np 100 fresco-mpi --fif " + jobContents + ".json --debug --nostats\n\n";
	sbatchFile += "sbatch CompileData.slurm\n\n";

        cp.exec("echo '" + sbatchFile + "'  > jobs/" + jobTitle + "_run.slurm");
	cp.exec("ssh atlas 'mkdir ~/alfjobs/" + jobTitle + "'");
	cp.exec("scp jobs/" + jobTitle + "_run.slurm jobs/" + jobTitle + ".json atlas:~/alfjobs/" + jobTitle);
	res.render('launched', {job: jobTitle, email: jobEmail, fif: jobContents, cores: jobCores})
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080  
, ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
server.listen(port, ip);
