# Sample bash script for Bot-Shutdown Event
#   If you enable 'For all commands, use job details as arguments'
#   some details about the just-finished batch will be appended to the
#   command as arguments.  On windows, there was no easy way to call
#   the php script directly, so we call php via a batch file.  Furthermore,
#   we had to provide an absolute path to the php executable even though
#   php.exe is in the environment path.
#
#   The order or the arguments is as follows:
#
#   $1 => The given name of The Bot as found in Templater's Preferences dialog
#   $2 => Absolute path to the AE project file being processed at the time of disable
#   $3 => Absolute path to the folder containing the AE project file being processed
#
#  Provided for your personal or commercial use by Dataclay, LLC

log="$3/templater-bot.log"
echo "-------- [TEMPLATER BOT] --------" >> "$log"
echo "" >> "$log"
echo "    The bot went down at $(date)" >> "$log"
echo "    Sending email notifice" >> "$log"
/usr/local/opt/php55/bin/php -f "/Users/arie/Dev/Templater/Scripts/on-bot-disable.php" -- "$1" "$2" "$3"
echo "    Done sending email notice" >> "$log"
echo "" >> "$log"

