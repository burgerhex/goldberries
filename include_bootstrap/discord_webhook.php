<?php

$webhooks_enabled = false;

function send_webhook_suggestion_verified($suggestion)
{
  global $DB;
  global $webhooks_enabled;

  if (!$webhooks_enabled) {
    return;
  }

  $suggestion->expand_foreign_keys($DB, 5);

  $webhook_url = constant('SUGGESTION_BOX_WEBHOOK_URL');
  $timestamp = date("c", strtotime("now"));

  $challenge = $suggestion->challenge;
  $map = $challenge !== null ? $challenge->map : null;
  $campaign = $challenge !== null ? $challenge->get_campaign() : null;

  $name = $map === null ? ($campaign === null ? "General Suggestion" : $campaign->get_name()) : $map->get_name();
  $suggestion_url = constant("BASE_URL") . "/suggestion/" . $suggestion->id;

  $description = "";

  $fields = [];

  $fields[] = [
    "name" => "Author: " . $suggestion->author->name,
    "value" => "Comment: " . $suggestion->comment,
    "inline" => false,
  ];

  if ($challenge) {
    $description = $challenge->objective->name;
    if ($challenge->description) {
      $description += " [" . $challenge->description . "]";
    }

    $challenge->fetch_submissions($DB);

    $current_diff_name = $challenge->difficulty->to_tier_name();
    $suggested_diff_name = $suggestion->suggested_difficulty->to_tier_name();

    $fields[] = [
      "name" => "Placement",
      "value" => $current_diff_name . " -> " . $suggested_diff_name,
      "inline" => false
    ];

    $submission_index = 0;
    foreach ($challenge->submissions as $submission) {
      $diff_suggestion = $submission->suggested_difficulty;
      $as_text = $diff_suggestion !== null ? "{$diff_suggestion->to_tier_name()}" : "<none>";
      $fields[] = [
        "name" => $submission->player->name,
        "value" => $as_text,
        "inline" => true
      ];
      $submission_index++;
    }
  }


  $json_data = json_encode([
    "content" => "New Suggestion: $name",

    // Username
    // "username" => "krasin.space",

    // Avatar URL.
    // Uncoment to replace image set in webhook
    //"avatar_url" => "https://ru.gravatar.com/userimage/28503754/1168e2bddca84fec2a63addb348c571d.jpg?size=512",

    // Text-to-speech
    // "tts" => false,

    // File upload
    // "file" => "",

    // Embeds Array
    "embeds" => [
      [
        // Embed Title
        "title" => "Suggestion for '$name' by {$suggestion->author->name}",

        // Embed Type
        "type" => "rich",

        // Embed Description
        "description" => $description,

        // URL of title link
        "url" => $suggestion_url,

        // Timestamp of embed must be formatted as ISO8601
        "timestamp" => $timestamp,

        // Embed left border color in HEX
        "color" => hexdec("3333ff"),

        // Footer
        // "footer" => [
        //   "text" => "Footer text",
        //   "icon_url" => $suggestion_url,
        // ],

        // Image to send
        // "image" => [
        //     "url" => "https://ru.gravatar.com/userimage/28503754/1168e2bddca84fec2a63addb348c571d.jpg?size=600"
        // ],

        // Thumbnail
        //"thumbnail" => [
        //    "url" => "https://ru.gravatar.com/userimage/28503754/1168e2bddca84fec2a63addb348c571d.jpg?size=400"
        //],

        // Author
        // "author" => [
        //     "name" => "krasin.space",
        //     "url" => "https://krasin.space/"
        // ],

        // Additional Fields array
        "fields" => $fields,
      ]
    ]

  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

  send_webhook($webhook_url, $json_data);
}


function send_webhook($url, $data)
{
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

  $response = curl_exec($ch);
  // If you need to debug, or find out why you can't send message uncomment line below, and execute script.
  // echo $response;
  curl_close($ch);
}