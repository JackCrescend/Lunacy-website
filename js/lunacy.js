const buttons = document.querySelectorAll(".navList a");
const pages = document.querySelectorAll("#contents > div");

const sortPlayerName = document.querySelector("#sortPlayerName");
const sortWarsFought = document.querySelector("#sortWarsFought");
const sortStarsTotal = document.querySelector("#sortStarsTotal");
const sortStarsPercentage = document.querySelector("#sortStarsPercentage");
const sortPointsTotal = document.querySelector("#sortPointsTotal");
const sortPointsAverage = document.querySelector("#sortPointsAverage");
const filterCheck = document.querySelector("#filterCheck");

/********************/
/* HELPER FUNCTIONS */
/********************/

const toggleButton = buttonID => {
  for (let button of buttons) {
    button.className = "";
  }
  document.querySelector(buttonID).className = "active";
};

const showPage = pageID => {
  console.log(pages);
  for (let page of pages) {
    page.className = "hidden";
  }
  document.querySelector(pageID).className = "";
};

/*****************/
/* START-UP CODE */
/*****************/

const gvgData = [];

fetch("/js/gvgData.json")
  .then(response => response.json())
  .then(data => {
    sortData(data);
  });

frontpageButton.addEventListener('click', function(e) {
  e.preventDefault();
  toggleButton("#frontpageButton");
  showPage("#frontpage");
});

leaderboardButton.addEventListener('click', function(e) {
  e.preventDefault();
  toggleButton("#leaderboardButton");
  showPage("#leaderboard");
});

sortPlayerName.addEventListener('click', function(e) {
  sortArrayBy("name");
});

sortWarsFought.addEventListener('click', function(e) {
  sortArrayBy("warsFought");
});

sortStarsTotal.addEventListener('click', function(e) {
  sortArrayBy("starsEarned");
});

sortStarsPercentage.addEventListener('click', function(e) {
  sortArrayBy("starPercentage");
});

sortPointsTotal.addEventListener('click', function(e) {
  sortArrayBy("pointsEarned");
});

sortPointsAverage.addEventListener('click', function(e) {
  sortArrayBy("pointAverage");
});

filterCheck.addEventListener('click', function(e) {
  updateView();
});

/********************/
/* LEADERBOARD CODE */
/********************/

function sortData (data) {
  console.log(data);

  for (let war of data.wars) {
    for (let player of war.participants) {
      let starsEarned = player.attack1.stars + player.attack2.stars;
      let pointsEarned = countPoints(player.attack1.target, player.attack1.stars);
      pointsEarned += countPoints(player.attack2.target, player.attack2.stars);
      let skipped = (player.attack1.target === 31 && player.attack2.target === 31);

      addPlayerData(player.name, starsEarned, pointsEarned, skipped);
    }
  }

  addMemberStatus(data.guildMembers);

  calculateAverages();

  sortArrayBy("warsFought");

  document.querySelector("#gridMessage").innerHTML= `Last updated:<br>${data.lastUpdated}`;

  console.log(gvgData);
}

function countPoints(target, stars) {

  if (target >= 31 || stars === 0) {
    return 0;
  }

  let multiplier = 1;
  if (target <= 3) {
    multiplier = 5;
  } else if (target <= 5) {
    multiplier = 4;
  } else if (target <= 10) {
    multiplier = 3;
  } else if (target <= 20) {
    multiplier = 2;
  }

  return stars * multiplier;
}

function findPlayer(name) {
  for (let i = 0; i < gvgData.length; i++) {
    if (gvgData[i].name === name) {
      return i;
    }
  }
  return -1;
}

function addPlayerData(name, starsEarned, pointsEarned, skipped) {
  let playerIndex = findPlayer(name);
  if (playerIndex === -1) {
    playerIndex = gvgData.length;
    createPlayer(name);
  }

  if (skipped) {
    gvgData[playerIndex].warsSkipped += 1;
  }

  gvgData[playerIndex].warsFought += 1;
  gvgData[playerIndex].starsEarned += starsEarned;
  gvgData[playerIndex].pointsEarned += pointsEarned;
}

function createPlayer(name) {
  let player = {
    name: name,
    member: false,
    warsFought: 0,
    warsSkipped: 0,
    starsEarned: 0,
    pointsEarned: 0,
    starPercentage: 0.0,
    pointAverage: 0.0
  }

  gvgData.push(player);
}

function addMemberStatus(members) {
  for (let name of members) {
    let playerIndex = findPlayer(name);
    if (playerIndex === -1) {
      playerIndex = gvgData.length;
      createPlayer(name);
    }
    gvgData[playerIndex].member = true;
  }
}

function calculateAverages () {
  for (let player of gvgData) {
    let {warsFought: wars, starsEarned: stars, pointsEarned: points} = player;
    if (wars === 0) {
      continue;
    }
    player.starPercentage = (stars / 6 / wars);
    player.pointAverage = (points / wars);
  }
}

function sortArrayBy (type) {

  if (type === "name") {
    gvgData.sort(function(player1, player2) {
      let a = player1.name.toLowerCase();
      let b = player2.name.toLowerCase();
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }
      return 0;
    });
  }

  gvgData.sort(function(a, b) { return (b[type] - a[type]) });
  updateView();
}

function updateView () {
  let table = "";
  let filter = filterCheck.checked;
  let counter = 0;
  let classString = "";

  for (let player of gvgData) {
    if (filter) {
      if (!player.member) {
        continue;
      }
    }

    counter += 1;
    if ((counter % 2) === 1) {
      classString = ` class="oddRow"`;
    } else {
      classString = ``;
    }

    table += `
      <p${classString}>${player.name}</p>
      <p${classString}>${player.warsFought}</p>
      <p${classString}>${player.starsEarned}</p>
      <p${classString}>${Math.round(player.starPercentage * 100)}%</p>
      <p${classString}>${player.pointsEarned}</p>
      <p${classString}>${Math.round(player.pointAverage)}</p>
    `;
  }

  document.querySelector(".dataGrid").innerHTML = table;
}