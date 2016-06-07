

function FpsCounter() {
  this.fps = 0;
  this.lastUpdate = new Date() - 1;
  this.fpsFilter = 50;

  this.tick = function() {
    var now = new Date();
    var thisFrameFPS = 1000 / (now - this.lastUpdate);
    this.fps += (thisFrameFPS - this.fps) / this.fpsFilter;
    this.lastUpdate = now;
  };

  this.start = function() {
    setInterval(function() {
      var lastwait = Math.round(window.collisionSystem.lastwait);
      document.title = 'wait: ' + lastwait + ' ms, FPS: ' + this.fps;
    }.bind(this), 1000);
    return this;
  };
}
