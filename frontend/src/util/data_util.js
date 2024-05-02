import { lightTheme } from "../App";
import { jsonDateToJsDate } from "./util";

export function getChallengeIsFullGame(challenge) {
  return challenge.map === null;
}
export function getChallengeCampaign(challenge) {
  if (challenge === null) return null;
  return challenge.map?.campaign ?? challenge.campaign;
}

export function getChallengeFcShort(challenge, noC = false) {
  if (challenge.requires_fc) return "[FC]";
  else if (challenge.has_fc) return "[C/FC]";
  else return noC ? "" : "[C]";
}
export function getChallengeFcLong(challenge) {
  if (challenge.requires_fc) return "Full Clear";
  else if (challenge.has_fc) return "Regular/Full Clear";
  else return "Regular Clear";
}

export function getChallengeObjectiveSuffix(challenge) {
  if (challenge.objective.display_name_suffix === null) return "";
  return " " + challenge.objective.display_name_suffix;
}

export function getChallengeName(challenge, includeFc = true) {
  const isOld = challenge.map?.is_archived ?? false;
  const oldPrefix = isOld ? "[Old] " : "";
  const challengeFc = includeFc ? getChallengeFcLong(challenge) + ": " : "";
  const challengeDescriptionSuffix = challenge.description === null ? "" : " [" + challenge.description + "]";
  return (
    oldPrefix +
    challengeFc +
    challenge.objective.name +
    getChallengeObjectiveSuffix(challenge) +
    challengeDescriptionSuffix
  );
}

export function getChallengeDescription(challenge) {
  return challenge.description === null ? "" : challenge.description;
}

export function getChallengeNameShort(challenge) {
  const isOld = challenge.map?.is_archived ?? false;
  const oldPrefix = isOld ? "[Old] " : "";
  return (
    oldPrefix +
    challenge.objective.name +
    " " +
    getChallengeFcShort(challenge) +
    getChallengeObjectiveSuffix(challenge)
  );
}

export function getChallengeIsArbitrary(challenge) {
  return challenge.is_arbitrary === null ? challenge.objective.is_arbitrary : challenge.is_arbitrary;
}

export function getDifficultyName(difficulty) {
  let subtierPrefix = difficulty.subtier === null ? "" : difficulty.subtier + " ";
  //capitalize first letter
  subtierPrefix = subtierPrefix.charAt(0).toUpperCase() + subtierPrefix.slice(1);
  return subtierPrefix + difficulty.name;
}

export function getChallengeFlags(challenge) {
  const flags = [];
  if (challenge.requires_fc) flags.push("Full Clear");
  else if (challenge.has_fc) flags.push("Clear / Full Clear");
  else flags.push("Regular Clear");
  if (challenge.is_arbitrary !== null && (challenge.id_arbitrary || challenge.objective.is_arbitrary))
    flags.push("Arbitrary");
  return flags;
}

export function displayDate(dateObj) {
  if (dateObj === null || dateObj === undefined) return "<Unknown Date>";
  return jsonDateToJsDate(dateObj).toLocaleDateString();
}

export function getGamebananaEmbedUrl(url) {
  //urls look like: https://gamebanana.com/mods/409812
  if (!url.startsWith("https://gamebanana.com/mods/")) {
    return null;
  }
  const split = url.split("/");
  if (split.length !== 5) {
    return null;
  }
  const id = split[4];

  //Make the embed url: https://gamebanana.com/mods/embeddables/<id>?type=medium
  return "https://gamebanana.com/mods/embeddables/" + id + "?type=medium";
}

export function getMapAuthor(map) {
  if (map.author_gb_name === null) {
    return {
      name: map.campaign?.author_gb_name,
      id: map.campaign?.author_gb_id,
    };
  }
  return {
    name: map.author_gb_name,
    id: map.author_gb_id,
  };
}

