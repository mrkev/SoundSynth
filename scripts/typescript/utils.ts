class P {
	public static rototyping = true;
	public static ermitted = [];

	public static rint (obj : any, tag? : string) : void {
		if (tag && this.ermitted.indexOf(tag) == -1) return;
		if (P.rototyping) console.log(obj);
	}

	public static rintf (obj:any, tag:string) :void {
		if (this.ermitted.indexOf(tag) != -1) console.log(obj);
	}

	public static roclaim (condition : boolean, message? : string) {
		if (!condition) {
		    throw message || "Assertion failed.";
		}
	}
}

class Broadcaster {
	private observers : Observer[];

	constructor () {
		this.observers = [];
	}

	public registerObserver (observer : Observer) : void {
		this.observers.push(observer);
	}
	public removeObserver (observer : Observer) : void {
        this.observers.splice(this.observers.indexOf(observer), 1);
	}

	notifyObservers (arg : any) {
		this.observers.forEach(
			function(element, index, array){
				element.update (arg);
			}
		);
	}
}

interface Observer {
    update (arg:any);
}





// Extending array
// 

interface Array<T> {
    choice(): T;
    forin(fn: (item : T) => any): void;
    forEach(fn: (item : T) => any) : void;
}

Array.prototype.forin = function(fn) {
    for (var i = 0; i < this.length; i++) {
        fn(this[i]);
    }
}

Array.prototype.choice = function () {
    return this[Math.floor(Math.random() * this.length)];
}
