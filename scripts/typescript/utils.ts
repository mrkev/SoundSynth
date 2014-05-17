class P {
	public static rototyping = true;
	public static ermitted = [];

	public static rint (obj : any) : void {
		if (P.rototyping) console.log(obj);
	}

	public static rintf (obj:any, tag:string) :void {
		if (this.ermitted.indexOf(tag) != -1) console.log(obj);
	}
}

class Broadcaster {
	private receptors : Receptor[];
	public registerReceptor (receptor : Receptor) : void {
		this.receptors.push(receptor);
	}
	public removeReceptor (receptor : Receptor) : void {
        this.receptors.splice(this.receptors.indexOf(receptor), 1);
	}

	notifyReceptors (arg : any) {
		this.receptors.forEach(
			function(element, index, array){
				element.update (arg);
			}
		);
	}
}

interface Receptor {
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
