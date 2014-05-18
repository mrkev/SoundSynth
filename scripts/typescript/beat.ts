///<reference path="utils.ts"/>

class Beat {
	// div = 1/16th, beat = 1/4er, bar = 1, word = 4, verse = 16, song = 64
	public callbacks : Function[] = [null, null, null, null, null, null];
	private _counters : Number[] = [0,0,0,0,0,0];
	public delay;
	public timer;

	constructor (public bpm : number) {
		this.delay = 1 / ( bpm / 60000);
		this._counters = [0,0,0,0,0,0];
	}

	public play () : void {
		P.rint ("will play", "Beat.lifecycle");
		this.timer = setTimeout(this.tick, this.delay);
	}

	private tick () : void {
		P.rint ('tick' + this.tick + " " + this.delay, "Beat.lifecycle");
		this.timer = setTimeout(this.tick, this.delay);
		//var l = this._counters.length; // Evaluate length only once for max perf.
		//var i = l;
		console.log(this._counters);
		/*while (i > 0) {
			if (++this._counters[l-i] == 4) {
				this._counters[l-(--i)] = 0;
				this.callbacks[l-i]();
			};
		}*/

	}


}

/*
var b = new Beat(128);

b.callbacks[2] = function () {
	console.log("note");
}

b.play();*/