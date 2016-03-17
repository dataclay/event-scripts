/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

Log each Templater versioning job to a file
Copyright (c) Dataclay LLC 2016
MIT License

You must enter `npm install` to install all dependency modules used in
this script.  All modules are listed in the package.json file in the
root of this repository.

To log information about the most recently completed job, enter the
following command within the "After each job" field found within the
Templater Preferences dialog.  If using the Templater CLI, enter it
into the "post_cmd_job" property found within the
templater-options.json file.

    node /path/to/event-scripts/NodeJS/post_job.js --outdir $out_dir --aefile $aep --data $data_job --aedir $aep_dir --outfile $out_file -- $title

NOTE:  The "-- $title" part of the command assumes that your data
source has a column header, or property key, named "title"

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

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
