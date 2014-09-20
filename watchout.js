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
  enemyCount: 30,
  playerCount: 1
};

var gameBoard = d3.select('.game-board').append('svg:svg').attr('width', gameOptions.width).attr('height', gameOptions.height);


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

var that;

Player.prototype.render = function(location){
  // console.log(this);
  that = this;
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
  // this.transform = {
  console.log(that);
  that.x = that.x + dx;
  that.y = that.y + dy;
  console.log(that.x);
  // };
  that.element.attr('cx', that.x).attr('cy', that.y);
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
    // console.log(enemy);
    return enemy;
  });
  return arrayOfEnemies;
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
  // create and render function
  var setEnemyLocations = function() {
    var newEnemyLocations = createEnemies();
    render(newEnemyLocations);
  };
  setEnemyLocations();
  // setinterval function that fires above function
  var count=0;
  var movementInterval = setInterval(function(){
    setEnemyLocations();
    count++;
    // console.log(count);
  }, 2000);
};

playGame();



