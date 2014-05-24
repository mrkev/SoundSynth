///<reference path="music.ts"/>
///<reference path="instrument.ts"/>
///<reference path="utils.ts"/>

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
	public lastHarmony : Note[];

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

		this.selectedOctave = 3;
	}

	/**
	 * Plays a note in current instrument. Notifies note played to observers.
	 * @param {Note} note Note to play
	 */
	public playNote(note : Note) :void {
		this.instr.playNote(note);
		this.prevNote = note;
		// this.lastHarmony = this.harmonizer.harmonize(note);
		this.notifyObservers(note);
	}

	public stopNote(note : Note) :void {

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

class SState {
	public alpha : number;
	public beta  : number;
	public gamma : number;
}


