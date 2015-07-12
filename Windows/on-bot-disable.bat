:: Sample batch script for Bot-Shutdown Event
::   If you enable 'For all commands, use job details as arguments'
::   some details about the just-finished batch will be appended to the
::   command as arguments.  On windows, there was no easy way to call
::   the php script directly, so we call php via a batch file.  Furthermore,
::   we had to provide an absolute path to the php executable even though
::   php.exe is in the environment path.
::
::   The order or the arguments is as follows:
::
::   %1 => The given name of The Bot as found in Templater's Preferences dialog
::   %2 => Absolute path to the AE project file being processed at the time of disable
::   %3 => Absolute path to the folder containing the AE project file being processed
::
::  Provided for your personal or commercial use by Dataclay, LLC

@ECHO OFF

SET log=%3\templater-bot.log
For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

echo -------- [TEMPLATER BOT] -------- >> %$log%
echo     The bot went down on  %mydate% @ %mytime% >> %log%
echo     Sending email notice >> %$log%
"C:\Program Files (x86)\PHP\php.exe" "L:\Templater\Scripts\on-bot-disable-win.php" %1 %2 %3
echo     Done sending email notice >> %$log%


