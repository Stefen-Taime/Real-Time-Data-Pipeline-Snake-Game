
const canvas = document.getElementById('snakeGame');
const ctx = canvas.getContext('2d');

let username; 

let speed = 5; 
const maxSpeed = 10; 

let level = 0; 
let losses = 0; 
let tileCount = 20;
let tileSize = canvas.width / tileCount - 2;
let headX = 10;
let headY = 10;
let snakeParts = [];
let tailLength = 2;

let appleX = 5;
let appleY = 5;

let xVelocity = 0;
let yVelocity = 0;
let score = 0; // Track the score
let startTime; // Track the start time of the game

function startGame() {
    username = document.getElementById('username').value;
    if (username) {
        startTime = Date.now(); 
        fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            document.getElementById('startScreen').style.display = 'none';
            canvas.style.display = 'block';
            canvas.focus();
            drawGame();
        })
        .catch(error => {
            alert(error.message);
        });
    } else {
        alert("Please enter your name!");
    }
}

function startGame() {
    username = document.getElementById('username').value;
    if (username) {
        startTime = Date.now(); 
        fetch('http://localhost:5000/register_or_login', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            if (data.userExists) {
                console.log('User exists, continuing game');
            }
            document.getElementById('startScreen').style.display = 'none';
            canvas.style.display = 'block';
            canvas.focus();
            drawGame();
        })
        .catch(error => {
            alert(error.message);
        });
    } else {
        alert("Please enter your name!");
    }
}



function drawGame() {
    changeSnakePosition();
    let result = isGameOver();
    if (result) {
        let endTime = Date.now();
        let durationInSeconds = (endTime - startTime) / 1000;
        saveGameOverData(score, level, durationInSeconds, losses); 
        return;
    
    }
    if (isGameOver()) {
        endGame();
        return;
    }
    clearScreen();
    checkAppleCollision();
    drawApple();
    drawSnake();
    setTimeout(drawGame, 1000 / speed);
}

function changeSnakePosition() {
    headX += xVelocity;
    headY += yVelocity;
}
function showReplayButton() {
    let replayButton = document.getElementById('replayButton');
    if (replayButton) {
        replayButton.style.display = 'block'; 
    } else {
        console.log("Bouton 'Play again' non trouvé");
    }
}

function endGame() {
    let endTime = Date.now();
    let durationInSeconds = (endTime - startTime) / 1000;
    saveGameOverData(score, level, durationInSeconds, losses); 

    ctx.fillStyle = 'white';
    ctx.font = '50px Verdana';
    ctx.fillText('Game Over!', canvas.width / 6.5, canvas.height / 2);
    showReplayButton(); 
}

function showReplayButton() {
    let replayButton = document.getElementById('replayButton');
    replayButton.style.display = 'block'; 
    replayButton.onclick = replayGame; 
}

function replayGame() {
    speed = 5;
    level = 0;
    losses = 0;
    tailLength = 2;
    score = 0;
    headX = 10;
    headY = 10;
    xVelocity = 0;
    yVelocity = 0;
    snakeParts = []; 
    document.getElementById('replayButton').style.display = 'none'; 

    drawGame();
}


function checkAppleCollision() {
    if (appleX === headX && appleY === headY) {
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
        tailLength++;
        level++; 
        score += 5 * level; 

       
        if (speed < maxSpeed) {
            speed++;
        }
    }
}




function isGameOver() {
    let gameOver = false;

    if (xVelocity === 0 && yVelocity === 0) {
        return false; // The game has not started yet
    }

    // Walls collision
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
    }

    // Check collision with the snake's body
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        if (part.x === headX && part.y === headY) {
            gameOver = true;
            break;
        }
    }

    if (gameOver) {
        showReplayButton();
        losses++;
        ctx.fillStyle = 'white';
        ctx.font = '50px Verdana';
        ctx.fillText('Game Over!', canvas.width / 6.5, canvas.height / 2);
        return true; 
    }

    return gameOver;
}

function keyDown(event) {
    // up
    if (event.keyCode === 38) {
        if (yVelocity === 1) return;
        yVelocity = -1;
        xVelocity = 0;
    }
    // down
    else if (event.keyCode === 40) {
        if (yVelocity === -1) return;
        yVelocity = 1;
        xVelocity = 0;
    }
    // left
    else if (event.keyCode === 37) {
        if (xVelocity === 1) return;
        yVelocity = 0;
        xVelocity = -1;
    }
    // right
    else if (event.keyCode === 39) {
        if (xVelocity === -1) return;
        yVelocity = 0;
        xVelocity = 1;
    }
}

document.addEventListener('keydown', keyDown);

function saveGameOverData(score, level, durationInSeconds, losses) {
    console.log("Username:", username); 
    console.log("Type of username:", typeof username);
    fetch('http://localhost:5000/gameover', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            username: username, 
            score: score, 
            level: level, 
            duration: durationInSeconds,
            losses: losses 
        })
    })
    .then(response => response.json())
    .then(data => console.log('Game over data sent:', data))
    .catch(error => console.error('Error:', error));
}


function drawSnake() {
    ctx.fillStyle = 'green';
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
    }

    snakeParts.push(new SnakePart(headX, headY));
    if (snakeParts.length > tailLength) {
        snakeParts.shift();
    }

    ctx.fillStyle = 'orange';
    ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
}

function drawApple() {
    ctx.fillStyle = 'red';
    ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
}

function clearScreen() {
    ctx.fillStyle = '#012622';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function SnakePart(x, y) {
    this.x = x;
    this.y = y;
}

