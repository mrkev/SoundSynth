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
