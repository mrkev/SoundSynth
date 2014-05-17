var Beat = (function () {
    function Beat(bpm) {
        this.bpm = bpm;
        // div = 1/16th, beat = 1/4er, bar = 1, word = 4, verse = 16, song = 64
        this.callbacks = [null, null, null, null, null, null];
        this.counters = [0, 0, 0, 0, 0, 0];
        this.delay = 1 / (bpm / 60000);
        this.counters = [0, 0, 0, 0, 0, 0];
    }
    Beat.prototype.play = function () {
        console.log("will play");
        this.timer = setTimeout(this.tick, this.delay);
    };

    Beat.prototype.tick = function () {
        console.log('tick' + this.tick + " " + this.delay);
        this.timer = setTimeout(this.tick, this.delay);

        //var l = this.counters.length; // Evaluate length only once for max perf.
        //var i = l;
        console.log(this.counters);
        /*while (i > 0) {
        if (++this.counters[l-i] == 4) {
        this.counters[l-(--i)] = 0;
        this.callbacks[l-i]();
        };
        }*/
    };
    return Beat;
})();

var b = new Beat(128);

b.callbacks[2] = function () {
    console.log("note");
};

console.dir(b);
console.log(b.counters);
b.play();
