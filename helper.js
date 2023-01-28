function getWidth() {
    return Math.max(
        document.documentElement["clientWidth"],
        document.body["scrollWidth"],
        document.documentElement["scrollWidth"],
        document.body["offsetWidth"],
        document.documentElement["offsetWidth"]
    ) - 15;
}


function getHeight() {
    return Math.max(
        document.documentElement["clientHeight"],
        document.body["scrollHeight"],
        document.documentElement["scrollHeight"],
        document.body["offsetHeight"],
        document.documentElement["offsetHeight"]
    );
}


Array.prototype.shuffle = function() {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
}