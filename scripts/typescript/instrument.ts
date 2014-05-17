///<reference path="lib/webaudio.d.ts"/>
///<reference path="music.ts"/>

class Instrument {
	private context;
	private gain;
	private osc_arr = [];

	private attackTime = .02;
	private releaseTime = .3;

	private env = function () {

	}

	constructor (public num_osc : number) {
		this.context = new AudioContext() || new webkitAudioContext();

		var lowpass_filter  = this.context.createBiquadFilter();
		var wave_shaper     = this.context.createWaveShaper();
		var panner          = this.context.createPanner();
		var compressor      = this.context.createDynamicsCompressor();
		var reverb          = this.context.createConvolver();

		var master_dry      = this.context.createGain();
		var master_wet      = this.context.createGain();
		this.gain       	= this.context.createGain();

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

		console.log('starting');
	}

	playFreq(frequency : number) {
		//this.gain.gain.value = 1;
		var now = this.context.currentTime;

		this.gain.gain.cancelScheduledValues(now);
		this.gain.gain.setValueAtTime(0, now);
		this.gain.gain.linearRampToValueAtTime(1, now + this.attackTime);
		this.gain.gain.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
		this.osc_arr.forin(function (osc) {
			osc.frequency.value = frequency;
		});
	}

	playNote(note : Note) {
		this.playFreq(note.frequency());
	}

	mute () {
		this.gain.gain.value = 0;
	}


}


class Maschine {
	constructor () {
		var context = new AudioContext();

		var vco = new VCO(context);
		var vca = new VCA(context);
		var env = new EnvelopeGenerator(context);

		vco.connect(vca);
		vca.connect(context.destination);
		env.apply(vca.amplitude);
	}
}


class EnvelopeGenerator {
	public attackTime;
	public releaseTime;
	private param;
	private context;

	constructor (context) {
		this.context = context;
		this.attackTime = .1;
		this.releaseTime = .1;
	}

	trigger () {
		var now = this.context.currentTime;
		this.param.cancelScheduledValues(now); 
		this.param.setValueAtTime(0, now);
		this.param.linearRampToValueAtTime(1, now + this.attackTime);
	}


	apply (param) {
		this.param = param;
	}
}


class VCO {
	public  context;
	private osc;
	
	private output;
	private input;

	constructor (context) {
		this.context  = context;
		this.osc      = context.createOscillator();
		this.osc.type = 'sawtooth';

		//this.setFrequency(440);
		this.osc.noteOn(0);

		this.output = this.osc;
		this.input  = this.osc;
	} 

	setFrequency (freq : number) {
		this.osc.frequency.setValueAtTime(freq, this.context.currentTime);
	}

	connect (node) {
		if (node.hasOwnProperty('input')) {
			this.output.connect(node.input);
		} else {
			this.output.connect(node);
		}
	}
}

class VCA {
	private context;
	private gain;
	private input;
	private output;
	public amplitude;

	constructor(context) {
		this.gain = context.createGain();
		this.gain.gain.value = 0;
		this.input = this.gain;
		this.output = this.gain;
		this.amplitude = this.gain.gain;
	}

	connect (node) {
		if (node.hasOwnProperty('input')) {
			this.output.connect(node.input);
		} else {
			this.output.connect(node);
		}
	}
}



