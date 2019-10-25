//credit to Shane Murphy @ prender.co

var	brandFont = $D.job.get('brandfont');
	textProp = app.project.items[2].layer(1).property("Source Text");
	textDocument = textProp.value;
	textDocument.justification = ParagraphJustification.LEFT_JUSTIFY
	textDocument.font = brandFont;

textProp.setValue(textDocument);
textProp.setValue(textDocument.justification);

textProp = app.project.items[3].layer(1).property("Source Text")
textProp.setValue(textDocument);
textProp.setValue(textDocument.justification);

textProp = app.project.items[4].layer(1).property("Source Text")
textProp.setValue(textDocument);
textProp.setValue(textDocument.justification);

textProp = app.project.items[5].layer(1).property("Source Text")
textProp.setValue(textDocument);
textProp.setValue(textDocument.justification);

textProp = app.project.items[6].layer(1).property("Source Text")
textProp.setValue(textDocument);
textProp.setValue(textDocument.justification);

textProp = app.project.items[7].layer(1).property("Source Text")
textProp.setValue(textDocument);
textProp.setValue(textDocument.justification);
