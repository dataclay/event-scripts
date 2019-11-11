@echo off
:: +--------------------------------------------------------------------+
:: |               ____        __             __                        |
:: |              / __ \____ _/ /_____ ______/ /___ ___  __             |
:: |             / / / / __ `/ __/ __ `/ ___/ / __ `/ / / /             |
:: |            / /_/ / /_/ / /_/ /_/ / /__/ / /_/ / /_/ /              |
:: |           /_____/\__,_/\__/\__,_/\___/_/\__,_/\__, /               |
:: |           Automating Digital Production      /____/                |
:: |                                                                    |
:: |                                                                    |
:: |   We believe that leveraging data in the design process should     |
:: |   be a playful and rewarding art. Our products make this           |
:: |   possible for digital content creators.                           |
:: |                                                                    |
:: |   |email                      |web                  |twitter       |
:: |   |support@dataclay.com       |dataclay.com         |@dataclay     |
:: |                                                                    |
:: |   This code is provided to you for your personal or commercial     |
:: |   use.  However, you must abide by the terms of the MIT            |
:: |   License: https://opensource.org/licenses/MIT                     |
:: |                                                                    |
:: |                                                                    |
:: |                Copyright 2013-2020 Dataclay, LLC                   |
:: |                  Licensed under the MIT License                    |
:: |                                                                    |
:: +--------------------------------------------------------------------+

:: This is a sample bash script for learning how shell scripts can work
:: with Templater Bot on macOS.  
::
:: Follow these steps to use this script:
::
:: 1. Open an After Effects project that is mapped to a data source
::    using Templater.
::
:: 2. Open the main Templater panel.  Open the `Templater Preferences`
::    dialog.  Click the `Setup Shell Scripts` button.
::
:: 3. Register the following to any or all of the events
::
::      Z:\path\to\event-logger.bat $event $id $aep_dir $log $data_job $aep $out_dir $out_name $data_batch $bot_name $machine_name $user_name $sources $data_start $data_end $out_file $now
::
:: 4. Iterate through "Previews" of jobs as stored in Templater's
::    connected data source.
::
:: 5. Inspect the `events.log` file that will be created in the same
::    directory as the After Effects project file.

set EVENT=%~1
set JOB=%~2
set AEP_LOC=%~3
set TEMPLATER_LOG=%~4
set DATA_JOB=%~5
set AEP=%~6
set OUT_DIR=%~7
set OUT_NAME=%~8
set DATA_BATCH=%~9
SHIFT
SHIFT
SHIFT
SHIFT
SHIFT
SHIFT
SHIFT
SHIFT
SHIFT
set BOT_NAME=%~1
set MACHINE=%~2
set USER=%~3
set SOURCES=%~4
set DATA_START=%~5
set DATA_END=%~6
set OUT_FILE=%~7
set NOW=%~8
set n=^&echo.

::The `events.log` file will be in the same directory as the AEP file
set log=%AEP_LOC%\events.log

For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

echo --- %mydate% @ %mytime% [ TEMPLATER EVENT ] --- >> "%log%"
echo. >> "%log%"
echo         Templater Log File : %TEMPLATER_LOG% >> "%log%"
echo         Machine Name       : %MACHINE% >> "%log%"
echo         User Name          : %USER% >> "%log%"
echo         Timestamp          : %NOW% >> "%log%"
echo         Source Location    : %SOURCES% >> "%log%"
echo         Data Start         : %DATA_START% >> "%log%"
echo         Data End           : %DATA_END% >> "%log%"
echo         Bot Name           : %BOT_NAME% >> "%log%"
echo         AEP File           : %AEP% >> "%log%"
echo         AEP Location       : %AEP_LOC% >> "%log%"
echo. >> "%log%"

if "%EVENT%" == "bot_pre_job" (

echo         [ %EVENT% ] >> "%log%"
echo         Job Data File      : %DATA_JOB% >> "%log%"
echo         Output Asset Name  : %OUT_NAME% >> "%log%"
echo         Output File Path   : %OUT_FILE% >> "%log%"
echo         Output Directory   : %OUT_DIR%  >> "%log%"
echo. >> "%log%"

)

if "%EVENT%" == "bot_post_job" (

echo         [ %EVENT% ] >> "%log%"
echo         Job Data File      : %DATA_JOB% >> "%log%"
echo         Output Asset Name  : %OUT_NAME% >> "%log%"
echo         Output File Path   : %OUT_FILE% >> "%log%"
echo         Output Directory   : %OUT_DIR%  >> "%log%"
echo. >> "%log%"

)

if "%EVENT%" == "bot_pre_layr" (

echo         [ %EVENT% ] >> "%log%"
echo. >> "%log%"

)

if "%EVENT%" == "bot_post_layr" (

echo         [ %EVENT% ] >> "%log%"
echo. >> "%log%"

)

if "%EVENT%" == "bot_pre_rndr" (

echo         [ %EVENT% ] >> "%log%"
echo. >> "%log%"

)

if "%EVENT%" == "bot_post_rndr" (

echo         [ %EVENT% ] >> "%log%"
echo. >> "%log%"

)

if "%EVENT%" == "bot_post_batch" (

echo         [ %EVENT% ] >> "%log%"
echo         Batch Data File    : "%DATA_BATCH%"
echo. >> "%log%"

)