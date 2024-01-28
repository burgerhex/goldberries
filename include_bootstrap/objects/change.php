<?php

class Change extends DbObject
{
  public static string $table_name = 'change';

  public ?int $campaign_id = null;
  public ?int $map_id = null;
  public ?int $challenge_id = null;
  public ?int $player_id = null;
  public string $description;
  public JsonDateTime $date;

  // Linked Objects
  public ?Campaign $campaign = null;
  public ?Map $map = null;
  public ?Challenge $challenge = null;
  public ?Player $player = null;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'campaign_id' => $this->campaign_id,
      'map_id' => $this->map_id,
      'challenge_id' => $this->challenge_id,
      'player_id' => $this->player_id,
      'description' => $this->description,
      'date' => $this->date,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->description = $arr[$prefix . 'description'];
    $this->date = new JsonDateTime($arr[$prefix . 'date']);

    if (isset($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
    if (isset($arr[$prefix . 'map_id']))
      $this->map_id = intval($arr[$prefix . 'map_id']);
    if (isset($arr[$prefix . 'challenge_id']))
      $this->challenge_id = intval($arr[$prefix . 'challenge_id']);
    if (isset($arr[$prefix . 'player_id']))
      $this->player_id = intval($arr[$prefix . 'player_id']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($this->campaign_id !== null) {
      $this->campaign = Campaign::get_by_id($DB, $this->campaign_id);
    }
    if ($this->map_id !== null) {
      $this->map = Map::get_by_id($DB, $this->map_id);
    }
    if ($this->challenge_id !== null) {
      $this->challenge = Challenge::get_by_id($DB, $this->challenge_id);
    }
    if ($this->player_id !== null) {
      $this->player = Player::get_by_id($DB, $this->player_id);
    }
  }

  // === Find Functions ===
  static function get_all_for_object($DB, $type, $id)
  {
    $where = "{$type}_id = $1";
    $arr = array($id);
    $logs = find_in_db($DB, Change::$table_name, $where, $arr, new Change());
    if ($logs === false)
      return false;

    return $logs;
  }

  // === Utility Functions ===
  function __toString()
  {
    $dateStr = date_to_long_string($this->date);

    $linkedObjectType = null;
    $linkedObjectId = null;

    if ($this->campaign_id !== null) {
      $linkedObjectType = 'campaign';
      $linkedObjectId = $this->campaign_id;
    } else if ($this->map_id !== null) {
      $linkedObjectType = 'map';
      $linkedObjectId = $this->map_id;
    } else if ($this->challenge_id !== null) {
      $linkedObjectType = 'challenge';
      $linkedObjectId = $this->challenge_id;
    } else if ($this->player_id !== null) {
      $linkedObjectType = 'player';
      $linkedObjectId = $this->player_id;
    }

    return "(Change, id:{$this->id}, description:'{$this->description}', date:{$dateStr}, objType:{$linkedObjectType}, objId:{$linkedObjectId})";
  }

  static function create_change($DB, string $type, int $id, string $description)
  {
    $change = new Change();
    $change->description = $description;
    $change->date = new JsonDateTime();

    switch ($type) {
      case 'campaign':
        $change->campaign_id = $id;
        break;
      case 'map':
        $change->map_id = $id;
        break;
      case 'challenge':
        $change->challenge_id = $id;
        break;
      case 'player':
        $change->player_id = $id;
        break;
    }

    if ($change->insert($DB)) {
      return $change;
    } else {
      return false;
    }
  }
}
