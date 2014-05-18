///<reference path="utils.ts"/>


class Harmonizer {
    
    //
    // Constants
    //
    
    chord_array = {
        'B' : ['BDF', 'EGB', 'GBD'],
        'A' : ['ACE', 'DFA', 'FAC'],
        'G' : ['GBD', 'CEG', 'EGB'],
        'F' : ['FAC', 'BDF', 'DFA'],
        'E' : ['EGB', 'ACE', 'CEG'],
        'D' : ['DFA', 'GBD', 'BDF'],
        'C' : ['CEG', 'FAC', 'ACE']
    }

    note_to_value = {
        'B'  : 11,
        'A#' : 10,
        'A'  : 9 ,
        'G#' : 8 ,
        'G'  : 7 ,
        'F#' : 6 ,
        'F'  : 5 ,
        'E'  : 4 ,
        'D#' : 3 ,
        'D'  : 2 ,
        'C#' : 1 ,
        'C'  : 0
    } // + 12*octave

    value_to_note = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    //
    // Variables and arguments
    //

    voice_config    = [0]       // For generated voices only, not the input
    voice_prev      = []        // For keeping track of the previous notes
                                    // - same size as voice config
    vtracks = []                // For keeping all the tracks
                                    // - same size as voice config


    harmonize(note : Note) {
        P.rintf('Preparing to harmonize note' + note, 'Harmonizer.events');

        var octave = note.octave();
        var note_letter = note.letter();

        var chord = this.chord_array[note_letter][Math.floor(Math.random() * this.chord_array[note_letter].length)];
        P.rintf('Chose chord ' + chord + ' for note ' + note_letter, 'Harmonizer.events');


        // Get list of notes. One per voice.
        this.voice_prev = this.best_next_note_set(note, chord, this.voice_prev);
    
        P.rintf(this.voice_prev, 'Harmonizer.events');
        P.rintf(" - Will append concurrent note values - ", 'Harmonizer.events');
        
        for (var j = 0; j < this.vtracks.length; j++) {
            //on = midi.NoteOnEvent(tick=e.tick, velocity=e.velocity, pitch=this.voice_prev[j])
            //this.vtracks[j].append(on)

            //P.rintf("Appended note with pitch " + str(this.voice_prev[j]) + " to track " + str(j), 'Harmonizer.events');
        }

        return this.voice_prev;
    }

    best_next_note_set(note : Note, chord : string, previous_notes : Note[]){
        var RANGE_UP_DOWN   = Note.N_PER_8VE / 2;
        var note_set        = [];
        var current_note    = note.raw_value();

        for (var v = 0; v < this.voice_config.length; v++) {
            // Possilbe notes will be all that match with chord within an octave range
            var possible_notes = [];
            var bottom_range    = note.raw_value() + (this.voice_config[v] * Note.N_PER_8VE) - RANGE_UP_DOWN
            var top_range       = note.raw_value() + (this.voice_config[v] * Note.N_PER_8VE) + RANGE_UP_DOWN

            // Find them
            for (var nv = bottom_range; nv < top_range; nv++) { 
                
                if (chord.indexOf(Note.letterOf(nv)) !== -1) { // Its a good note
                    possible_notes.push(new Note(nv));

                }
            }

            // Got all the good notes. Next steps
            P.rintf("Possible notes for this voice: " + possible_notes, 'Harmonizer.events');

            // 1. Find closest note
            var best_note = possible_notes.choice().raw_value();
            var previous_n = (previous_notes.length > 0) ? previous_notes[v].raw_value() : -1;

            if (previous_n != -1) {
                for (var i = 0; i < previous_notes.length; i++) {
                    var pn = previous_notes[i].raw_value();

                    if (Math.abs(pn - previous_n) < (best_note - previous_n) && pn != current_note) {
                        best_note = pn;
                    }
                }
            }


            P.rintf("Best note for voice " + v + ": " + best_note, 'Harmonizer.events');
            note_set.push(new Note(best_note));

        }

        P.rintf("Chose next set of notes: " + note_set, 'Harmonizer.events');

        return note_set;
    }
}

class Note {

    raw_val : number;   // Raw MIDI value of the note.
    cents : number;     // Detuning of the note.


    /*
     *  Static methods / constants.
     */
    
    static N_PER_8VE : number = 12;
    static MIDDLE_C_VAL : number = 60;
    static letter_scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    static letterOf(raw_val : number) {
        return Note.letter_scale[(raw_val % Note.N_PER_8VE)];
    }

    /*
     *  Constructos and factory methods.
     */
    

    /**
     * Constructs note from raw MIDI value.
     * @param {number} Raw MIDI value, where 0 is C from the lowest MIDI octave.
     */
    constructor (raw_val : number) {
        P.roclaim(!isNaN(raw_val), raw_val + " is not a number.");
        this.raw_val = raw_val;
    }

    /*
     *  Instance methods.
     */

    /**
     * Returns the raw MIDI value for current note instance.
     */
    public raw_value() {return this.raw_val;}

    /**
     * Returns the value of current note instance, relative to current octave.
     * (eg. C => 0, C# => 1, etc.)
     */
    public rel_value() {return this.raw_val % Note.N_PER_8VE;}
    
    /**
     * Returns the octvae fro current note instance, where 0 is the lowest 
     * octave (starting with 0, MIDI value for the lowest C).
     */
    public octave() {return this.raw_val / Note.N_PER_8VE;}
    
    /**
     * Returns letter value for current note instance.
     * @param {[type]} ) {return Note.letter_scale[(this.raw_val % Note.N_PER_8VE
     */
    public letter() {return Note.letter_scale[(this.raw_val % Note.N_PER_8VE)];}

    /**
     * Returns frequency value for perfect pitch of current note instance.
     */
    public frequency() {
        var note_from_middle_c = this.raw_value() - Note.MIDDLE_C_VAL + 9;
        return 440 * Math.pow(2, note_from_middle_c / 12);
    }

    /**
     * Returns string representation of the note, that both contains all necesary
     * information to represent the note (raw MIDI value) and is human readable.
     * @return {string} Representation of the note, in format (LETTER@VALUE) (eg. 
     * D@38)
     */
    toString () : string {
        return "(" + this.letter() + "@" + this.raw_value() + ")";
    }
}
