<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'];
  $difficulties = Difficulty::get_request($DB, $id);
  api_write($difficulties);
}
