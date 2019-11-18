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

This code makes use of the Templater ExtendScript API which is 
documented at the following address:

http://support.dataclay.com/content/how_to/bot/event_scripts/templater_extendscript_api_reference.htm

Follow these steps to use this script:

1. Add two columns or properties to your data source named 
  `workarea-start` and `workarea-end`.

2. In your data source, for each job's `workarea-start` value, enter 
   the frame number where you want the work area in the target 
   composition to begin.  Then, for each job's `workarea-end` value, 
   enter the frame number where you want the work area in the target
   composition to end.

3. Register this script file with Templater's  "After Update" event.

4. Run a batch render job with Templater with rows or objects that 
   have different `workarea-start` and `workarea-end` values.  
   The output corresponding to each row or object has a different
   work area.

*/


var targetComp = $D.target(),
    comp_fps   = targetComp.frameRate;
    f_start    = parseInt($D.job.get("workarea-start"));
    f_end      = parseInt($D.job.get("workarea-end"));

targetComp.workAreaStart    = (f_start / comp_fps);
targetComp.workAreaDuration = (f_end / comp_fps) - targetComp.workAreaStart;