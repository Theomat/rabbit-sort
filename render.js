
const ASPECT_RATIO = 16 / 9
var width = 0;
var height = 0;
var column_x = 0;

// PEEKING
var peekingAnim = -1;
var unpeekAnim = -1;
var unpeekTarget = -1;
const PEEKING_ANIM_DURATION = 10;

// SWAPPING
let swapsAnimations = [];

const SWAPPING_ANIM_DURATION = 20;

var last_state = { peekingAt: peekingAt };


// MENU
const PEEK_ACTION = 0;
const SWAP_HATS_ACTION = 1;
const SWAP_ALL_ACTION = 2;
let gameStatus = ""
var in_menu = true;
var chosen_action = -1;
var hover_action = -1;
var hover_bottom = false;
var selected = [];

// COLORS
const CLOUDS = "#ecf0f1"; 
const SILVER = "#bdc3c7";
const POMEGRANATE = "#c0392b";
const BELIZE_HOLE = "#2980b9";
const WISTERIA = "#8e44ad";
const MIDNIGHT = "#2c3e50";

const LOCK_COLOR = POMEGRANATE;
const TIMER_COLOR = CLOUDS;
const MENU_COLOR = SILVER;
const HOVER_MENU_COLOR = CLOUDS;
const HAT_INNER_COLOR = BELIZE_HOLE;
const HAT_OUTER_COLOR = CLOUDS;
const RABBIT_OUTER_COLOR = WISTERIA;
const RABBIT_INNER_COLOR = CLOUDS;
const SELECT_COLOR = MIDNIGHT;
const BAD_COLOR = POMEGRANATE;


// Auto manage size
window.addEventListener('load', () => {
    // Get HTML elements
    var my_canvas = document.getElementById("canvas")
    // Update size
    my_canvas.width = getWidth()
    my_canvas.clientWidth = my_canvas.width
    my_canvas.height = my_canvas.width / ASPECT_RATIO
    my_canvas.clientHeight = my_canvas.height

    width = my_canvas.width;
    height = my_canvas.height;

    // get context
    ctx = my_canvas.getContext("2d");

    window.addEventListener('resize', function (event) {
        // Update size
        my_canvas.width = getWidth()
        my_canvas.clientWidth = my_canvas.width
        my_canvas.height = my_canvas.width / ASPECT_RATIO
        my_canvas.clientHeight = my_canvas.height

        width = my_canvas.width;
        height = my_canvas.height;

    });

    my_canvas.onclick = onclick
    my_canvas.addEventListener('mousemove', (event) => {
        let x = event.clientX;
        hover_action = Math.floor(x * 3 / width);
        if (event.clientY / height * 6 > 4.5 && hover_action == 1) {
            hover_bottom = true;
        } else {
            hover_bottom = false;
        }
    });

    start()

    setInterval(render, 25)
}, false);
window.addEventListener('keydown', onkeydown, false);


function start(){
    const msg = "\nChoose difficulty level 1 - " + MAX_DIFFICULTY.toString()
    let difficulty_str = prompt(msg, difficulty.toString());
    while (difficulty_str == null || difficulty_str == "" || parseInt(difficulty_str) < 1 || parseInt(difficulty_str) > MAX_DIFFICULTY) {
        difficulty_str = prompt(msg, difficulty.toString());
    }
    difficulty = parseInt(difficulty_str);
    newGame()
}

