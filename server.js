#!/bin/env node
//  OpenShift sample Node application
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , proj4 = require('proj4')

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
	var alfJobDir = "/big_scratch/apbennett/alfjobs/";
	var alfrescoPath = "/home/UA/apbennett/test";
	var jsonCppPath = "/home/UA/apbennett";
	var openMPIPath = "/usr/lib64/openmpi";

	if (jobCores > maxCores){
		jobCores = maxCores;
	}
	cp.exec("mkdir jobs/" + jobTitle);
        cp.exec("echo '" + jobContents.replace(/\r?\n/g, '\n') + "' > jobs/" + jobTitle + "/" + jobTitle + ".json");
	//Create Run file for SLURM
	var sbatchFile = "";
	sbatchFile += "#!/bin/bash\n\n";
	sbatchFile += "#SBATCH --ntasks=" + jobCores + "\n";
	sbatchFile += "#SBATCH --account=snap\n";
	sbatchFile += "#SBATCH -p main\n\n";
	sbatchFile += "#SBATCH --mail-type=ALL\n\n";
	sbatchFile += "#SBATCH --mail-user=" + jobEmail + "\n\n";
	sbatchFile += "export PATH=" + alfrescoPath + "/bin:" + jsonCppPath + "/bin:" + openMPIPath + "/bin:${PATH}\n";
	sbatchFile += "export LD_LIBRARY_PATH=" + alfrescoPath + "/lib:" + jsonCppPath + "/lib:" + openMPIPath + "/lib:${LD_LIBRARY_PATH}\n";
	sbatchFile += "mpirun -np 100 fresco-mpi --fif " + jobTitle + ".json --debug --nostats\n\n";
	sbatchFile += "sbatch " + jobTitle + "_post.slurm\n\n";
        cp.exec("echo '" + sbatchFile + "'  > jobs/" + jobTitle + "/" + jobTitle + "_run.slurm");
	//Create PostProc File for SLURM
	var postProcFile = "";
	postProcFile += "#!/bin/bash\n\n";
	postProcFile += "#SBATCH --ntasks=" + jobCores + "\n";
	postProcFile += "#SBATCH --account=snap\n";
	postProcFile += "#SBATCH -p main\n\n";
	postProcFile += "cp ~/alfresco-calibration/ALFRESCO_CompileData_PlotData_procedure.r .\n";
	postProcFile += "perl -pi -e \"s/rep_list.*/rep_list <- 0:" + (jobCores - 1) + "/\" ALFRESCO_CompileData_PlotData_procedure.r\n";
	postProcFile += "Rscript ALFRESCO_CompileData_PlotData_procedure.r\n";
	postProcFile += "tar -czf output_stats.tgz output_stats\n";
	postProcFile += "~/alfresco-calibration/mailPNGs.sh\n";
        cp.exec("echo '" + postProcFile + "'  > jobs/" + jobTitle + "/" + jobTitle + "_post.slurm");

	cp.exec("scp -r jobs/" + jobTitle + " atlas:" + alfJobDir);
        cp.exec("ssh atlas 'cd " + alfJobDir + jobTitle + "; sbatch " + jobTitle + "_run.slurm'");


	res.render('launched', {job: jobTitle, email: jobEmail, fif: jobContents, cores: jobCores})
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080  
, ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
server.listen(port, ip);
