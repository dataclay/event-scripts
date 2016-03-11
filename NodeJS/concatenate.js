/*
 *
 *  Concatenate jobs from a batch
 *  Copyright (c) Dataclay LLC 2016
 *  MIT License
 *
 *  Concatenate via ffmpeg.
 *
 */

//Required Node Modules
var os     = require('os'),
    path   = require('path'),
    fs     = require('fs'),
    glob   = require('glob'),
    ffmpeg = require('fluent-ffmpeg'),
    argv   = require('minimist')(process.argv.slice(2));

var batch_details_json  = require(path.resolve(process.argv[2])),
    sequencer_filename  = 'concat.seq',
    sequencer_tmp       = path.join(os.tmpdir(), sequencer_filename);
    sequencer_file      = path.join(process.argv[3], sequencer_filename),
    ffmpeg_cmd          = ffmpeg(),
    concat_output       = path.join(process.argv[3], process.argv[4] + '.avi');

ffmpeg.setFfmpegPath("C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe");
ffmpeg.setFfprobePath("C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe");

console.log("\n\nGathering scenes and sequencing for movie");
for (var i=0; i < batch_details_json.length; i++) {

     var input_file = glob.sync(batch_details_json[i]["output_asset"] + ".*", { })[0];
     console.log("\n\tscene " + (i + 1));
     console.log("\t" + input_file);

     ffmpeg_cmd.input(path.resolve(input_file))
               .inputFormat('avi');

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
