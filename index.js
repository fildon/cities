(() => {
  // src/city.ts
  var City = class {
    constructor(location) {
      this.location = location;
    }
    /**
     * Radius of clear space required around a city
     */
    static REQUIRED_SPACE = 50;
    /**
     * The maximum distance over which a city will connect by road to another city
     */
    static ROAD_DISTANCE = 100;
    /**
     * The size of the city as used by system logic.
     * Can increase only in discrete integer values.
     */
    logicalSize = 1;
    /**
     * The size as used by animation.
     * Tends to the logical size over time, but can only increase smoothly.
     */
    animatedSize = 0;
    /**
     * The age of this city as measured in milliseconds
     */
    age = 0;
    /**
     * How long since the city last evolved in milliseconds
     */
    last_evolved = 0;
    advanceByTime(time) {
      this.age += time;
      this.last_evolved += time;
      if (time > 1e3) {
        this.animatedSize = this.logicalSize;
      } else {
        this.animatedSize = this.animatedSize + (this.logicalSize - this.animatedSize) * (time / 1e3);
      }
    }
    isReadyToEvolve(connectedRoads) {
      if (this.last_evolved < 1e3)
        return false;
      if (connectedRoads.filter((road) => road.isMutual()).length < 3)
        return false;
      return Math.random() < 0.05;
    }
    evolve() {
      this.logicalSize += 1;
      this.last_evolved = 0;
    }
    paintSelf(canvas) {
      canvas.beginPath();
      canvas.arc(
        this.location.x,
        this.location.y,
        this.animatedSize * 5,
        0,
        2 * Math.PI
      );
      canvas.fillStyle = ["green", "yellow", "orange", "red"][this.logicalSize - 1] ?? "red";
      canvas.fill();
      canvas.beginPath();
      canvas.arc(
        this.location.x,
        this.location.y,
        this.animatedSize * 5,
        0,
        2 * Math.PI
      );
      canvas.strokeStyle = "black";
      canvas.lineWidth = 1;
      canvas.stroke();
    }
  };

  // src/road.ts
  var Road = class {
    constructor(start, end) {
      this.start = start;
      this.end = end;
      this.created_at = performance.now();
    }
    created_at;
    isMember(city) {
      return [this.start, this.end].includes(city);
    }
    isMutual() {
      return this.start.logicalSize === this.end.logicalSize;
    }
    /**
     * A road becomes outgrown when it connects cities which differ in size too greatly
     */
    isOutgrown() {
      return Math.abs(this.start.logicalSize - this.end.logicalSize) > 1;
    }
    paintSelf(canvas) {
      const age = performance.now() - this.created_at;
      const matured = age > 1e3;
      const animationParam = matured ? 1 : age / 1e3;
      const lineWidth = 2 * animationParam;
      const opacity = animationParam / 2;
      canvas.beginPath();
      canvas.moveTo(this.start.location.x, this.start.location.y);
      canvas.lineWidth = lineWidth;
      canvas.lineCap = "round";
      canvas.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
      canvas.lineTo(this.end.location.x, this.end.location.y);
      canvas.stroke();
    }
  };

  // src/vector.ts
  var Vector = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    distanceBetween(other) {
      return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }
  };

  // src/simulation.ts
  var Simulation = class _Simulation {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
    cities = [];
    roads = [];
    static TIME_BETWEEN_CITIES = 500;
    /**
     * Milliseconds until the next city spawn
     */
    timeToNextCity = 1e3;
    advanceByTime(time) {
      this.cities.forEach((city) => city.advanceByTime(time));
      this.timeToNextCity -= time;
      let qtyToCreate = 0;
      while (this.timeToNextCity < 0) {
        this.timeToNextCity += _Simulation.TIME_BETWEEN_CITIES;
        qtyToCreate += 1;
      }
      this.createNewCities(qtyToCreate);
      this.evolveCities();
    }
    roadsForCity(city) {
      return this.roads.filter((road) => road.isMember(city));
    }
    evolveCities() {
      const citiesToEvolve = this.cities.filter(
        (city) => city.isReadyToEvolve(this.roadsForCity(city))
      );
      citiesToEvolve.forEach((city) => city.evolve());
      this.roads = this.roads.filter((road) => !road.isOutgrown());
    }
    createNewCities(qtyToCreate) {
      while (qtyToCreate > 0) {
        qtyToCreate -= 1;
        const candidateLocation = new Vector(
          this.width * Math.random(),
          this.height * Math.random()
        );
        if (this.cities.every(
          (city) => candidateLocation.distanceBetween(city.location) > City.REQUIRED_SPACE
        )) {
          const newCity = new City(candidateLocation);
          const citiesToConnectTo = this.cities.filter(
            (city) => city.location.distanceBetween(candidateLocation) < City.ROAD_DISTANCE
          );
          const newRoads = citiesToConnectTo.map(
            (city) => new Road(newCity, city)
          );
          if (newRoads.length > 0) {
            this.roads = [...this.roads, ...newRoads];
          }
          this.cities.push(newCity);
        }
      }
    }
    paintSelf(canvas) {
      this.roads.forEach((road) => road.paintSelf(canvas));
      this.cities.forEach((city) => city.paintSelf(canvas));
    }
  };

  // src/index.ts
  var CANVAS_HEIGHT = 1e3;
  var CANVAS_WIDTH = 1e3;
  var canvasElement = document.querySelector("canvas");
  var canvasContext = canvasElement.getContext("2d");
  var simulation = new Simulation(1e3, 1e3);
  var lastFrame;
  var step = (now) => {
    if (!lastFrame)
      lastFrame = now;
    const elapsed = now - lastFrame;
    lastFrame = now;
    simulation.advanceByTime(elapsed);
    canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    simulation.paintSelf(canvasContext);
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
})();
//# sourceMappingURL=index.js.map
