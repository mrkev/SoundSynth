var P = (function () {
    function P() {
    }
    P.rint = function (obj) {
        if (P.rototyping)
            console.log(obj);
    };

    P.rintf = function (obj, tag) {
        if (this.ermitted.indexOf(tag) != -1)
            console.log(obj);
    };
    P.rototyping = true;
    P.ermitted = [];
    return P;
})();


Array.prototype.forin = function (fn) {
    for (var i = 0; i < this.length; i++) {
        fn(this[i]);
    }
};

Array.prototype.choice = function () {
    return this[Math.floor(Math.random() * this.length)];
};
///<reference path="utils.ts"/>
var Harmonizer = (function () {
    function Harmonizer() {
        //
        // Constants
        //
        this.chord_array = {
            'B': ['BDF', 'EGB', 'GBD'],
            'A': ['ACE', 'DFA', 'FAC'],
            'G': ['GBD', 'CEG', 'EGB'],
            'F': ['FAC', 'BDF', 'DFA'],
            'E': ['EGB', 'ACE', 'CEG'],
            'D': ['DFA', 'GBD', 'BDF'],
            'C': ['CEG', 'FAC', 'ACE']
        };
        this.note_to_value = {
            'B': 11,
            'A#': 10,
            'A': 9,
            'G#': 8,
            'G': 7,
            'F#': 6,
            'F': 5,
            'E': 4,
            'D#': 3,
            'D': 2,
            'C#': 1,
            'C': 0
        };
        this.value_to_note = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        //
        // Variables and arguments
        //
        this.voice_config = [0];
        this.voice_prev = [];
        // - same size as voice config
        this.vtracks = [];
    }
    // - same size as voice config
    Harmonizer.prototype.harmonize = function (note) {
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
    };

    Harmonizer.prototype.best_next_note_set = function (note, chord, previous_notes) {
        var RANGE_UP_DOWN = Note.N_PER_8VE / 2;
        var note_set = [];
        var current_note = note.raw_value();

        for (var v = 0; v < this.voice_config.length; v++) {
            // Possilbe notes will be all that match with chord within an octave range
            var possible_notes = [];
            var bottom_range = note.raw_value() + (this.voice_config[v] * Note.N_PER_8VE) - RANGE_UP_DOWN;
            var top_range = note.raw_value() + (this.voice_config[v] * Note.N_PER_8VE) + RANGE_UP_DOWN;

            for (var nv = bottom_range; nv < top_range; nv++) {
                if (chord.indexOf(Note.letterOf(nv)) !== -1) {
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
    };
    return Harmonizer;
})();

var Note = (function () {
    function Note(raw_val) {
        this.raw_val = raw_val;
    }
    Note.letterOf = function (raw_val) {
        return Note.letter_scale[(raw_val % Note.N_PER_8VE)];
    };

    Note.prototype.raw_value = function () {
        return this.raw_val;
    };
    Note.prototype.rel_value = function () {
        return this.raw_val % Note.N_PER_8VE;
    };
    Note.prototype.octave = function () {
        return this.raw_val / Note.N_PER_8VE;
    };
    Note.prototype.letter = function () {
        return Note.letter_scale[(this.raw_val % Note.N_PER_8VE)];
    };

    Note.prototype.toString = function () {
        return "(" + this.letter() + "@" + this.raw_value() + ")";
    };

    Note.prototype.frequency = function () {
        var note_from_middle_c = this.raw_value() - Note.MIDDLE_C_VAL + 9;
        return 440 * Math.pow(2, note_from_middle_c / 12);
    };
    Note.N_PER_8VE = 12;
    Note.MIDDLE_C_VAL = 60;
    Note.letter_scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return Note;
})();
///<reference path="lib/jquery.d.ts"/>
///<reference path="music.ts"/>
///<reference path="utils.ts"/>
var View = (function () {
    function View(root) {
        this.noteColor = {
            'B': "#FF0",
            'A#': "#FF0",
            'A': "#FF0",
            'G#': "#FF0",
            'G': "#FF0",
            'F#': "#FF0",
            'F': "#FF0",
            'E': "#FF0",
            'D#': "#FF0",
            'D': "#FF0",
            'C#': "#FF0",
            'C': "#FF0"
        };
        this._note = root.find('.note');
        this._dlog = root.find('#log');
        this._debug = false;

        P.rint(this._note);
        console.log("a" + this._note);
        console.dir(this._note);
        //P.rintf ( "Initializing View. Will display notes at: " + this._note.html.toString(), "View.lifecycle");
    }
    View.prototype.notePlayed = function (note) {
        this._note.html(note.letter());
        this._note.css("background-color", this.noteColor[note.letter()]);
    };

    View.prototype.showLog = function (yes) {
        this._debug = yes;
        if (this._debug) {
            //this._note.style.visibility = 'hidden'
            this._note.hide();
        } else {
            this._note.show();

            //this._note.style.visibility = 'visible'
            this._dlog.html('');
        }
    };

    View.prototype.lg = function (message) {
        this._dlog.prepend("<p>" + message + "</p>");
        // TODO: remove last log if > 50;
    };
    return View;
})();
