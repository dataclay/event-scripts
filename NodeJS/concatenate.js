/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

Concatenate jobs from a batch
Copyright (c) Dataclay LLC 2016
MIT License

Concatenate Templater batch output with ffmpeg.

To use this script.  Make sure to have ffmpeg installed and point to
both the ffmpeg and ffprobe binaries in the code below.  Then, make
sure that the script's dependencies are installed by entering `npm
install` in the root of your working directory.

Enter the following command within the "After all jobs" field found
within the Templater Preferences dialog.  If using the Templater CLI,
enter the following command in the "post_cmd_batch" property found
within the templater-options.json file.

     node /Users/arie/Dev/event-scripts/NodeJS/concatenate.js --details $data_batch --outdir $out_dir --outname "finalrender.mov"

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//Constants
var ffmpeg_win  = "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
    ffprobe_win = "C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe",
    ffmpeg_osx  = "/usr/local/bin/ffmpeg",
    ffprobe_osx = "/usr/local/bin/ffprobe";

//Required Node Modules
var os     = require('os'),
    path   = require('path'),
    fs     = require('fs'),
    glob   = require('glob'),
    ffmpeg = require('fluent-ffmpeg'),
    argv   = require('minimist')(process.argv.slice(2));

var batch_details_json  = require(path.resolve(argv.details)),
    ffmpeg_cmd          = ffmpeg(),
    concat_output       = path.join(argv.outdir, argv.outname);

if (process.platform == 'win32') {
    ffmpeg.setFfmpegPath(ffmpeg_win);
    ffmpeg.setFfprobePath(ffprobe_win);
} else {
    ffmpeg.setFfmpegPath(ffmpeg_osx);
    ffmpeg.setFfprobePath(ffprobe_osx);
}

console.log("\n\nGathering scenes and sequencing for movie");
for (var i=0; i < batch_details_json.length; i++) {

     var input_file = glob.sync(batch_details_json[i]["output_asset"] + ".*", { })[0];
     console.log("\n\tscene " + (i + 1));
     console.log("\t" + input_file);

     ffmpeg_cmd.input(path.resolve(input_file));

}

ffmpeg_cmd.on('start', (command) => {
  console.log('\n\nStarting concatenation of output:\n\n\t' + command);
});

ffmpeg_cmd.on('error', (err, stdout, stderr) => {
    console.log("\nError: " + err.message);
    console.log(err.stack);
});

ffmpeg_cmd.on('end', (stdout, err) => {
    console.log("\n\nFinal movie");
    console.log("\n\t" + concat_output);
});

ffmpeg_cmd.videoCodec('libx264')
          .outputOption('-pix_fmt yuv420p')
          .noAudio();

ffmpeg_cmd.mergeToFile(concat_output);
