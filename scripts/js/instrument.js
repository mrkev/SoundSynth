var P = (function () {
    function P() {
    }
    P.rint = function (obj, tag) {
        if (tag && this.ermitted.indexOf(tag) == -1)
            return;
        if (P.rototyping)
            console.log(obj);
    };

    P.rintf = function (obj, tag) {
        if (this.ermitted.indexOf(tag) != -1)
            console.log(obj);
    };

    P.roclaim = function (condition, message) {
        if (!condition) {
            throw message || "Assertion failed.";
        }
    };
    P.rototyping = true;
    P.ermitted = [];
    return P;
})();

var Broadcaster = (function () {
    function Broadcaster() {
        this.observers = [];
    }
    Broadcaster.prototype.registerObserver = function (observer) {
        this.observers.push(observer);
    };
    Broadcaster.prototype.removeObserver = function (observer) {
        this.observers.splice(this.observers.indexOf(observer), 1);
    };

    Broadcaster.prototype.notifyObservers = function (arg) {
        this.observers.forEach(function (element, index, array) {
            element.update(arg);
        });
    };
    return Broadcaster;
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
    /*
    *  Constructos and factory methods.
    */
    /**
    * Constructs note from raw MIDI value.
    * @param {number} Raw MIDI value, where 0 is C from the lowest MIDI octave.
    */
    function Note(raw_val) {
        P.roclaim(!isNaN(raw_val), raw_val + " is not a number.");
        this.raw_val = raw_val;
    }
    Note.letterOf = function (raw_val) {
        return Note.letter_scale[(raw_val % Note.N_PER_8VE)];
    };

    /*
    *  Instance methods.
    */
    /**
    * Returns the raw MIDI value for current note instance.
    */
    Note.prototype.raw_value = function () {
        return this.raw_val;
    };

    /**
    * Returns the value of current note instance, relative to current octave.
    * (eg. C => 0, C# => 1, etc.)
    */
    Note.prototype.rel_value = function () {
        return this.raw_val % Note.N_PER_8VE;
    };

    /**
    * Returns the octvae fro current note instance, where 0 is the lowest
    * octave (starting with 0, MIDI value for the lowest C).
    */
    Note.prototype.octave = function () {
        return this.raw_val / Note.N_PER_8VE;
    };

    /**
    * Returns letter value for current note instance.
    * @param {[type]} ) {return Note.letter_scale[(this.raw_val % Note.N_PER_8VE
    */
    Note.prototype.letter = function () {
        return Note.letter_scale[(this.raw_val % Note.N_PER_8VE)];
    };

    /**
    * Returns frequency value for perfect pitch of current note instance.
    */
    Note.prototype.frequency = function () {
        var note_from_middle_c = this.raw_value() - Note.MIDDLE_C_VAL + 9;
        return 440 * Math.pow(2, note_from_middle_c / 12);
    };

    /**
    * Returns string representation of the note, that both contains all necesary
    * information to represent the note (raw MIDI value) and is human readable.
    * @return {string} Representation of the note, in format (LETTER@VALUE) (eg.
    * D@38)
    */
    Note.prototype.toString = function () {
        return "(" + this.letter() + "@" + this.raw_value() + ")";
    };
    Note.N_PER_8VE = 12;
    Note.MIDDLE_C_VAL = 60;
    Note.letter_scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return Note;
})();
///<reference path="lib/webaudio.d.ts"/>
///<reference path="music.ts"/>
var WebAudioFactory = (function () {
    function WebAudioFactory() {
    }
    WebAudioFactory.check = function () {
        if (typeof AudioContext !== 'undefined') {
            this.sts = 1;
        } else if (typeof webkitAudioContext !== 'undefined') {
            this.sts = 2;
        } else {
            this.sts = 0;
        }
        // Thanks to https://hacks.mozilla.org/2013/02/simplifying-audio-in-the-browser/
        // for the base of this freature detection code.
    };

    WebAudioFactory.audioContext = function () {
        if (this.sts == -1)
            WebAudioFactory.check();
        if (this.sts == 1)
            return new AudioContext();
        if (this.sts == 2)
            return new webkitAudioContext();
        if (this.sts == 0) {
            console.log("Web Audio is not supported by this browser, it seems.");
            return null;
        }
    };

    WebAudioFactory.gainNode = function (context) {
        if (this.sts == -1)
            WebAudioFactory.check();
        if (this.sts == 1)
            return context.createGain();
        if (this.sts == 2)
            return context.createGainNode();
        if (this.sts == 0) {
            console.log("Web Audio is not supported by this browser, it seems.");
            return null;
        }
    };
    WebAudioFactory.sts = -1;
    return WebAudioFactory;
})();

