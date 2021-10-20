// use a legend to decipher the compressed dictionary strings
var legend = [
  ["`", "eD"],
  ["~", "inG"],
  ["1", "erS"],
  ["!", "eS"],
  ["2", "eR"],
  ["@", "tS"],
  ["3", "Si"],
  ["#", "es"],
  ["4", "nS"],
  ["$", "lY"],
  ["5", "lE"],
  ["%", "So"],
  ["6", "ra"],
  ["^", "tE"],
  ["7", "nG"],
  ["&", "la"],
  ["8", "RS"],
  ["*", "iC"],
  ["9", "lS"],
  ["(", "in"],
  ["0", "aL"],
  [")", "ea"],
  ["-", "en"],
  ["_", "dS"],
  ["=", "ma"],
  ["+", "ta"],
  ["[", "rS"],
  ["{", "oN"],
  ["]", "sE"],
  ["}", "er"],
  ["|", "li"],
  [";", "uS"],
  [":", "kS"],
  ["'", "ic"],
  [",", "ch"],
  ["<", "sT"],
  [".", "gS"],
  [">", "eN"],
  ["/", "sH"],
  ["?", "na"],
];
for (var y = 4; y < 9; y++) {
  var str = dict[y];
  for (var x = 0; x < 40; x++) {
    var esc = isNaN(parseFloat(legend[x][0])) ? "\\" : "";
    var pattern = new RegExp(esc + legend[x][0], "g");
    str = str.replace(pattern, legend[x][1]);
  }
  dict[y] = str;
}

// build the replacer for the dictionary builder
function buildRplcr(lvl) {
  var str = '"';
  for (var x = 1; x < lvl; x++) {
    str += "}";
  }
  str += ',"$1';
  for (var x = 2; x < lvl + 1; x++) {
    str += '":{"$' + x + "";
  }
  str += '":"';
  return str;
}

// build the pattern for the dictionary builder
function buildPtrn(lvl) {
  var str = '""([a-z])":';
  for (var x = 1; x < lvl; x++) {
    str += '{"([a-z])":';
  }
  str += '"';
  return new RegExp(str, "g");
}

// build each dictionary tree
for (var x = 4; x < 9; x++) {
  var str = dict[x]
    .replace(/([a-z])(?![A-Z])/g, '"$1":{')
    .replace(/([a-z])(?![^A-Z])/g, '"$1":');
  str =
    "{" +
    str
      .replace(/([A-Z]+)/g, '"$1"')
      .toLowerCase()
      .replace(/""([a-z])":"/g, '","$1":"');
  for (var y = 2; y < 8; y++) {
    if (x > y) {
      str = str.replace(buildPtrn(y), buildRplcr(y));
    }
  }
  for (var y = 1; y < x; y++) {
    str += "}";
  }
  dict[x] = JSON.parse(str);
}

// check if the root exists in the given tree
function rootExists(w, t) {
  var test = dict[t][w[0]],
    len = w.length;
  for (var i = 2; i < 8; i++) {
    if (len > i) {
      if (test[w[i - 1]]) {
        test = test[w[i - 1]];
      } else {
        return false;
      }
    }
  }
  if (len == t) {
    if (test.indexOf(w[len - 1]) != -1) {
      return true;
    }
  } else if (len > 1) {
    if (test[w[len - 1]]) {
      return true;
    }
  } else {
    return true;
  }
  return false;
}

