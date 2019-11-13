/*

    Written by Jon Christoffersen / jon@dataclay.com
    Based on a script by Shane Murphy @ prender.co
    Released open-source by Dataclay, LLC

*/

/// Register on "Before Update" Event in Templater Preferences ExtendScript Setup
/// Font key/column in data source must match the name of a text layer that is tagged  with the Templater Settings effect, adding a "--font" tag at the end of the name 
/// -- example a text layer named "text-1" would have a font control column/key in the data source called "text-1--font"
/// Font name in data source must be the Postscript Name

// Logging messages
var textLabel= "FONT CHANGE";
var scriptErr = "Script error on line ";
var textMsg = "Full list of dynamic text layers";
var textMsg2 = "Data flagged from source";
var textMsg3 = "Checking project for layers named...";
var textMsg4 = "Updating font for selected layers...";

// loop over all text layer objects and add names to array
var textLayers = $D.harvest().text;
var i;
var layerNames = [];

for (i = 0; i < textLayers.length; ++i){
	layerName = textLayers[i].name;
	layerNames.push(layerName);
}

// log text layers to templater.log file
try{
	$D.log.msg(textLabel, textMsg, layerNames);
} catch (err){
	$D.log.msg(textLabel, textMsg, scriptErr + err.line + " : " + err.toString());
}

// push data from job.get object that is tagged with "--font" into an array
var taggedData = [];
var dataFromSource = $D.job.get();
var isLabelFont = "--font";

for ( var key in dataFromSource ){ 
    if (dataFromSource.hasOwnProperty(key)){
        if(key.search(isLabelFont)!=-1){
        taggedData.push(key);
        }
    }
} 
// log keys from data object to an array in templater.log
try{
	$D.log.msg(textLabel, textMsg2, taggedData);
} catch (err){
	$D.log.msg(textLabel, textMsg2, scriptErr + err.line + " : " + err.toString());
}

// strip "--font" tag and push into an array
var fontLayers = [];
var flag = /--font/gi;
for (i=0 ; i < taggedData.length; ++i){
    fontLayers.push(taggedData[i].split(flag, 1));
}
// log stripped tags to templater.log
try{
	$D.log.msg(textLabel, textMsg3, fontLayers);
} catch (err){
	$D.log.msg(textLabel, textMsg3, scriptErr + err.line + " : " + err.toString());
}

// swap the fonts if there is a textLayer object that matches the flagged data
for(i=0; i<fontLayers.length; ++i){
    var layerSelection = fontLayers[i];
    var fontSelect = $D.job.get(taggedData[i]);
    var x;
    for(x=0; x < layerNames.length; ++x){
        var taggedLayer = layerNames[x];
        if(taggedLayer == layerSelection){
            // swap font
            textProp = textLayers[x].property("Source Text");
            textDocument = textProp.value;
            currentFont = textDocument.font;
            if(fontSelect !=""){
                textDocument.font = fontSelect;
                textProp.setValue(textDocument);
                
                // log font changes to templater.log
                try{
                    $D.log.msg(textLabel, textMsg4, "changing layer: " + taggedLayer + " | to | " + fontSelect);
                } catch (err){
                    $D.log.msg(textLabel, textMsg4, scriptErr + err.line + " : " + err.toString());
                }
            }
        } 
    }
}