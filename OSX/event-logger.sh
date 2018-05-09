# +--------------------------------------------------------------------+
# |               ____        __             __                        |
# |              / __ \____ _/ /_____ ______/ /___ ___  __             |
# |             / / / / __ `/ __/ __ `/ ___/ / __ `/ / / /             |
# |            / /_/ / /_/ / /_/ /_/ / /__/ / /_/ / /_/ /              |
# |           /_____/\__,_/\__/\__,_/\___/_/\__,_/\__, /               |
# |           Automating Digital Production      /____/                |
# |                                                                    |
# |                                                                    |
# |   We believe that leveraging data in the design process should     |
# |   be a playful and rewarding art. Our products make this           |
# |   possible for digital content creators.                           |
# |                                                                    |
# |   |email                      |web                  |twitter       |
# |   |support@dataclay.com       |dataclay.com         |@dataclay     |
# |                                                                    |
# |   This code is provided to you for your personal or commercial     |
# |   use.  However, you must abide by the terms of the MIT            |
# |   License: https://opensource.org/licenses/MIT                     |
# |                                                                    |
# |                                                                    |
# |                Copyright 2013-2018 Dataclay, LLC                   |
# |                  Licensed under the MIT License                    |
# |                                                                    |
# +--------------------------------------------------------------------+

# This is a sample bash script for learning how shell scripts can work
# with Templater Bot on macOS.  
#
# Follow these steps to use this script:
#
# 1. Open an After Effects project that is mapped to a data source
#    using Templater.
#
# 2. Open the main Templater panel.  Open the `Templater Preferences`
#    dialog.  Click the `Setup Shell Scripts` button.
#
# 3. Register the following to any orall of the events
#
#      /path/to/event-logger.sh $event $id $aep_dir $log $data_job $aep $out_dir $out_name $data_batch $bot_name $machine_name $user_name $sources $data_start $data_end $out_file $now
#
# 4. Iterate through "Previews" of jobs as stored in Templater's
#    connected data source.
#
# 5. Inspect the `events.log` file that will be created in the same
#    directory as the After Effects project file.


event="$1"
job_id="$2"
aep_loc="$3"
templater_log="$4"
data_job="$5"
aep="$6"
out_dir="$7"
out_name="$8"
data_batch="$9"
bot_name="${10}"
machine="${11}"
user="${12}"
sources="${13}"
data_start="${14}"
data_end="${15}"
out_file="${16}"
now="${17}"

#The `events.log` file will be in the same directory as the AEP file
log="$aep_loc/events.log"

if [ $event = "bot_pre_data" ]
then
    printf " - $(date) [ TEMPLATER EVENT : $event ] - \n\n" >> "$log"

    printf "\tTemplater Log File            => $templater_log\n" >> "$log"
    printf "\tMachine Name                  => $machine\n"       >> "$log"
    printf "\tUser Name                     => $user\n"          >> "$log"
    printf "\tTimestamp                     => $now\n"           >> "$log"
    printf "\tSource Location               => $sources\n"       >> "$log"
    printf "\tData Start                    => $data_start\n"    >> "$log"
    printf "\tData End                      => $data_end\n"      >> "$log"
    printf "\tBot Name                      => $bot_name\n"      >> "$log"
    printf "\tAEP File                      => $aep\n"           >> "$log"
    printf "\tAEP Location                  => $aep_loc\n"       >> "$log"
    printf "\tOutput Location               => $out_dir\n"       >> "$log"
    

else

    if [ $event = "bot_pre_job" ] || [ $event = "bot_post_job" ]
    then

        if [ $event = "bot_pre_job" ]
        then
            printf "\n" >> "$log"
        fi

        printf "\t- $(date) [ TEMPLATER EVENT : $event : JOB ID - $job_id ] - \n\n" >> "$log"

        if [ $event = "bot_post_job" ]
        then
            printf "" >> "$log"
            printf "\tJob Data File             => $data_job\n"      >> "$log"
            printf "\tTemplater Output Name     => $out_name\n"      >> "$log"
            printf "\tTemplater Output File     => $out_file\n"      >> "$log"
        fi

    else
      
        if [ $event = "bot_pre_layr" ] || [ $event = "bot_post_layr" ]  || [ $event = "bot_pre_rndr" ] || [ $event = "bot_post_rndr" ]
        then
            printf "\t\t- $(date) [ TEMPLATER EVENT : $event ] - \n" >> "$log"
        else
            printf " - $(date) [ TEMPLATER EVENT : $event ] - \n" >> "$log"
        fi

    fi

fi

printf "\n" >> "$log"

if [ $event = "bot_post_batch" ]
then
    printf "\tBatch Data File           => $data_batch\n"    >> "$log"
    printf "\n# # #\n\n" >> "$log"
fi
