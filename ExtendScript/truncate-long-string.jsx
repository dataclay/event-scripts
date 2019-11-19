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

1. Add a column or property to your data source named `headline`.  
   Map the `headline` values to a Text Layer within an After Effects 
   composition using the Templater Settings effect.

2. In your data source, for each job's `headline` value, enter a text
   string that contains more than ten characters.  You can enter 
   strings less than ten characters long, but these will not be 
   truncated as per the following ExtendScript code.

3. Register this script file with the "Before Update" event.

4. Using Templater, iterate through a set of rows or objects that have
   different `headline` values — some shorter than ten characters, and
   some longer.  Notice that long text strings within the `headline` 
   layer are post-fixed with `...`.


*/

function truncate(word){

  var truncated_word;
  var max_characters = 10;

  truncated_word = (word.length > max_characters) ? word.slice(0, max_characters) + '...' : word;

  return truncated_word;

}

var current_headline = $D.job.get("headline");

$D.log.msg('TRUNCATE', "Now truncating string", current_headline);
$D.job.set("headline", truncate(current_headline));