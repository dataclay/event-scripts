#!/usr/local/opt/php55/bin/php
<?php

    /*
     *  Sample PHP script for On-Bot-Disable Event
     *    If you enable 'For all commands, use job details as arguments'
     *    some details about Templater will be appeneded as arguments to
     *    the command.  Notice the shabang line at the very top of this
     *    script.  This allows us to execute the php script directly without
     *    using php "myscript.php" -- arg1 arg2 arg3
     *
     *    The order of the appended arguments for the Bot Shutdown event is as follows
     *
     *    $argv[1] => The given name of The Bot as found in Templater's Preferences dialog
     *    $argv[2] => Absolute path to the AE project file being processed at the time of disable
     *    $argv[3] => Absolute path to the folder containing the AE project file being processed
     *
     *    Provide to you for your personal or commercial use by Dataclay, LLC.
     *
     *    NOTE:  THIS IS ONLY SAMPLE CODE.  IT WILL LIKELY NOT WORK IN YOUR ENVIRONMENT.
     *           THIS SCRIPT IS INCLUDING OTHER SCRIPTS NOT PRESENT IN THIS CODE.
     */

    include_once('smtp.conf.php');
    require_once 'vendor/swiftmailer/swiftmailer/lib/swift_required.php';

    $senderName     = "Dataclay Information";
    $senderEmail    = 'info@dataclay.io';
    $recipientEmail = 'support@dataclay.io';
    $recipientName  = 'Dataclay Support';
    $subject        = "The Bot for Templater is now disabled";

    $datetime  = date('Y-m-d H:i:s');

    $senderMsg      = "The Bot for Templater was disabled at " . $datetime . "\n\n[Bot Name]\n" . $argv[1] . "\n\n[AE Project File]\n" . $argv[2] . "\n\n[AE Project Folder]\n" . $argv[3] . "\n\nThis could have happened manually or because of an error.\n\nRegards,\nDataclay Support";

    $transport = Swift_SmtpTransport::newInstance($dclay_smtp_address, $dclay_smtp_port, 'ssl')
        ->setUsername($userEmail)
        ->setPassword($dclay_smtp_password);

    $mailer = Swift_Mailer::newInstance($transport);

    $message = Swift_Message::newInstance()
        ->setSubject($subject)
        ->setFrom(array($senderEmail => $senderName))
        ->setTo(array($recipientEmail => $recipientName))
        ->setBody($senderMsg);

    $result = $mailer->send($message);

?>
