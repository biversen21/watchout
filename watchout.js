// start slingin' some d3 here.
//
//Create and render game board
//Create an enemy constructor
  //Create a movement function
    //randomly set new position for enemy
    //call render function to reset position
    //transition to new position
//Create a player constructor
  //Create draggable functionality
  //Create method to check for collisions with enemies
//Create and implement scoreboard
  //Trigger from player collision method


//Board property
  //Width, height, #of enemies, # of players
var gameOptions = {
  width: 700,
  height: 500,
  padding: 10,
  enemyCount: 30,
  playerCount: 1
};

var gameBoard = d3.select('.game-board').append('svg:svg').attr('width', gameOptions.width)
  .attr('height', gameOptions.height);

//need to set and update scoreboard
var scoreBoard = {
  highScore: 0,
  currentScore: 0,
  collisions: 0
};

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};

var Player = function(gameOptions) {
  this.gameOptions = gameOptions;
  this.x = 0;
  this.y = 0;
  this.fill = '#f00';
  this.angle = 0;
  this.r = 10;
};

Player.prototype.render = function(location){
  this.x = this.gameOptions.width*0.5;
  this.y = this.gameOptions.height*0.5;
  this.element = location.append('svg:circle').attr('r', this.r).attr('fill', this.fill)
    .attr('angle', this.angle).attr('cx', this.x).attr('cy', this.y);

  this.dragging();
};

Player.prototype.transform = function(options){
  this.element.attr('transform', "translate(#{this.x}, #{this.y})");
};

Player.prototype.moveRelative = function(dx, dy){
  if (player.x < gameOptions.padding) {
    player.x = gameOptions.padding;
  } else if (player.x > gameOptions.width - gameOptions.padding) {
    player.x = gameOptions.width - gameOptions.padding;
  } else {
    player.x = player.x + dx;
  }
  if (player.y < gameOptions.padding) {
    player.y = gameOptions.padding;
  } else if (player.y > gameOptions.height - gameOptions.padding) {
    player.y = gameOptions.height - gameOptions.padding;
  } else {
    player.y = player.y + dy;
  }
  player.element.attr('cx', player.x).attr('cy', player.y);
};

Player.prototype.dragging = function(){
  var dragMove = function(){
    Player.prototype.moveRelative(d3.event.dx, d3.event.dy);
  };
  var drag = d3.behavior.drag().on('drag', dragMove);
  this.element.call(drag);
};

var player = new Player(gameOptions);
player.render(gameBoard);


var createEnemies = function(){
  var count = 0;
  var arrayOfEnemies = Array.apply(null, Array(gameOptions.enemyCount));
  arrayOfEnemies = arrayOfEnemies.map(function(){
    count++;
    var enemy = {
      id: count,
      x: Math.random() * 100,
      y: Math.random() * 100
    };
    return enemy;
  });
  return arrayOfEnemies;
};

//need to build collission detection
var detectCollision = function(enemy, colliderCallback) {
  var xDiff = parseFloat(enemy.attr('cx')) - player.x;
  var yDiff = parseFloat(enemy.attr('cy')) - player.y;
  var rDiff = parseFloat(enemy.attr('r')) + player.r;
  var distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  if (distance < rDiff) {
    colliderCallback();
  }
};

var resetScore = function() {
  if (scoreBoard.currentScore > scoreBoard.highScore) {
    scoreBoard.highScore = scoreBoard.currentScore;
    d3.select('.high span').text(scoreBoard.highScore);
  }
  scoreBoard.collisions++;
  scoreBoard.currentScore = 0;
  d3.select('.collisions span').text(scoreBoard.collisions);
};

var render = function(arrayOfEnemies) {
  var enemies = gameBoard.selectAll('circle.enemy').data(arrayOfEnemies, function(d) { return d.id; });
  enemies.enter().append('svg:circle').attr('class','enemy')
      .attr('cx', function(enemy) { return axes.x(enemy.x)})
      .attr('cy', function(enemy) { return axes.y(enemy.y)})
      .attr('r', 10);

  var tweenWithCollisionDetection = function(newEnemyData){
    var currentEnemy = d3.select(this);

    var startPosition = {
      x: parseFloat(currentEnemy.attr('cx')),
      y: parseFloat(currentEnemy.attr('cy'))
    };

    var endPosition = {
      x: axes.x(newEnemyData.x),
      y: axes.y(newEnemyData.y)
    };

    return function(t) {
      detectCollision(currentEnemy, resetScore);
      var nextPosition = {
        x: startPosition.x + (endPosition.x - startPosition.x)*t,
        y: startPosition.y + (endPosition.y - startPosition.y)*t
      };

      currentEnemy.attr('cx', nextPosition.x)
      .attr('cy', nextPosition.y);};
  };
  enemies.transition().duration(2000).tween('custom', tweenWithCollisionDetection);
};

var playGame = function() {
  var setEnemyLocations = function() {
    var newEnemyLocations = createEnemies();
    render(newEnemyLocations);
  };
  setEnemyLocations();
  var count=0;
  var movementInterval = setInterval(function(){
    setEnemyLocations();
    count++;
  }, 2000);
  var scoreInterval = setInterval(function(){
    scoreBoard.currentScore++;
    d3.select('.current span').text(scoreBoard.currentScore);
  }, 50);
};

playGame();



