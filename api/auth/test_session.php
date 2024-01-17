<?php

require_once('../api_bootstrap.inc.php');

header('Content-Type: text/html; charset=UTF-8');

$account = get_user_data();

?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Test session</title>
</head>

<body>
  <?php

  if ($account == null) {
    echo "Not logged in<br>";
    echo "<a href=\"discord_auth.php\">Register with Discord</a><br>";
    echo "<a href=\"discord_auth.php?login\">Login with Discord</a><br>";
    echo "-----<br>";
    echo "<a href=\"register.php\">Register with Email</a><br>";
    echo "<a href=\"login.php\">Login with Email</a><br>";
    exit();
  }

  echo "Logged in as ID:{$account->id}<br>";
  echo "Session token: " . to_string_null_check($account->session_token) . "<br>";
  echo "Seasion created: " . date_to_long_string($account->session_created) . "<br>";
  echo "----- <br>";
  echo "Discord ID: " . to_string_null_check($account->discord_id) . "<br>";
  echo "----- <br>";
  echo "Email: " . to_string_null_check($account->email) . "<br>";
  echo "----- <br>";

  echo "You are:";
  $any = false;
  if ($account->is_admin) {
    echo " Admin";
    $any = true;
  }
  if ($account->is_verifier) {
    echo " Verifier";
    $any = true;
  }
  if ($account->is_suspended) {
    echo " Suspended";
    $any = true;
  }
  echo "<br>";

  echo "<a href=\"logout.php\">Logout</a><br>";

  ?>
</body>

</html>