export function getMapLobbyInfo(map, campaign = null) {
  campaign = campaign || map.campaign;

  const hasMajor = campaign.sort_major_name !== null && map.sort_major !== null;
  const hasMinor = campaign.sort_minor_name !== null && map.sort_minor !== null;

  const lobbyInfo = {};

  if (hasMajor) {
    lobbyInfo.major = {
      name: campaign.sort_major_name,
      label: campaign.sort_major_labels[map.sort_major],
      color: campaign.sort_major_colors[map.sort_major],
    };
  }

  if (hasMinor) {
    lobbyInfo.minor = {
      name: campaign.sort_minor_name,
      label: campaign.sort_minor_labels[map.sort_minor],
      color: campaign.sort_minor_colors[map.sort_minor],
    };
  }

  return lobbyInfo;
}

export function getMapName(map, campaign, includeMapWithSide = true) {
  campaign = campaign || map.campaign;

  if (map === null || map === undefined) {
    //For full game runs
    return campaign.name;
  }

  const mapName =
    (map.name === "A-Side" || map.name === "B-Side" || map.name === "C-Side" || map.name === "D-Side") &&
    includeMapWithSide
      ? campaign.name + " " + map.name
      : map.name;

  const isOld = map.is_archived ?? false;
  const oldPrefix = isOld ? "[Old] " : "";

  return oldPrefix + mapName;
}

export function getSubmissionVerifier(submission) {
  if (submission.is_verified === null) {
    return null;
  }
  if (submission.verifier) {
    return {
      name: submission.verifier.name,
      id: submission.verifier.id,
    };
  }
  return {
    name: "Molden Team",
    id: null,
  };
}

export function getObjectiveName(objective) {
  const arbitrarySuffix = objective.is_arbitrary ? " (A)" : "";
  return objective.name + arbitrarySuffix;
}

export function getCampaignName(campaign, noAuthor = false) {
  if (noAuthor) return campaign.name;
  const authorName = campaign.author_gb_name === null ? "<Unknown Author>" : campaign.author_gb_name;
  return campaign.name + " (by " + authorName + ")";
}

export function getAccountName(account) {
  if (account.player !== null) {
    return `(${account.id}) ${account.player.name}`;
  } else if (account.claimed_player !== null) {
    return `(${account.id}) [Claim] ${account.claimed_player.name}`;
  }

  return `(${account.id}) <no player>`;
}

export function getPlayerNameColorStyle(player, settings = null) {
  if (
    player === null ||
    player === undefined ||
    (settings !== null && settings.visual.playerNames.showColors === false)
  ) {
    return {};
  }
  const hasColor = player.account.name_color_start !== null && player.account.name_color_start !== undefined;
  const nameColorStart = player.account.name_color_start ?? "#000000";
  let nameColorEnd = player.account.name_color_end ?? nameColorStart;
  if (settings !== null && settings.visual.playerNames.preferSingleOverGradientColor) {
    nameColorEnd = nameColorStart;
  }
  let contrastColorStart = lightTheme.palette.getContrastText(nameColorStart);
  let contrastColorEnd = lightTheme.palette.getContrastText(nameColorEnd);
  const outlineColor = contrastColorStart === contrastColorEnd ? contrastColorStart : "rgba(0, 0, 0, 0.87)";
  // const outlineColor = contrastColorStart;
  const outline = settings?.visual.playerNames.showOutline
    ? "drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px)"
    : "";
  const style = hasColor
    ? {
        backgroundImage: "linear-gradient(90deg, " + nameColorStart + " 0%, " + nameColorEnd + " 100%)",
        backgroundOrigin: "padding-box",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        fontWeight: "bold",
        filter: outline,
      }
    : {};

  return style;
}

export function getSortedSuggestedDifficulties(challenge) {
  let allSuggestedDiffs = challenge.submissions.map((submission) => submission.suggested_difficulty);
  allSuggestedDiffs = allSuggestedDiffs.filter((diff) => diff !== null);

  const difficulties = {}; // count of each difficulty
  allSuggestedDiffs.forEach((diff) => {
    if (difficulties[diff.id] === undefined) {
      difficulties[diff.id] = {
        difficulty: diff,
        value: 1,
      };
    } else {
      difficulties[diff.id].value += 1;
    }
  });
  //Sort difficulties by count DESC
  const sortedDifficulties = Object.entries(difficulties).map(([id, value]) => {
    return {
      difficulty: value.difficulty,
      value: value.value,
    };
  });
  sortedDifficulties.sort((a, b) => b.value - a.value);
  return sortedDifficulties;
}
