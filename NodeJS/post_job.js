/*
 *
 *  Post-job script for Templater
 *  Copyright (c) Dataclay LLC 2016
 *  MIT License
 *
 *  Concatenate via ffmpeg.  Call this from a Windows Batch File
 *
 *  From templater, use the following command line
 *  to call this script directly after Templater
 *  processes a job
 *
 *  node post_job.js --data $data_job --aedir $aep_dir --outfile $out_file
 *
 *
 */

//Required NodeJS Modules
var os       = require('os'),
    fs       = require('fs'),
    fse      = require('fs-extra'),
    util     = require('util'),
    path     = require('path'),
    moment   = require('moment'),
    argv     = require('minimist')(process.argv.slice(2));

var logfile  = "templater-post-job.log",
    job_data = require(argv.data);
    proj     = path.resolve(argv.aedir),
    log      = path.join(os.tmpdir(), logfile),
    log_dest = path.join(proj, "templater-post-job.log"),
    msg      = msg  = "\r\n------------ [TEMPLATER JOB] -----------\r\n";


//Design the output for the post job log
msg += "\r\nJob completed processing on\r\n    > " + moment().format('MMMM Do YYYY, h:mm:ss a');
msg += "\r\n\r\nFinished processing project\r\n    > " + argv.aefile;
msg += "\r\n\r\nProject directory\r\n    > " + proj;
msg += "\r\n\r\nOutput directory\r\n    > " + argv.outdir;
msg += "\r\n\r\nOutput asset\r\n    > " + argv.outfile;
msg += "\r\n\r\nTitle\r\n    > " + argv._[0];
msg += "\r\n\r\nData set\r\n    > " + JSON.stringify(job_data, null, 4).replace(/(?:\r\n|\r|\n)/g, "\r\n    ");
msg += "\r\n\r\n"


//Append to log and copy log to project directory.
//NOTE:  On Windows, NodeJS cannot append to files that
//       exist on a mapped network drive.  First we
//       append a local file in the temp directory, then
//       copy it to the project directory

try {
    fs.appendFileSync(log, msg, 'utf8');
    fse.copySync(log, log_dest);
} catch (err) {
    console.error(err.message);
    fs.appendFileSync("\r\nError : " + err.message);
}
