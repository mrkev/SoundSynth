///<reference path="lib/jquery.d.ts"/>
///<reference path="music.ts"/>
///<reference path="utils.ts"/>

class View {
	noteColor = {
		'B'  : "#FF0",
		'A#' : "#FF0",
		'A'  : "#FF0",
		'G#' : "#FF0",
		'G'  : "#FF0",
		'F#' : "#FF0",
		'F'  : "#FF0",
		'E'  : "#FF0",
		'D#' : "#FF0",
		'D'  : "#FF0",
		'C#' : "#FF0",
		'C'  : "#FF0"
	}
	_note : JQuery;
	_dlog : JQuery;
	_debug : boolean;

	constructor (root : JQuery) {
		this._note = root.find('.note');
		this._dlog = root.find('#log');
		this._debug = false;
		this._note.html("<b>Hello world!</b>");
		var nodes = document.getElementsByClassName("note");

		P.rint("Created view with note element"	, "View.lifecycle");
		P.rint(this._note 					    , "View.lifecycle");
	}

	public notePlayed (note : Note) {
		this._note.html(note.letter());
		this._note.css("background-color", this.noteColor[note.letter()]);
	}

	public showLog(yes : boolean) {
		this._debug = yes;
		if (this._debug) {
			//this._note.style.visibility = 'hidden'
			this._note.hide();
		} else {
			this._note.show();
			//this._note.style.visibility = 'visible'
			this._dlog.html('');
		}
	}

	public lg(message : String) {
		this._dlog.prepend("<p>" + message + "</p>");
		// TODO: remove last log if > 50;
	}
}