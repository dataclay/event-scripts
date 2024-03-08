/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

Logs pre and post footage processing in Templater for After Effects
Copyright (c) Dataclay LLC 2024
MIT License

You must enter `npm install` to install all dependency modules used in
this script.  All modules are listed in the package.json file in the
root of this repository.

To log information about footage assets Templater retrieves, enter the
following command within the "Before footage download" and
"After footage download" fields found within the Templater Preferences 
dialog.  If using the Templater CLI, enter it into the "pre_cmd_ftg"
and "post_cmd_ftg" properties found within the templater-options.json file.


/path/to/node /path/to/log-footage-processing.js --event $event --aefile $aep --data $data_job --aedir $aep_dir --layer $ftg_layer --name $ftg_name --file $ftg_file  --dir $ftg_dir --ext $ftg_ext

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//Required NodeJS Modules
var os       = require('os'),
    fs       = require('fs'),
    fse      = require('fs-extra'),
    util     = require('util'),
    path     = require('path'),
    moment   = require('moment'),
    argv     = require('minimist')(process.argv.slice(2));

var logfile  = "templater-ftg-process.log",
    job_data = require(argv.data);
    proj     = path.resolve(argv.aedir),
    log      = path.join(os.tmpdir(), logfile),
    log_dest = path.join(proj, "templater-ftg-process.log"),
    msg      = msg  = "\r\n------------ [TEMPLATER DOWNLOAD] -----------\r\n";


//Design the output for the post job log
msg += "\r\nTemplater Event [ " + argv.event + " ] on [ " + moment().format('MMMM Do YYYY, h:mm:ss a') +  "]";
msg += "\r\n\r\nData set\r\n    "                   + JSON.stringify(job_data, null, 4).replace(/(?:\r\n|\r|\n)/g, "\r\n    ");
msg += "\r\n\r\nProject directory\r\n    > "        + proj;
msg += "\r\n\r\nProject file \r\n    > "            + path.basename(argv.aefile);
msg += "\r\n\r\nNew footage layer\r\n    > "        + argv.layer;  //$ftg_layer
msg += "\r\n\r\nNew footage file\r\n    > "         + argv.file;   //$ftg_file
msg += "\r\n\r\nNew footage name\r\n    > "         + argv.name;   //$ftg_name
msg += "\r\n\r\nNew footage dir\r\n    > "          + argv.dir;    //$ftg_dir
msg += "\r\n\r\nNew footage extension\r\n    > "    + argv.ext;    //$ftg_ext
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
