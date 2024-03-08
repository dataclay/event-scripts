/*
+--------------------------------------------------------------------+
|               ____        __             __                        |
|              / __ \____ _/ /_____ ______/ /___ ___  __             |
|             / / / / __ `/ __/ __ `/ ___/ / __ `/ / / /             |
|            / /_/ / /_/ / /_/ /_/ / /__/ / /_/ / /_/ /              |
|           /_____/\__,_/\__/\__,_/\___/_/\__,_/\__, /               |
|           Automating Digital Production      /____/                |
|                                                                    |
|                                                                    |
|   We believe that leveraging data in the design process should     |
|   be a playful and rewarding art. Our products make this           |
|   possible for digital content creators.                           |
|                                                                    |
|   |email                      |web                  |twitter       |
|   |support@dataclay.com       |dataclay.com         |@dataclay     |
|                                                                    |
|   This code is provided to you for your personal or commercial     |
|   use.  However, you must abide by the terms of the MIT            |
|   License: https://opensource.org/licenses/MIT                     |
|                                                                    |
|                                                                    |
|                Copyright 2013-2018 Dataclay, LLC                   |
|                  Licensed under the MIT License                    |
|                                                                    |
+--------------------------------------------------------------------+

This code makes use of the Templater ExtendScript API documented here:

    http://support.dataclay.com/content/how_to/bot/event_scripts/templater_extendscript_api_reference.htm

Follow these steps to use this script:

1. Register this script file to any Templater event, or all events.

2. Open an After Effects project that is mapped to a data source
   using Templater.

3. Open the main Templater panel.  Iterate through jobs in the data
   source using Templater's "Preview" feature.

4. Inspect the `templater.log` file and note all the messages this 
   code writes to that file.

*/

var message, harvest, dl, dynamic_layer_names,
    footage = {};
    job_props = {};

//Log what event was just broadcast
$D.log.msg('JSX SCRIPT', "))) EVENT BROADCAST (((", $D.event());

if ($D.event() === 'bot_pre_data' ) {           //Handling pre-data event

    $D.log.msg('JSX SCRIPT', "Re-versioing After Effects Project File with [ " + $D.task() + " ] task", File(app.project.file).fsName);

} else if ($D.event() === 'bot_post_data') {    //Handling post-data event

    message = "Retreived data from position " + $D.range().start + " to " + $D.range().end;
    $D.log.msg('JSX SCRIPT', message, $D.batch.get()); 

    $D.log.msg('JSX SCRIPT', "Listing all the `title` values in this batch", $D.batch.get('title'));

} else if ($D.event() === 'bot_pre_job') {      //Handling pre-job event

    message = "Proceeding to re-version AEP for job [ " + $D.job.get('id') + " ]";
    $D.log.msg('JSX SCRIPT', message);

} else if ($D.event() === 'bot_pre_dl') {      //Handling pre-dl event

    dl = $D.download();
    message = "Proceeding to download remote footage";
    $D.log.msg('JSX SCRIPT', message, dl.to_console(true));

} else if ($D.event() === 'bot_pre_ftg') {      //Handling pre-ftg event

    footage.layer  = $D.footage.layer()  || null;
    footage.source = $D.footage.source() || null;
    footage.item   = $D.footage.item()   || null;

    message = "Proceeding to process footage";
    if (footage.layer) {
        $D.log.msg('JSX SCRIPT', "Layer footage mapped to", footage.layer.name);
        $D.log.msg('JSX SCRIPT', "Layer source", footage.layer.source.file.fsName);
    }
    
    if (footage.source) {
        $D.log.msg('JSX SCRIPT', "Path to footage source",  footage.source);
    }
    
    if (footage.item) {
        $D.log.msg('JSX SCRIPT', "Footage item ID in AE project", footage.item.id);
    }
    

} else if ($D.event() === 'bot_pre_layr') {     //Handling pre-update event

    harvest = $D.harvest();
    dynamic_layer_names  = [];

    message = "Proceeding to update following layers for job [ " + $D.job.get('id') + " ]";

    for (var layer_type in harvest) {
        
        for (var i=0; i < layer_type.length; i++) {
            if (harvest[layer_type][i]) dynamic_layer_names.push((harvest[layer_type][i]).name);
        } 
        
    }

    $D.log.msg('JSX SCRIPT', message, dynamic_layer_names);


} else if ($D.event() === 'bot_post_layr') {    //Handling post update event

    $D.log.msg('JSX SCRIPT', "Finished updating layers");

} else if ($D.event() === 'bot_pre_rndr') {     //Handling pre output events

    $D.log.msg('JSX SCRIPT', "Creating output for job [ " + $D.job.get('id') + " ]");

} else if ($D.event() === 'bot_post_rndr') {

    $D.log.msg('JSX SCRIPT', "Finished creating output")

    job_props.aep_loc     = Folder(app.project.file.parent).fsName;
    job_props.aep         = File(app.project.file).fsName;
    job_props.log         = $D.log.file().fsName;
    job_props.data_job    = $D.job.file().fsName;
    job_props.output_loc  = $D.output().loc.fsName;
    job_props.output_name = $D.output().name;
    job_props.bot_name    = $D.bot_id();
    job_props.module      = $D.output().module;
    job_props.template    = $D.output().template;

    $D.log.msg('JSX SCRIPT', "Details for most recently processed job", job_props.to_console(true));

} else if ($D.event() === 'bot_post_job') {

    message = "Re-versioning job [ " + $D.job.get('id') + " ] is now complete! File containing job information"
    $D.log.msg('JSX SCRIPT', message, $D.job.file().fsName);

} else if ($D.event() === 'bot_post_dl') {

    message = "After Footage Download Event!"
    dl = $D.download();
    $D.log.msg('JSX SCRIPT', message, dl.to_console(true));

} else if ($D.event() === 'bot_post_ftg') {

    message = "After Footage Processing Event!"
    footage.layer  = $D.footage.layer()  || null;
    footage.source = $D.footage.source() || null;
    footage.item   = $D.footage.item()   || null;

    message = "Proceeding to process footage";
    if (footage.layer) {
        $D.log.msg('JSX SCRIPT', "Layer footage mapped to", footage.layer.name);
        $D.log.msg('JSX SCRIPT', "Layer source", footage.layer.source.file.fsName);
    }
    
    if (footage.source) {
        $D.log.msg('JSX SCRIPT', "Path to footage source",  footage.source);
    }
    
    if (footage.item) {
        $D.log.msg('JSX SCRIPT', "Footage item ID in AE project", footage.item.id);
    }

} else if ($D.event() === 'bot_post_batch') {

    $D.log.msg('JSX SCRIPT', "File containing batch data", $D.batch.file().fsName);

} else if ($D.event() === 'bot_on_enable') {

    $D.log.msg('JSX SCRIPT', "The bot was just enabled.  Waiting to process data.");

} else if ($D.event() === 'bot_on_shutdown') {

    $D.log.msg('JSX SCRIPT', "The bot was just shut down.  No longer waiting for data.");

}
