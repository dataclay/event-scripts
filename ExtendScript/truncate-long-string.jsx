function truncate(word){

  var truncated_word;
  var max_characters = 10;

  truncated_word = (word.length > max_characters) ? word.slice(0, max_characters) + '...' : word;

  return truncated_word;

}

var current_headline = $D.job.get("headline");

$D.log.msg('TRUNCATE', "Now truncating string", current_headline);
$D.job.set("headline", truncate(current_headline));