function renderToken(x, y, radius, number, innerColor, outerColor) {
    ctx.fillStyle = outerColor;
    ctx.strokeStyle = innerColor;
    ctx.lineWidth = parseInt(radius * 0.2);


    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.stroke();
    ctx.fill()


    ctx.fillStyle = innerColor;
    ctx.beginPath()
    ctx.arc(x, y, radius * .8, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill();

    ctx.fillStyle = outerColor;
    let str = number.toString();
    let fontSize = parseInt(radius * .8);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = fontSize.toString() + "px Arial";
    ctx.fillText(str, x, y);


}

function renderTokens() {
    column_x = [];
    let nspaces = hats.length * (2 + 1) + 1;
    let radius = width / nspaces;
    let x = 2 * radius;
    const y = height / 3;
    for (let index = 0; index < hats.length; index++) {
        const number = hats[index];
        var tokenX = x;
        var tokenY = y;
        if (finished){
            renderToken(x, y , radius, rabbits[index], RABBIT_INNER_COLOR, RABBIT_OUTER_COLOR);
            if (rabbits[index] != index + 1) {
                ctx.save();
                ctx.beginPath()
                ctx.arc(tokenX, tokenY, radius * 1.1, 0, 2 * Math.PI)
                ctx.closePath();
                ctx.clip();

                ctx.strokeStyle = BAD_COLOR;
                ctx.lineWidth = parseInt(radius * 0.1);

                ctx.beginPath();
                ctx.moveTo(tokenX - radius, tokenY - radius);
                ctx.lineTo(tokenX + radius, tokenY + radius);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(tokenX + radius, tokenY - radius);
                ctx.lineTo(tokenX - radius, tokenY + radius);
                ctx.closePath();
                ctx.stroke();

                ctx.restore();
            }
            renderToken(x, y + radius * 3, radius, number, HAT_INNER_COLOR, HAT_OUTER_COLOR);
            tokenY += radius * 3;
            if (hats[index] != index + 1) {
                ctx.save();
                ctx.beginPath()
                ctx.arc(tokenX, tokenY, radius * 1.1, 0, 2 * Math.PI)
                ctx.closePath();
                ctx.clip();

                ctx.strokeStyle = BAD_COLOR;
                ctx.lineWidth = parseInt(radius * 0.1);

                ctx.beginPath();
                ctx.moveTo(tokenX - radius, tokenY - radius);
                ctx.lineTo(tokenX + radius, tokenY + radius);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(tokenX + radius, tokenY - radius);
                ctx.lineTo(tokenX - radius, tokenY + radius);
                ctx.closePath();
                ctx.stroke();

                ctx.restore();
            }

        } else {


            const anim = findSwapAnimation(index);
            if (peekingAt == index || unpeekTarget == index) {
                let progression = unpeekTarget == index ? PEEKING_ANIM_DURATION - unpeekAnim : peekingAnim;
                progression = Math.min(PEEKING_ANIM_DURATION, Math.max(0, progression));
                renderToken(x, y, radius, rabbits[index], RABBIT_INNER_COLOR, RABBIT_OUTER_COLOR);
                tokenY = y - radius * 3 * (PEEKING_ANIM_DURATION - progression) / PEEKING_ANIM_DURATION;
                renderToken(x, tokenY, radius, number, HAT_INNER_COLOR, HAT_OUTER_COLOR);
                if (peekingAt == index)
                    peekingAnim -= 1
                else {
                    unpeekAnim -= 1
                    unpeekTarget = unpeekAnim >= 0 ? unpeekTarget : -1
                }

            } else if (anim != null){
                if(! anim.swap_everything){
                    renderToken(x, y, radius, rabbits[index], RABBIT_INNER_COLOR, RABBIT_OUTER_COLOR);
                }

                const rot_radius = (anim.swap_right - anim.swap_left) * 3 * radius / 2;
                const mid_point = x + (anim.swap_left == index ? 1 : -1) * rot_radius;
                const rot = anim.swappingAnim / SWAPPING_ANIM_DURATION * Math.PI;
                const progression = anim.swap_left == index ? Math.PI - rot : -rot;
                const dx = Math.cos(progression) * rot_radius;
                const dy = Math.sin(progression) * Math.max(3 * radius, rot_radius / 2);
                tokenX = mid_point + dx;
                tokenY = y + dy;
                renderToken(tokenX, tokenY, radius, number, HAT_INNER_COLOR, HAT_OUTER_COLOR);


                if (anim.swap_left == index){
                    anim.swappingAnim -= 1;
                    if(anim.swappingAnim < 0){
                        swapsAnimations.splice(anim.index, 1);
                    }
                }
            } else {
                renderToken(x, y, radius, number, HAT_INNER_COLOR, HAT_OUTER_COLOR);
            }

            if(selected[0] == index){
                ctx.strokeStyle = SELECT_COLOR;
                ctx.lineWidth = parseInt(radius * 0.1);
                const d = ctx.lineWidth;
                ctx.strokeRect(x - radius - d, y - radius - d, 2 * (radius + d), 2 * (radius + d));
            }

            if(locks[index]){
                ctx.save();
                ctx.beginPath()
                ctx.arc(tokenX, tokenY, radius * 1.1, 0, 2 * Math.PI)
                ctx.closePath();
                ctx.clip();

                ctx.strokeStyle = LOCK_COLOR;
                ctx.lineWidth = parseInt(radius * 0.4);

                ctx.beginPath();
                ctx.moveTo(tokenX - radius, tokenY - radius);
                ctx.lineTo(tokenX + radius, tokenY + radius);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(tokenX + radius, tokenY - radius);
                ctx.lineTo(tokenX - radius, tokenY + radius);
                ctx.closePath();
                ctx.stroke();

                ctx.restore();
            }

            column_x.push(x + radius);
        }
        x += 3 * radius;
    }
}

function renderMenu() {
    let fontSize = Math.floor(width / 25);
    ctx.font = fontSize.toString() + "px Arial";
    ctx.fillStyle = HOVER_MENU_COLOR;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Lvl " + difficulty.toString(), 20, 20);
    fontSize = Math.floor(width / (28));
    ctx.font = fontSize.toString() + "px Arial";
    if(finished){
        ctx.fillStyle = HOVER_MENU_COLOR;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(gameStatus, width / 2, height * 5 / 6);
    } else {
        if (in_menu) {
            const texts = ["[A] Peek", "[Z] Swap hats", "[E] Swap all"];
            const unit = width / (texts.length * 5);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            let x = unit * 2;
            for (let index = 0; index < texts.length; index++) {
                const text = texts[index];
                ctx.fillStyle = index == hover_action && !hover_bottom ? HOVER_MENU_COLOR : MENU_COLOR;
                ctx.fillText(text, x, height * 2 / 3);
                x += 5 * unit;
            }
            ctx.fillStyle = hover_bottom ? HOVER_MENU_COLOR : MENU_COLOR;
            ctx.fillText("[R] Finish", width / 2, height * 5 / 6);

        } else {
            const texts = ["Peeking", "Swapping hats", "Swapping all"];
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = MENU_COLOR;
            ctx.fillText(texts[chosen_action], width / 2, height * 2 / 3);

        }
    }
    
}

function renderTimer() {
    const seconds_left = secondsLeft();
    if(!finished && seconds_left < 0){
        finish();
    }
    const min_left = Math.floor(seconds_left / 60);
    const rest_sec = Math.floor(seconds_left - 60 * min_left);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = TIMER_COLOR;
    let text = min_left.toString() + ":";
    if(rest_sec < 10){
        text += "0";
    }
    text += rest_sec.toString();
    const fontSize = Math.floor(width / 25);
    ctx.font = fontSize.toString() + "px Arial";
    ctx.fillText(text, width / 2, height / 6);
}

function render() {
    ctx.textAlign = "center";
    ctx.fillStyle = "#16a085";
    ctx.fillRect(0, 0, width, height);

    renderTokens();
    renderMenu();
    renderTimer();
}


function finish(){
    gameStatus = isCorrect() ? "You won!" : "You lost!";
    endTime = Date.now();
}

function select(index) {
    if(locks[index])
        return;
    selected.push(index);
    if(chosen_action == PEEK_ACTION){
        peekAt(selected);
    } else if(selected.length > 1){
       swap(selected[0], selected[1], chosen_action == SWAP_ALL_ACTION); 
    }
}

function onclick(event) {
    if(finished){
        start();
        return;
    }
    const x = event.clientX;
    if(in_menu){
        chosen_action = Math.floor(x * 3 / width);
        if(event.clientY / height * 6 > 4.5 && chosen_action == 1){
            finish();
        } else {
            in_menu = false;
        }
    } else {
        for (let index = 0; index < column_x.length; index++) {
            const element = column_x[index];
            if (x <= element) {
                select(index);
                break;
            }
        }
    }
    
}

function onkeydown(event) {
    if(finished)
        return;
    if(in_menu){
        if (event.keyCode == 65) {
            chosen_action = PEEK_ACTION;
        } else if (event.keyCode == 90) {
            chosen_action = SWAP_HATS_ACTION;
        } else if (event.keyCode == 69) {
            chosen_action = SWAP_ALL_ACTION;
        } else if (event.keyCode == 82) {
            finish();
        } 
        if (chosen_action >= 0) {
            in_menu = false;
        }
    } else {
        const number = event.keyCode - 48;
        if(number >= 1 && number <= 9){
            select(hat2index[number])
        }
    }
}


turn_update = function () {

    // Peeking Anim update
    if (last_state.peekingAt != peekingAt) {
        unpeekAnim = PEEKING_ANIM_DURATION;
        unpeekTarget = last_state.peekingAt;
        const anim = findSwapAnimation(unpeekTarget);
        if(anim != null){
            unpeekTarget = -1;
        }
        if (peekingAt >= 0)
            peekingAnim = PEEKING_ANIM_DURATION;
    }
    last_state.peekingAt = peekingAt;

    // Next action
    selected = [];
    in_menu = true;
    chosen_action = -1;
};

onswap = function (left_index, right_index, everything) {

    swapsAnimations.push({
        swap_left: left_index,
        swap_right: right_index,
        swap_everything: everything,
        swappingAnim: SWAPPING_ANIM_DURATION,
    })
    
}

function findSwapAnimation(i) {
    for (let index = 0; index < swapsAnimations.length; index++) {
        const animation = swapsAnimations[index];
        if(animation.swap_left == i || animation.swap_right == i){
            animation.index = index;
            return animation;
        }
    }
    return null;
}
