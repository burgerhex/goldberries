//Assumes that the challenge has foreign keys fully expanded
// export function getChallengeName(campaign, map, challenge) {
//   const objectiveSuffix = getChallengeObjectiveSuffix(challenge);
//   if (challenge.campaign_id !== null) {
//     return campaign.name + " - " + challenge.description + objectiveSuffix;
//   }
//   const fc = getChallengeFcAddition(challenge);
//   const campaignPre = campaign.name === map.name ? "" : campaign.name + " - ";
//   return campaignPre + map.name + objectiveSuffix + fc;
// }

import { jsonDateToJsDate } from "./util";

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

export function getChallengeName(challenge) {
  return (
    getChallengeFcLong(challenge) + ": " + challenge.objective.name + getChallengeObjectiveSuffix(challenge)
  );
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

export function getMapLobbyInfo(map) {
  const hasMajor = map.campaign.sort_major_name !== null && map.sort_major !== null;
  const hasMinor = map.campaign.sort_minor_name !== null && map.sort_minor !== null;

  const lobbyInfo = {};

  if (hasMajor) {
    lobbyInfo.major = {
      name: map.campaign.sort_major_name,
      label: map.campaign.sort_major_labels[map.sort_major],
      color: map.campaign.sort_major_colors[map.sort_major],
    };
  }

  if (hasMinor) {
    lobbyInfo.minor = {
      name: map.campaign.sort_minor_name,
      label: map.campaign.sort_minor_labels[map.sort_minor],
      color: map.campaign.sort_minor_colors[map.sort_minor],
    };
  }

  return lobbyInfo;
}

export function getSubmissionVerifier(submission) {
  if (!submission.is_verified && !submission.is_rejected) {
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
