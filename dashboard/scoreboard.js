let playerStatus = {};

function updateRanking(player, index) {
  const playerKey = player.Username;
  let changeIcon = '';
  let playerData = playerStatus[playerKey];

  if (playerData) {
    if (index < playerData.previousIndex) {
      changeIcon = ' ⬆️'; 
    } else if (index > playerData.previousIndex) {
      changeIcon = ' ⬇️'; 
    }
    playerData.previousIndex = index; 
  } else {
    playerStatus[playerKey] = { previousIndex: index };
  }

  return changeIcon;
}

function fetchDataAndUpdateScoreboard() {
  fetch('http://localhost:5000/data')
    .then(response => response.json())
    .then(data => {
      const scoreboardBody = document.querySelector('#scoreboard tbody');
      scoreboardBody.innerHTML = '';

      data.forEach((player, index) => {
        let row = scoreboardBody.insertRow();
        let rank = row.insertCell(0);
        let name = row.insertCell(1);
        let score = row.insertCell(2);
        let level = row.insertCell(3);
        let losses = row.insertCell(4);
        let duration = row.insertCell(5);

        rank.innerHTML = `#${index + 1}`;
        name.innerHTML = player.Username + updateRanking(player, index);
        score.innerHTML = player['Top Score'];
        level.innerHTML = player['Top Level'];
        losses.innerHTML = player['Total Losses'];
        duration.innerHTML = player['Longest Duration'];

        rank.classList.add('rank');
        name.classList.add('name');
        score.classList.add('score');
        level.classList.add('level');
        losses.classList.add('losses');
        duration.classList.add('duration');
      });

      Object.keys(playerStatus).forEach(playerKey => {
        if (!data.some(player => player.Username === playerKey)) {
          delete playerStatus[playerKey]; 
        } else {
          let currentPlayer = data.find(player => player.Username === playerKey);
          playerStatus[playerKey].previousIndex = data.indexOf(currentPlayer);
        }
      });
    })
    .catch(error => console.error('Error loading the data:', error));
}

document.addEventListener('DOMContentLoaded', function() {
  fetchDataAndUpdateScoreboard();
  setInterval(fetchDataAndUpdateScoreboard, 5000);
});
