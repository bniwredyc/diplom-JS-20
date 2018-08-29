'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x =  Math.ceil(x);
    this.y =  Math.ceil(y);
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(count) {
    return new Vector(count * this.x, count * this.y);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw new Error('Класс Actor можно создавать только векторами типа Vector');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  act() {}

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    if(this === actor) {
      return false;
    } else if (!(actor instanceof Actor)) {
        throw new Error('Можно сравнивать только объекты класса Actor');
    }
    //return ( !(this.left >= actor.left + actor.size.x || actor.left >= this.left + this.size.x || this.top >= actor.top + actor.size.y || actor.top >= this.top + this.size.y) );
    return ( !(this.left >= actor.right || actor.left >= this.right || this.top >= actor.bottom || actor.top >= this.bottom) );
  }
}

class Level {
  constructor(arrGrid = [], arrActors = []) {
    this.grid = arrGrid;
    this.actors = arrActors.filter(function(el) {
      return ('type' in el);
    });
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = this.grid.length;
    this.width = this.grid.reduce(function(memo, el) {
      if (el.length > memo) {
        memo = el.length;
      }
      return memo;
    }, 0);
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return (this.status != null && this.finishDelay < 0)
  }

  actorAt(actor = {}) {
    if (!(actor instanceof Actor)) {
      throw new Error('Можно сравнивать только объекты класса Actor');
    }
    return this.actors.find(function(el) {
      return el.isIntersect(actor);
    });
  }

  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('В метод obstacleAt можно передавать только вектора типа Vector');
    }

    let obstacleActor = new Actor(pos, size, undefined);

    if (obstacleActor.bottom > this.height) {
      return 'lava';
    } else if (obstacleActor.top < 0 || obstacleActor.left < 0 || obstacleActor.right > this.width) {
      return 'wall';
    } else {
      let cross;
      for (let i = obstacleActor.top; i < obstacleActor.bottom; i++) {
        return cross = this.grid[i].find(el => el != undefined);
      }
    }
  }

  removeActor(actor) {
    const index = this.actors.findIndex(actor => actor);
    if (index != -1) {
      this.actors.splice(index, 1);
    }
  }

  noMoreActors(title) {
    if (this.actors.find(el => el.type === title)) {
      return false;
    } else {
      return true;
    }
  }

  playerTouched(title, actor = {}) {
    if (this.status === null) {
      if (title == 'lava' || title == 'fireball') {
        this.status = 'lost';
      } else if(title === 'coin' && actor.type === 'coin' && !this.noMoreActors(title)) {
        this.removeActor(actor);
        if (this.noMoreActors(title)) {
          this.status = 'won';
        }
      }
    }
  }
}

class LevelParser {
  constructor(gameObjects) {
    this.gameObjects = gameObjects;
  }

  actorFromSymbol(symbol = undefined) {
    if (symbol === undefined) {
      return undefined;
    }
    return this.gameObjects[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    } else if (symbol === '!') {
      return "lava";
    } else {
      return undefined;
    }
  }

  createGrid(plan) {
    return plan.map(element => element.split('').map(el => this.obstacleFromSymbol(el)));
  }

  createActors(plan) {
    let actors = [];
    plan.forEach ((element, y) => {
      element.split('').forEach((el, x) => {
        let classActor = this.actorFromSymbol(el);
        if (classActor != undefined && classActor instanceof Actor) {
          actors.push(new classActor(new Vector(x, y)));
        }
      })
    });
    return actors;
  }
}
