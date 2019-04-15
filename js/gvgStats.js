"use strict";

var playerData = [];

$(function(){

  readJSON();

});

function readJSON() {
  var data = $.getJSON("js/gvgData.json", function( json ) {
    json.guildMembers.forEach( function(player) {
      initMember(player);
    });

    json.wars.forEach( function(war) {
      war.participants.forEach( function(player) {
        updatePlayer(player.name, player.attack1, player.attack2);
      });
    });

    calculateEfficiency();
    sortByEfficiency();
    updateTable();
  });
}

function initMember (name) {
  var newPlayer = { name: name, warsFought: 0, starsWon: 0, pointsEarned: 0 };
  playerData.push(newPlayer);
}

function updatePlayer (name, attack1, attack2) {
  var index = searchPlayer(name);
  if (index === -1) {
    return; // Skipping participants who aren't guild members anymore
  }
  else {
    playerData[index].warsFought += 1;
    playerData[index].starsWon += attack1.stars + attack2.stars;
    playerData[index].pointsEarned += countPoints(attack1, attack2);
  }
}

function searchPlayer(name) {
  for (var i = 0; i < playerData.length; ++i) {
    if (playerData[i].name === name)  {
      return i;
    }
  }
  return -1; // not found
}

function countPoints(attack1, attack2) {
  var points = 0;

  points += attack1.stars * pointMultiplier(attack1.target);
  points += attack2.stars * pointMultiplier(attack2.target);

  return points;
}

function pointMultiplier(enemyRank) {
  var multiplier = 1;

  if (enemyRank <= 3) {
    multiplier = 5;
  }
  else if (enemyRank <= 5) {
    multiplier = 4;
  }
  else if (enemyRank <= 10) {
    multiplier = 3;
  }
  else if (enemyRank <= 20) {
    multiplier = 2;
  }

  return multiplier;
}

function calculateEfficiency() {
  playerData.forEach( function(player) {
    if (player.warsFought === 0) {
      player.efficiency = 0;
      player.pointAverage = 0;
    }
    else {
      player.efficiency = Math.round(player.starsWon / player.warsFought / 6 * 100);
      player.pointAverage = Math.round(player.pointsEarned / player.warsFought);
    }
  });
}

function sortByEfficiency() {
  playerData.sort(function(playerA, playerB) {
    // Comparing point averages if star efficiency identical
    if (playerA.efficiency === playerB.efficiency) {
      if (playerA.pointAverage < playerB.pointAverage) {
        return true;
      }
      else {
        return false;
      }
    }
    // star efficiency comparison
    if (playerA.efficiency < playerB.efficiency) {
      return true;
    }
    else {
      return false;
    }
  });
}

function updateTable() {
  playerData.forEach( function(player) {
    var cellName = $("<td></td>").text(player.name);
    var cellWars = $("<td class='center'></td>").text(player.warsFought);
    var cellStars = $("<td class='center'></td>").text(player.starsWon);
    var cellEfficiency = $("<td class='center'></td>").text(player.efficiency + "%");
    var cellPoints = $("<td class='center'></td>").text(player.pointsEarned);
    var cellPointAvg = $("<td class='center'></td>").text(player.pointAverage);

    var tableRow = $("<tr></tr>").append(cellName, cellWars, cellStars, cellEfficiency,
                                         cellPoints, cellPointAvg);
    $("#gvgTable").append(tableRow);
  });
}
