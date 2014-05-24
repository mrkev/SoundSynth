///<reference path="model.ts"/>
///<reference path="utils.ts"/>
///<reference path="view.ts"/>
///<reference path="lib/touch.d.ts"/>

class Controller implements Observer {

	public view : View;
	public model : Model;

	constructor () {
		// For debugging.
		P.rototyping = true;
		P.ermitted = [
		//	  "Controller.lifecycle"
		//	, "View.lifecycle"
		];


		// Initialize the View & Model
		this.view  = new View ($("#View"));
		this.model = new Model(107);
		this.model.registerObserver(this);

		P.rint("Created controller with Model" 	, "Controller.lifecycle");
		P.rint(this.model 						, "Controller.lifecycle");
		P.rint("and view" 						, "Controller.lifecycle");
		P.rint(this.view 						, "Controller.lifecycle");

        this.setupKeyboardListeners();
        this.setupMotionListeners();
	}

	/**
	 * Model has been changed. Updates view accordingly.
	 * @param {any} arg Argument send by model upon change.
	 */
	update (arg :any) {
		// If only the note changed, only update things related to the note.
		// TODO: Could make classes NoteChange, FreqChange, etc. Or single
		// ModelChange class with type attribute being a value member of an
		// Change (NoteChange, FreqChange) enum or a constant string.
		if (arg instanceof Note) {
			this.view.notePlayed(arg);

			// var status : string = 'Consider next: ';
			// this.model.lastHarmony.forEach(function(e) {status = status + e.letter()});
			// this.view.setStatus(status)
			return;
		}


	}

	public static keyBindings : { [keynum: number] : number; } = {
	            65 : 0,  // C
	            87 : 1,  // C#
	            83 : 2,  // D
	            69 : 3,  // D#
	            68 : 4,  // E
	            70 : 5,  // F
	            84 : 6,  // F#
	            71 : 7,  // G
	            89 : 8,  // G#
	            72 : 9,  // A
	            85 : 10, // A#
	            74 : 11, // B
	            75 : 12, // C
	            79 : 13, // C#
	            76 : 14, // D
	            80 : 15, // D#
	            186: 16, // E
	            222: 17  // F
	        }

	private keysdown : boolean[] = new Array(Object.keys(Controller.keyBindings).length);

	/**
	 * Registers event listeners for keyboard events.
	 */
	private setupKeyboardListeners() {
		var self = this;

		// Initialize with no keys pressed.
		this.keysdown.forEach(function(e, i, a){this.keysdown[i] = false;});


		// Register Keydown.
		$(document).keydown(function(event){
			if (event.keyCode == 17) self.model.selectedOctave -= 1;
			if (event.keyCode == 18) self.model.selectedOctave += 1;


			// Return if it's not a key we care for.
			if (!(event.keyCode in Controller.keyBindings)) { return; };

			// Return if already pressed
			if (self.keysdown[Controller.keyBindings[event.keyCode]]) return;
			    self.keysdown[Controller.keyBindings[event.keyCode]] = true;

			// Create note and play it.
			var n : Note = new Note(
				Controller.keyBindings[event.keyCode] 
				+ (self.model.selectedOctave * Note.N_PER_8VE));
			
			self.model.playNote(n);
		});


		// Register Keyup.
		$(document).keyup(function(event) { //console.log('keyup')
			self.keysdown[Controller.keyBindings[event.keyCode]] = false;
			//self.model.stopNote(n);
		});
	}


	private harmony  : number[] = [0,2,4,5,7,9,11,12];
	private key 	 : number   = 0;
	private sstate   : SState   = new SState();

	private setupMotionListeners () : void {
		var self = this;


		// Register touchstart.
		document.addEventListener('touchstart', function(e:TouchEvent) {
			var n : Note = new Note(
				self.harmony[Math.floor(self.sstate.beta/13)]
				+ (self.model.selectedOctave * Note.N_PER_8VE));

			self.model.playNote(n);
		}, false);

		// Register touchend.
		document.addEventListener('touchend', function(e:TouchEvent) {
		    e.preventDefault();
		    var touch = e.touches[0];
		    //alert(touch.pageX + " - " + touch.pageY);
			//gain.gain.value = 0;
			//osc1.frequency.value = freq_from_note(keyBindings[97]);
			//osc2.frequency.value = freq_from_note(keyBindings[97]);
			//console.log(gain.gain.value)
			//init();

		}, false);



		// Register device orientation change.
		window.addEventListener("deviceorientation", function (e:DeviceOrientationEvent) {
		  var absolute = e.absolute;
		  self.sstate.alpha    = e.alpha;
		  self.sstate.beta     = e.beta;
		  self.sstate.gamma    = e.gamma;



		  //dlog(harmony[Math.floor(e.beta/13)] + " - " + e.beta);
		  		  
		  self.view.notePlayed(new Note(
				self.harmony[Math.floor(self.sstate.beta/13)]
				+ (self.model.selectedOctave * Note.N_PER_8VE)));
		}, true);
		
	}

}