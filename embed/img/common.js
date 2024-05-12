function getCookie(name) {
  function escape(s) {
    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
  }
  var match = document.cookie.match(RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)"));
  return match ? match[1] : null;
}

function sel(selector) {
  return document.querySelector(selector);
}

const DIFFICULTIES = {
  //Tier 0
  1: { color: "#f874c6", group_color: "#f874c6", contrast_color: "#000000", name: "High Tier 0" },
  2: { color: "#ff97d8", group_color: "#f874c6", contrast_color: "#000000", name: "Mid Tier 0" },
  3: { color: "#fcb5e0", group_color: "#f874c6", contrast_color: "#000000", name: "Low Tier 0" },

  //Tier 1
  4: { color: "#ff7b67", group_color: "#ff7b67", contrast_color: "#000000", name: "High Tier 1" },
  5: { color: "#ff9989", group_color: "#ff7b67", contrast_color: "#000000", name: "Mid Tier 1" },
  6: { color: "#fcb6ab", group_color: "#ff7b67", contrast_color: "#000000", name: "Low Tier 1" },

  //Tier 2
  7: { color: "#ffc874", group_color: "#ffc874", contrast_color: "#000000", name: "High Tier 2" },
  8: { color: "#ffd595", group_color: "#ffc874", contrast_color: "#000000", name: "Mid Tier 2" },
  9: { color: "#f8dcb2", group_color: "#ffc874", contrast_color: "#000000", name: "Low Tier 2" },

  //Tier 3
  10: { color: "#ffec87", group_color: "#ffec87", contrast_color: "#000000", name: "High Tier 3" },
  11: { color: "#ffebb0", group_color: "#ffec87", contrast_color: "#000000", name: "Mid Tier 3" },
  12: { color: "#fbf3cf", group_color: "#ffec87", contrast_color: "#000000", name: "Low Tier 3" },
  13: { color: "#fff9e1", group_color: "#ffec87", contrast_color: "#000000", name: "Guard Tier 3" },

  //Tier 4
  14: { color: "#b0ff78", group_color: "#b0ff78", contrast_color: "#000000", name: "Tier 4" },

  //Tier 5
  15: { color: "#85e191", group_color: "#85e191", contrast_color: "#000000", name: "Tier 5" },

  //Tier 6
  16: { color: "#8fdeff", group_color: "#8fdeff", contrast_color: "#000000", name: "Tier 6" },

  //Tier 7
  17: { color: "#96a6ff", group_color: "#96a6ff", contrast_color: "#000000", name: "Tier 7" },

  //Standard
  18: { color: "#ffffff", group_color: "#ffffff", contrast_color: "#000000", name: "Standard" },

  //Undetermined
  19: { color: "#aaaaaa", group_color: "#ffffff", contrast_color: "#000000", name: "Undetermined" },
};