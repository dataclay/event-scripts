/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

Logs pre and post footage download in Templater for After Effects
Copyright (c) Dataclay LLC 2024
MIT License

You must enter `npm install` to install all dependency modules used in
this script.  All modules are listed in the package.json file in the
root of this repository.

To log information about footage assets Templater retrieves, enter the
following command within the "Before footage download" and
"After footage download" fields found within the Templater Preferences 
dialog.  If using the Templater CLI, enter it into the "pre_cmd_dl"
and "post_cmd_dl" properties found within the templater-options.json file.


/path/to/node /path/to/log-footage-download.js --event $event --aefile $aep --data $data_job --aedir $aep_dir --uri $dl_file_uri --name $dl_file_name --dir $dl_file_dir  --mime $dl_file_mime --ext $dl_file_ext --file $dl_file

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//Required NodeJS Modules
var os       = require('os'),
    fs       = require('fs'),
    fse      = require('fs-extra'),
    util     = require('util'),
    path     = require('path'),
    moment   = require('moment'),
    argv     = require('minimist')(process.argv.slice(2));

var logfile  = "templater-ftg-download.log",
    job_data = require(argv.data);
    proj     = path.resolve(argv.aedir),
    log      = path.join(os.tmpdir(), logfile),
    log_dest = path.join(proj, "templater-post-job.log"),
    msg      = msg  = "\r\n------------ [TEMPLATER DOWNLOAD] -----------\r\n";


//Design the output for the post job log
msg += "\r\nTemplater Event [ " + argv.event + " ] on [ " + moment().format('MMMM Do YYYY, h:mm:ss a') +  "]";
msg += "\r\n\r\nData set\r\n    "                   + JSON.stringify(job_data, null, 4).replace(/(?:\r\n|\r|\n)/g, "\r\n    ");
msg += "\r\n\r\nProject directory\r\n    > "        + proj;
msg += "\r\n\r\nProject file \r\n    > "            + path.basename(argv.aefile);
msg += "\r\n\r\nDownload file URI\r\n    > "        + argv.uri;     //$dl_file_uri
msg += "\r\n\r\nDownload file name\r\n    > "       + argv.name;    //$dl_file_name
msg += "\r\n\r\nDownload file directory\r\n    > "  + argv.dir;     //$dl_file_dir
msg += "\r\n\r\nDownload mime type\r\n    > "       + argv.mime;    //$dl_file_mime
msg += "\r\n\r\nDownload file extension\r\n    > "  + argv.ext;     //$dl_file_ext
msg += "\r\n\r\nDownload file asset\r\n    > "      + argv.file;    //$dl_file
msg += "\r\n\r\n";


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
