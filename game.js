let ALLOTED_TIME = 120;
// GAME VARS
var difficulty = 1;

var rabbits = 0;
var hats = 0;
var hat2index = 0;
var locks = 0;
var locksNum = 0;
var randomSwapsNum = false;
const RANDOM_SWAP_FREQ = 3;
var swap_timer = RANDOM_SWAP_FREQ;

var peekingAt = -1;

var onswap = null;
var turn_update = null;

let startTime = 0;
let endTime = -1;

let finished = false;




const MAX_DIFFICULTY = 20;


function secondsUsed() {
    return ((endTime > 0 ? endTime : Date.now()) - startTime) / 1000;
}


function secondsLeft() {
    return ALLOTED_TIME - secondsUsed();
}

function newGame() {

    ALLOTED_TIME = 120;
    finished = false;
    locksNum = 0;
    randomSwapsNum = Math.floor((difficulty - 1) / 4);
    locksNum = (difficulty - 1) % 4;

    swap_timer = 0;

    rabbits = [];
    hats = [];
    hat2index = [];
    locks = [];
    for (let index = 0; index < 9; index++) {
        rabbits.push(index + 1);
        hats.push(index + 1);
        hat2index.push(0);
        locks.push(index < locksNum);
    }

    rabbits.shuffle()
    hats.shuffle()
    locks.shuffle();

    for (let index = 0; index < hats.length; index++) {
        const element = hats[index];
        hat2index[element] = index;
    }

    peekingAt = -1;

    endTime = -1;
    startTime = Date.now();

}

function swap(index1, index2, swap_rabbits, proc_turn = true) {
    if(proc_turn){
        turn_start();
    }
    if(peekingAt == index1)
        peekingAt = index2;
    else if(peekingAt == index2)
        peekingAt = index1;
    [hats[index1], hats[index2]] = [hats[index2], hats[index1]];
    [hat2index[hats[index1]], hat2index[hats[index2]]] = [hat2index[hats[index2]], hat2index[hats[index1]]];
    if (swap_rabbits) {
        [rabbits[index1], rabbits[index2]] = [rabbits[index2], rabbits[index1]];
    }
    if (onswap != null) {
        onswap(Math.min(index1, index2), Math.max(index1, index2), swap_rabbits);
    }
    if(proc_turn){
        turn_end();
    }
}


function peekAt(index) {
    turn_start();
    peekingAt = index;
    turn_end();
}


function turn_start() {
    peekingAt = -1;
}

function randomSwap() {
    let i = Math.floor(Math.random() * hats.length);
    while (i == peekingAt) {
        i = Math.floor(Math.random() * hats.length)
    }
    let j = Math.floor(Math.random() * hats.length);
    while (j == i || j == peekingAt) {
        j = Math.floor(Math.random() * hats.length)
    }
    swap(i, j, true, false)
}

function turn_end() {
    locks.shuffle();
    if(randomSwapsNum > 0){
        swap_timer += 1;
        if(swap_timer >= RANDOM_SWAP_FREQ){
            for (let index = 0; index < randomSwapsNum; index++) {                
                randomSwap();
            }
            swap_timer = isCorrectButUnsorted()  ? -RANDOM_SWAP_FREQ * 99999999 : 0;
        }
        
    }
    if (turn_update != null) {
        turn_update()
    }
}

function isCorrectButUnsorted() {
    for (let index = 0; index < hats.length; index++) {
        if (hats[index] != rabbits[index])
            return false;
    }
    return true;
}

function isCorrect() {
    finished = true;
    for (let index = 0; index < hats.length; index++) {
        if(index +1 != hats[index] || hats[index] != rabbits[index])
            return false;
    }
    return true;
}