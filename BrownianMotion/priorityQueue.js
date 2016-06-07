
// You can use the following resource to learn about priority queues and the main methods that need to be implemented: http://algs4.cs.princeton.edu/24pq/
function PriorityQueue(comparator) {
  this.comparator = comparator;
  this.size = 0;
  this.items = [];

  this.isEmpty = function() {
    return this.size == 0;
  }

  this.enqueue = function(item) {
    this.items[this.size] = item;
    this.swim(this.size++);
  };

  this.dequeue = function() {
    var tmp = this.items[0];
    this.exchange(0, --this.size);
    this.sink(0);
    this.items[this.size] = null;

    if (this.size > 0 && this.size == Math.floor(this.items.length / 4))
      this.resize(Math.floor(this.items.length  / 2));

    return tmp;
  };

  this.min = function() {
    return this.items[0];
  };

  this.resize = function(newSize) {
    this.items = this.items.slice(0, newSize);
  };

  this.swim = function(position) {
    while(position > 0 && this.greater( (position - 1) / 2, position)) {
      this.exchange(position, (position - 1) / 2);
      position = Math.floor((position - 1) / 2);
    };
  };

  this.sink = function(position) {
    while(2 * position + 1 < this.size) {
      var j = 2 * position + 1;
      if(j < (this.size - 1) && this.greater(j, j + 1)) j++;
      if(!this.greater(position, j)) break;
      this.exchange(position, j);
      position = j;
    }
  };

  this.exchange = function(a, b) {
    a = Math.floor(a);
    b = Math.floor(b);
    var tmp = this.items[a];
    this.items[a] = this.items[b];
    this.items[b] = tmp;
  };

  this.greater = function(a, b) {
    a = Math.floor(a);
    b = Math.floor(b);
    return this.comparator(this.items[a], this.items[b]) > 0;
  }

  this.cloneItems = function() {
    var cl = [];
    for(var i = 0; i < this.size; i++) {
      var ev = this.items[i];
      cl[i] = {time: ev.time};
    }
    return cl;
  }
}