// builder function
function builder(options, callback) {
  // set up our vars
  var lv = {
      a: 1,
      b: 4,
      c: 4,
      d: 2,
      e: 1,
      f: 4,
      g: 3,
      h: 3,
      i: 1,
      j: 10,
      k: 5,
      l: 2,
      m: 4,
      n: 2,
      o: 1,
      p: 4,
      q: 10,
      r: 1,
      s: 1,
      t: 1,
      u: 2,
      v: 5,
      w: 4,
      x: 8,
      y: 3,
      z: 10,
    },
    bp = options.bp,
    bt = options.bt,
    wl = {},
    wrds = [],
    ph = {},
    pht = { 1: options.t },
    root = {};

  // check if the word or root exists in applicable trees
  // also record words if they are a full word
  function checkRoot(l) {
    var r = root[l];
    if (l > 3) {
      if (!wl[r] && rootExists(r, l)) {
        wl[r] = 0;
      }
    }
    if (rootExists(r, 8)) {
      return true;
    } else if (l < 7) {
      if (rootExists(r, 7)) {
        return true;
      } else if (l < 6) {
        if (rootExists(r, 6)) {
          return true;
        } else if (l < 5) {
          if (rootExists(r, 5)) {
            return true;
          } else if (l < 4) {
            if (rootExists(r, 4)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // build and check the possible word roots
  function buildAndCheck(x, y) {
    for (ph[x] = 0; ph[x] < y; ph[x]++) {
      if (x == 1) {
        root[x] = pht[1][ph[1]];
      } else {
        root[x] = root[x - 1] + pht[x][ph[x]];
      }
      if (x == 8) {
        if (!wl[root[8]] && rootExists(root[8], 8)) {
          wl[root[8]] = 0;
        }
      } else {
        if (checkRoot(x)) {
          pht[x + 1] = pht[x].substring(0, ph[x]) + pht[x].substring(ph[x] + 1);
          buildAndCheck(x + 1, y - 1);
        }
      }
    }
  }

  // run the build and check function
  buildAndCheck(1, 12);

  // calculate how many points each word is worth
  $.each(wl, function (w, p) {
    var lp,
      len = w.length;
    for (y = 0; y < len; y++) {
      lp = lv[w[y]];
      if (bp == y + 1 && (bt == "DL" || bt == "TL")) {
        if (bt == "DL") {
          lp = lp * 2;
        } else {
          lp = lp * 3;
        }
      }
      p = p + lp;
    }
    if (bp <= len && (bt == "DW" || bt == "TW")) {
      if (bt == "DW") {
        p = p * 2;
      } else {
        p = p * 3;
      }
    }
    wrds.push([w, p]);
  });

  // sort the words by score if there are any
  if (wrds.length) {
    wrds = wrds.sort(function (a, b) {
      return b[1] - a[1];
    });
  }

  // execute the callback
  callback(wrds);
}

// solver function
function solver() {
  // reset the letter board
  $(".prob")
    .html("0%")
    .closest(".letter-prob")
    .removeClass("known")
    .removeClass("suggested");

  // check if the word has been solved
  if (
    $("#solver-slots input:visible").filter(function () {
      return this.value == "";
    }).length == 0
  ) {
    $("#solver .status").html("Success! The word has been solved.");
    return true;
  }

  // set up our vars
  var cnts = {
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      f: 0,
      g: 0,
      h: 0,
      i: 0,
      j: 0,
      k: 0,
      l: 0,
      m: 0,
      n: 0,
      o: 0,
      p: 0,
      q: 0,
      r: 0,
      s: 0,
      t: 0,
      u: 0,
      v: 0,
      w: 0,
      x: 0,
      y: 0,
      z: 0,
    },
    abc = "abcdefghijklmnopqrstuvwxyz",
    slen = $("#solver-slots input:visible").length,
    slot = [],
    perc = [],
    xyz = abc,
    wrds = 0,
    tkr = {},
    lmt = {},
    bot = {};

  // update word and letter counts if word exists
  function record(mo) {
    // get the word and make sure it exists
    var w = bot[mo],
      a = [];
    if (!rootExists(w, slen)) {
      return false;
    }

    // remove duplicate letters
    for (var un = 0; un < slen; un++) {
      for (var vn = un + 1; vn < slen; vn++) {
        if (w[un] === w[vn]) {
          vn = ++un;
        }
      }
      a.push(w[un]);
    }

    // update word and letter counts
    for (var x = 0, xx = a.length; x < xx; x++) {
      cnts[a[x]]++;
    }
    wrds++;
  }

  // check possible combinations against our dictionary
  function checkCombos(x) {
    for (tkr[x] = 0, lmt[x] = slot[x].length; tkr[x] < lmt[x]; tkr[x]++) {
      if (x == 0) {
        bot[0] = slot[0][tkr[0]];
      } else {
        bot[x] = bot[x - 1] + slot[x][tkr[x]];
      }
      if (x < 3) {
        if (rootExists(bot[x], slen)) {
          checkCombos(x + 1);
        }
      } else if (slen > x + 1 && rootExists(bot[x], slen)) {
        if (x == 7) {
          record(7);
        } else {
          checkCombos(x + 1);
        }
      } else if (slen == x + 1) {
        record(x);
      }
    }
  }

  // get our known clues
  $("#solver-slots input")
    .filter(function () {
      return this.value != "";
    })
    .each(function () {
      $("#l-" + $(this).val().toLowerCase()).addClass("known");
      slot[$(this).attr("id").substr(4) * 1 - 1] = $(this).val().toLowerCase();
    });

  // get the full list of possible letters
  $(".letter-prob.strike,.letter-prob.known").each(function () {
    xyz = xyz.replace("" + $(this).find(".letter").text().toLowerCase(), "");
  });

  // get the list of possible letters for each clue slot
  $("#solver-slots input:visible")
    .filter(function () {
      return this.value == "";
    })
    .each(function () {
      if (
        $(this).nextAll("input:visible").length ==
        $(this)
          .nextAll("input:visible")
          .filter(function () {
            return this.value == "";
          }).length
      ) {
        slot[parseFloat($(this).attr("id").substr(4)) - 1] = xyz.replace(
          /[aeiou]/g,
          ""
        );
      } else {
        slot[parseFloat($(this).attr("id").substr(4)) - 1] = xyz;
      }
    });

  // run the check combos function
  checkCombos(0);

  // show the results
  if (wrds > 0) {
    // delete the undefined "letter"
    delete cnts["undefined"];

    // display letter probabilities
    $.each(cnts, function (letr, cont) {
      $("#l-" + letr)
        .find(".prob")
        .html(Math.round((cont / wrds) * 1000) / 10 + "%");
      if (!$("#l-" + letr).hasClass("known")) {
        perc.push([letr, cont]);
      }
    });

    // highlight the most likely letter
    if (perc.length > 0) {
      perc = perc.sort(function (a, b) {
        return b[1] - a[1];
      });
      $("#l-" + perc[0][0]).addClass("suggested");
    }

    // show the number of possible words
    $("#solver .status").html("<b>" + wrds + "</b> possible words...");
  } else {
    $("#solver .status").html(
      "No words found. Double check strikes and known slots."
    );
  }
}

// define our binds
$(function () {
  // choosing a bonus position
  $(".bonus-position").click(function () {
    var btl, oldPos;
    if ($(this).attr("id") === "bp-x") {
      if ($(".bonus-position.selected").length > 0) {
        $("#bonus-type-container").hide();
        oldPos = $(".bonus-position.selected").attr("id").substring(3);
        $(".bonus-position.selected").removeClass("selected").text(oldPos);
      }
      $("#tray").val("");
      $("#builder .status").html(
        "Press enter once you have entered your tray to view possible words."
      );
      $("#builder .results").empty();
    } else {
      if ($(this).siblings(".selected").length > 0) {
        oldPos = $(".bonus-position.selected").attr("id").substring(3);
        $(".bonus-position.selected").removeClass("selected").text(oldPos);
      }
      var pos = $(this).attr("id").substring(3);
      switch (pos) {
        case "1":
          btl = 2;
          break;
        case "2":
          btl = 44;
          break;
        case "3":
          btl = 86;
          break;
        case "4":
          btl = 128;
          break;
        case "5":
          btl = 170;
          break;
        case "6":
          btl = 212;
          break;
        case "7":
          btl = 254;
          break;
        case "8":
          btl = 296;
      }
      $("#bonus-type-container")
        .show()
        .css("left", btl + "px");
      $(this).addClass("selected");
    }
  });

  // choosing a bonus type
  $(".bonus-type").click(function () {
    var bt = $(this).text();
    $(".bonus-position.selected").text(bt);
    $("#bonus-type-container").hide();
    $("#tray").select();
  });

  // run the builder on form submit
  $("#builder form").submit(function (e) {
    e.preventDefault();
    if (
      $("#tray").val().length == 12 &&
      $(".bonus-position.selected").length == 1 &&
      $(".bonus-position.selected").text().length == 2
    ) {
      builder(
        {
          t: $("#tray").val().toLowerCase(),
          bp: parseFloat($(".bonus-position.selected").attr("id").substring(3)),
          bt: $(".bonus-position.selected").text(),
        },
        function (wrds) {
          wlen = wrds.length;
          if (wlen) {
            var res = "";
            for (x = 0; x < wlen; x++) {
              res +=
                '<div class="word-score"><div class="score">' +
                wrds[x][1] +
                '</div><div class="word">' +
                wrds[x][0] +
                "</div></div>";
            }
            $("#builder .results").html(res);
            $("#builder .status").html(
              "Found <b>" + wlen + "</b> possible words."
            );
          } else {
            $("#builder .status").html(
              "No words could be formed. Double check your tray."
            );
          }
        }
      );
    } else {
      $("#builder .status").html(
        "Please select a bonus and enter all 12 letters of the tray."
      );
    }
  });

  // choosing a word length
  $(".word-length").click(function () {
    $("#solver-slots input").val("");
    $("#solver .status").html(
      "Probabilities will update automatically. Click on a letter to mark it as a strike."
    );
    $(".letter-prob")
      .removeClass("strike")
      .removeClass("suggested")
      .removeClass("known")
      .find(".prob")
      .html("0%");
    $(this)
      .siblings(".selected")
      .removeClass("selected")
      .end()
      .addClass("selected");
    switch ($(this).attr("id").substring(3)) {
      case "4":
        $("#slot5,#slot6,#slot7,#slot8").hide();
        break;
      case "5":
        $("#slot5").show();
        $("#slot6,#slot7,#slot8").hide();
        break;
      case "6":
        $("#slot5,#slot6").show();
        $("#slot7,#slot8").hide();
        break;
      case "7":
        $("#slot5,#slot6,#slot7").show();
        $("#slot8").hide();
        break;
      case "8":
        $("#slot5,#slot6,#slot7,#slot8").show();
        break;
    }
    $("#slot1").select();
  });

  // resetting the solver
  $("#wl-x").click(function () {
    $("#wl-8")
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
    $("#slot5,#slot6,#slot7,#slot8").show();
    $("#solver-slots input").val("");
    $("#solver .status").html(
      "Probabilities will update automatically. Click on a letter to mark it as a strike."
    );
    $(".letter-prob")
      .removeClass("strike")
      .removeClass("suggested")
      .removeClass("known")
      .find(".prob")
      .html("0%");
  });

  // make sure they only use letters
  $("input").change(function () {
    $(this).val(
      $(this)
        .val()
        .replace(/[^a-z]/g, "")
    );
  });

  // keyboard actions: clue slot navigation, marking a letter as a strike, and running the solver
  $("#solver input").keyup(function (e) {
    if (e.keyCode === 37) {
      $(this).prev().select();
    } else if (e.keyCode === 39) {
      $(this).next().select();
    } else if (
      (e.keyCode >= 65 && e.keyCode <= 90) ||
      [8, 16, 46].indexOf(e.keyCode) > -1
    ) {
      if (e.keyCode === 16) {
        $(".letter-prob.suggested").addClass("strike").removeClass("suggested");
      }
      $("#solver .status").html("Thinking...");
      solver();
    }
  });

  // marking or unmarking a letter as a strike with the mouse
  $(".letter-prob").click(function () {
    if (!$(this).hasClass("known")) {
      if ($(this).hasClass("strike")) {
        $(this).removeClass("strike");
      } else {
        $(this).addClass("strike");
      }
      $("#solver .status").html("Thinking...");
      $("#slot1").select();
      solver();
    }
  });

  // disable the default submit
  $("#solver form").submit(function (e) {
    e.preventDefault();
  });
});