var Instrument = (function () {
    function Instrument(num_osc) {
        this.num_osc = num_osc;
        this.osc_arr = [];
        this.attackTime = .02;
        this.releaseTime = .3;
        this.env = function () {
        };
        this.context = WebAudioFactory.audioContext();

        var lowpass_filter = this.context.createBiquadFilter();
        var wave_shaper = this.context.createWaveShaper();
        var panner = this.context.createPanner();
        var compressor = this.context.createDynamicsCompressor();
        var reverb = this.context.createConvolver();

        var master_dry = WebAudioFactory.gainNode(this.context);
        var master_wet = WebAudioFactory.gainNode(this.context);
        this.gain = WebAudioFactory.gainNode(this.context);

        for (var i = num_osc; i > 0; i--) {
            var osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.connect(this.gain);
            this.osc_arr.push(osc);
        }

        this.gain.gain.value = 10;
        this.gain.connect(this.context.destination);

        //panner.connect(master_dry);
        //master_dry.connect(reverb);
        //reverb.connect(compressor);
        //compressor.connect(context.destination);
        /*this.osc1.noteOn(0);
        this.osc2.noteOn(0);*/
        this.osc_arr.forin(function (osc) {
            osc.start(0);
        });

        this.gain.gain.value = 0;

        //this.gain.gain.setValueAtTime(0, this.context.currentTime);
        P.rint('Starting instrument', "Instrument.lifecycle");
    }
    Instrument.prototype.playFreq = function (frequency) {
        //this.gain.gain.value = 1;
        var now = this.context.currentTime;

        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(0, now);
        this.gain.gain.linearRampToValueAtTime(1, now + this.attackTime);
        this.gain.gain.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
        this.osc_arr.forin(function (osc) {
            osc.frequency.value = frequency;
        });
    };

    Instrument.prototype.playNote = function (note) {
        this.playFreq(note.frequency());
    };

    Instrument.prototype.mute = function () {
        this.gain.gain.value = 0;
    };
    return Instrument;
})();

var Maschine = (function () {
    function Maschine() {
        var context = new AudioContext();

        var vco = new VCO(context);
        var vca = new VCA(context);
        var env = new EnvelopeGenerator(context);

        vco.connect(vca);
        vca.connect(context.destination);
        env.apply(vca.amplitude);
    }
    return Maschine;
})();

var EnvelopeGenerator = (function () {
    function EnvelopeGenerator(context) {
        this.context = context;
        this.attackTime = .1;
        this.releaseTime = .1;
    }
    EnvelopeGenerator.prototype.trigger = function () {
        var now = this.context.currentTime;
        this.param.cancelScheduledValues(now);
        this.param.setValueAtTime(0, now);
        this.param.linearRampToValueAtTime(1, now + this.attackTime);
    };

    EnvelopeGenerator.prototype.apply = function (param) {
        this.param = param;
    };
    return EnvelopeGenerator;
})();

var VCO = (function () {
    function VCO(context) {
        this.context = context;
        this.osc = context.createOscillator();
        this.osc.type = 'sawtooth';

        //this.setFrequency(440);
        this.osc.noteOn(0);

        this.output = this.osc;
        this.input = this.osc;
    }
    VCO.prototype.setFrequency = function (freq) {
        this.osc.frequency.setValueAtTime(freq, this.context.currentTime);
    };

    VCO.prototype.connect = function (node) {
        if (node.hasOwnProperty('input')) {
            this.output.connect(node.input);
        } else {
            this.output.connect(node);
        }
    };
    return VCO;
})();

var VCA = (function () {
    function VCA(context) {
        this.gain = context.createGain();
        this.gain.gain.value = 0;
        this.input = this.gain;
        this.output = this.gain;
        this.amplitude = this.gain.gain;
    }
    VCA.prototype.connect = function (node) {
        if (node.hasOwnProperty('input')) {
            this.output.connect(node.input);
        } else {
            this.output.connect(node);
        }
    };
    return VCA;
})();
