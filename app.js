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
	var maxCores = 32;
        var jobTitle = req.body.jobtitle;
        var jobContents = req.body.fif;
	var jobEmail = req.body.email;
	var jobCores = req.body.cores;
	if (jobCores > maxCores){
		jobCores = maxCores;
	}
        cp.exec("touch jobs/" + jobTitle + ".json");
        cp.exec("echo " + jobContents + " >> jobs/" + jobTitle + ".json");
        cp.exec("touch jobs/" + jobTitle + "_run.slurm");
	var sbatchFile = "";
	sbatchFile += "#SBATCH --ntasks=" + jobCores + "\n";
	sbatchFile += "#SBATCH --account=snap\n";
	sbatchFile += "#SBATCH -p main\n\n";
	sbatchFile += "mpirun -np 100 fresco-mpi --fif " + jobContents + ".json --debug --nostats\n";
	//sbatchFile += "sbatch " + jobPostScript;

        cp.exec("echo '" + sbatchFile + "'  >> jobs/" + jobTitle + "_run.slurm");
        //var sbatch_command = 'sbatch fresco-mpi --fif ' + jobTitle;
	res.render('launched', {job: jobTitle, email: jobEmail, fif: jobContents, cores: jobCores})
});

app.listen(3000)
