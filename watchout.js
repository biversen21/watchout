var gameOptions = {
  width: 900,
  height: 600,
  padding: 10,
  enemyCount: 30,
  playerCount: 1,
  currentLevelColor: 'lightgray',
  currentEnemyColor: 'black',
  levelColors: ['lightgray', 'pink', 'burlywood', 'honeydew', 'linen', 'papayawhip'],
  enemyColors: ['seagreen', 'indigo', 'slategray', 'peru', 'maroon', 'darkgoldenrod'],
  level: 1
};

var gameBoard = d3.select('.game-board').append('svg:svg').attr('width', gameOptions.width)
  .attr('height', gameOptions.height);

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
  // this.element = location.append('svg:path').attr('d', 'm317,174l-80,91l139,29l63,-92l-122,-28z').attr('fill', '#0f0').attr('cx', this.x).attr('cy', this.y);
  this.dragging();
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

Player.prototype.growMe = function() {
  player.r *= 1.2;
  player.element.transition().duration(500).attr('r', player.r);
};

Player.prototype.shrinkMe = function() {
  player.r = 10;
  player.element.transition().duration(1).attr('r', player.r);
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

var detectCollision = function(enemy, colliderCallback) {
  var xDiff = parseFloat(enemy.attr('cx')) - player.x;
  var yDiff = parseFloat(enemy.attr('cy')) - player.y;
  var rDiff = parseFloat(enemy.attr('r')) + parseFloat(player.element.attr('r'));
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
  player.shrinkMe();
  scoreBoard.collisions++;
  scoreBoard.currentScore = 0;
  d3.select('.collisions span').text(scoreBoard.collisions);
  gameBoard.style('background-color', '#aaa');
  gameOptions.level = 1;
  gameOptions.enemyCount = 30;
  d3.select('.level span').text('Level: ' + gameOptions.level);
};

var render = function(arrayOfEnemies) {
  var enemies = gameBoard.selectAll('circle.enemy').data(arrayOfEnemies, function(d) { return d.id; });
  enemies.enter().append('svg:circle').attr('class','enemy')
      .attr('cx', function(enemy) { return axes.x(enemy.x)})
      .attr('cy', function(enemy) { return axes.y(enemy.y)})
      .attr('r', 0).attr('fill', gameOptions.currentEnemyColor);
  enemies.exit().remove();

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
  enemies.transition().duration(200).attr('r', 10).transition().duration(2000).tween('custom', tweenWithCollisionDetection);
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
    if (scoreBoard.currentScore % 50 === 0) {
      player.growMe();
    }
    if (scoreBoard.currentScore % 100 === 0) {
      gameOptions.currentLevelColor = gameOptions.levelColors[Math.floor(Math.random() * 6)];
      gameBoard.style('background-color', 'white');
      gameBoard.transition().duration(400).style('background-color', gameOptions.currentLevelColor);
      gameOptions.level++;
      gameOptions.enemyCount += 5;
      gameOptions.currentEnemyColor = gameOptions.enemyColors[Math.floor(Math.random() * 6)];
      d3.select('.level span').text('Level: ' + gameOptions.level);
    }
    // call grow method
    d3.select('.current span').text(scoreBoard.currentScore);
  }, 50);
};

playGame();



