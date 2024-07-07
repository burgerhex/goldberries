<?php

require_once ('api_bootstrap.inc.php');

$account = get_user_data();
check_access($account, true);
if (!$account->is_admin) {
  http_response_code(403);
  die("Access denied");
}

//Set content type to plain text
header('Content-Type: text/plain');


// read in the 2 date files 'video-details.json' and 'bilibili-video-details.json'
$video_details = json_decode(file_get_contents('../assets/data/video-details.json'), true);
$bilibili_video_details = json_decode(file_get_contents('../assets/data/bilibili-video-details.json'), true);


// Get all submissions with a NULL date
$query = "SELECT * FROM submission WHERE date_created IS NULL";
$result = pg_query($DB, $query);
if (!$result) {
  die("Error in SQL query: " . pg_last_error());
}

$count = 0;
while ($row = pg_fetch_assoc($result)) {
  // $count++;
  // if ($count > 10) {
  //   break;
  // }

  $submission = new Submission();
  $submission->apply_db_data($row);

  $link = $submission->proof_url;
  // echo "\n";
  // echo "Processing submission (#$count): $submission\n";
  // echo "  Link: $link\n";

  // Check if the link is a youtube or bilibili link
  $youtube_id = youtube_id($link);
  $bilibili_id = bilibili_id($link);

  $publish_date = null;

  if ($youtube_id) {
    $count++;
    echo "\n";
    echo "Processing submission (#$count): $submission\n";
    echo "  Link: $link\n";
    echo "  Link Type: YouTube\n";
    // continue;
    $video = $video_details[$youtube_id];
    if ($video["error"]) {
      echo "  Video had an error: $video[error]\n";
      $submission->expand_foreign_keys($DB, 5, true);
      echo "  Submission details: map = " . $submission->challenge->get_name() . ", player = " . $submission->player->name . "\n";
      continue;
    }
    echo "  Video Details: title = $video[title], channelTitle = $video[channelTitle], duration = $video[duration]\n";
    echo "  Published At: $video[publishedAt]\n";
    $publish_date = $video['publishedAt']; //Format: 2021-07-01T00:00:00Z
    $submission->date_created = new JsonDateTime($publish_date);
    if ($submission->update($DB)) {
      echo "  Submission updated with date: $publish_date\n";
    } else {
      echo "  Error updating submission with date: $publish_date\n";
    }

  } else if ($bilibili_id) {
    // $count++;
    // echo "\n";
    // echo "Processing submission (#$count): $submission\n";
    // echo "  Link: $link\n";
    // echo "  Link Type: BiliBili\n";
    continue;
    $video = $bilibili_video_details[$bilibili_id];
    if ($video["error"]) {
      echo "  Video had an error: $video[error]\n";
      $submission->expand_foreign_keys($DB, 5, true);
      echo "  Submission details: map = " . $submission->challenge->get_name() . ", player = " . $submission->player->name . "\n";
      continue;
    }
    echo "  Video Details: title = $video[title], author = $video[author]\n";
    echo "  Published At: $video[publishDate]\n";
    $publish_date = $video['publishDate']; //Format: 1718347721 (UNIX timestamp)
    //UNIX timesamp to ISO 8601 (2021-07-01T00:00:00Z)
    $date = gmdate('c', $publish_date);

    //UNIX timestamp to date time object
    // $date = new DateTime();
    // $date->setTimestamp($publish_date);
    // $date = $date->format('Y-m-d H:i:sO');
    $submission->date_created = new JsonDateTime($date);

    if ($submission->update($DB)) {
      echo "  Submission updated with date: $date\n";
    } else {
      echo "  Error updating submission with date: $date\n";
    }

  } else {
    // $count++;
    // echo "\n";
    // echo "Processing submission (#$count): $submission\n";
    // echo "  Link: $link\n";
    // echo "  Link is neither YouTube nor Bilibili\n";
    continue;
  }
}

// $count--;
echo "\n";
echo "Processing $count entries completed.\n";

function youtube_id($link)
{
  //Possible variations:
  //https://www.youtube.com/watch?v=VIDEO_ID&stuff
  //https://youtu.be/VIDEO_ID?stuff
  //https://youtu.be/VIDEO_ID&stuff
  //https://youtube.com/watch?v=VIDEO_ID&stuff

  $pattern = '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/';
  preg_match($pattern, $link, $matches);
  if (!$matches)
    return false;
  return $matches[1];
}

function bilibili_id($link)
{
  //Possible variations:
  //https://www.bilibili.com/video/BV1Kb411W75t
  //http://www.bilibili.com/video/BV1Kb411W75t
  //the video ID could also be an AV ID: AV123456789

  $pattern = '/bilibili\.com\/video\/([bB][vV][a-zA-Z0-9_-]+|[aA][vV][0-9]+)/';
  preg_match($pattern, $link, $matches);
  if (!$matches)
    return false;
  return $matches[1];
}