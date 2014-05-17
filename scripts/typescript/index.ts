///<reference path="music.ts"/>
///<reference path="view.ts"/>
///<reference path="utils.ts"/>

class Controller implements Receptor {

	public view : View;
	public model : Model;

	constructor () {
		// For debugging.
		P.rototyping = true;
		P.ermitted.push("View.lifecycle");

		// Initialize the View & Model
		this.view  = new View ($("#View"));
		this.model = new Model(107);

		this.setupListeners();
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
			return;
		}


	}

	keyBindings = {
	        97 : 0,         // C
	        119: 1,
	        115: 2,         // D
	        101: 3,
	        100: 4,         // E
	        102: 5,         // F
	        116: 6,
	        103: 7,         // G
	        121: 8, 
	        104: 9,         // A 
	        117: 10,
	        106: 11,        // B
	        107: 12,        // C
	        111: 13,
	        108: 14,        
	        112: 15,
	        59 : 16
	    }

	private setupListeners() {

		// Listen for keydowns.
		$(document).keypress(function(event) {
			if (!(event.keyCode in this.keyBindings)) { return; };

			this.playNote(new Note(
				this.keyBindings[event.keyCode] + (this.model.octave * Note.N_PER_8VE))
			);
		});

		$(document).keyup(function(event) { 
			// i.mute();			// TODO : Stop note
			});

	}


	private playNote(note : Note) : void {
		this.model.playNote(note);
	}

}

/**
 * Instance is a Music Model. Represents the state of the entire music
 * environment, including BPM, notes played ?? and whatnot.
 */

class Model extends Broadcaster{
	// User state
	public selectedOctave : number;

	// Music
	public prevNote : Note;
	public instr 	: Instrument;
	public harmonizer : Harmonizer;

	public timer;
	public delay : number;
	public bpm : number;

	constructor(bpm : number) {
		super();

		// Initialize the beats.
		this.setBPM(bpm);

		// Initialize the harmonizer. 
		this.harmonizer = new Harmonizer();
		// this.harmonizer.harmonize(new Note(64));

		// Instruments and notes plz.
		this.instr = new Instrument(1);
		// this.prevNote = new Note(60);

	}

	/**
	 * Plays a note in current instrument. Notifies note played to observers.
	 * @param {Note} note Note to play
	 */
	public playNote(note : Note) {
		this.instr.playNote(note);
		this.prevNote = note;
		this.notifyReceptors(note);
	}


	//
	// Environment
	//

	/**
	 * Sets value for environment bpm.
	 * @param {number} bpm New bpm value.
	 */
	public setBPM (bpm : number) {
		this.bpm = bpm;
		this.delay = 1 / ( this.bpm / 60000);
	}

	/**
	 * Returns value for current BPM in environment.
	 */
	private getBPM () {
		return this.bpm;
	}


	//
	// Autoplay
	//


	/**
	 * Starts autoplaying timer, playing a note on each beat,
	 * according to BPM.
	 */
	public autoPlay() {
		this.timer = setTimeout(this.playNext, this.delay);
	}

	/**
	 * Plays next note in autoplaying loop.
	 */
	public playNext() {
		P.rintf("prevnote: ", "Model.autoplay");
		P.rintf( this.prevNote   , "Model.autoplay");

		var newNote : Note = this.harmonizer.harmonize(this.prevNote)[0];
		this.instr.playNote(newNote);

		this.prevNote = newNote;
		
		P.rintf('Next note.', "Model.autoplay");
		this.timer = setTimeout(this.playNext, this.delay);
	}
}


var app = new Controller();

