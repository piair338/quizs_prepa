window.questions = [];
window.questions_justes = [];
window.questions_fausses = [];
window.question_actu_id = 0;

window.click_x = 0;
window.click_y = 0;
window.is_clicked = false;

window.disabled = [];

window.score = 0;
window.nb_question = 0;
window.state = 0;

window.agl = 0;

window.deb_att = 0;
const tps_attente = 100;

const lim_agl = 0.4;

function init() {
    // ON RECUPERE LES COOKIES
    window.disabled = load_cookie("maths");
    // ON RECUPERE LE THEME
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has("themes")) {
        window.themes = urlParams.get("themes").split(",");
    } else {
        // ON VA RENVOYER SUR LA PAGE D'INDEX
        window.location.href = "index.html";
    }
    // ON INITIALIZE
    for (theme of window.themes) {
        if (Object.keys(Quizs).includes(theme)) {
            // window.questions = window.questions.concat(Quizs[theme]);
            for (question of Quizs[theme]) {
                if (!window.disabled.includes(question.id)) {
                    window.questions.push(question);
                }
            }
        }
    }
    if (window.questions.length == 0) {
        // ON VA RENVOYER SUR LA PAGE D'INDEX
        window.location.href = "index.html";
        return;
    }
    //
    next_question();
}

function next_question() {
    // On regarde s'il reste des questions à tirer
    if (window.questions.length > 0) {
        // On tire au hasard un question
        window.question_actu_id = parseInt(Math.random() * window.questions.length);
        document.getElementById("card_titre").innerHTML = compile_txt(window.questions[window.question_actu_id].titre);
        document.getElementById("card_hypotheses").innerHTML = "";
        document.getElementById("card_resultat").innerHTML = "";
        MathJax.typesetPromise();
        card.style.rotate = "0rad";
        card.style.boxShadow = "none";
        window.state = 1;
        // On affiche le score
        document.getElementById("score").innerHTML = "Score : " + score + " / " + nb_question;
        window.nb_question++;
        // On fait attendre un peu avant de pouvoir reveal
        var date = new Date();
        window.deb_att = date.getTime();
    } // Sinon, on renvoie vers la page de fin
    else {
        window.state = 3;
        document.getElementById("span_score").innerHTML = "" + score + " / " + nb_question;
        document.getElementById("nb_cartes_justes").innerHTML = window.questions_justes.length;
        document.getElementById("nb_cartes_fausses").innerHTML = window.questions_fausses.length;
        document.getElementById("score").innerHTML = "Score : " + score + " / " + nb_question;
        document.getElementById("block_input").style.display = "none";
        document.getElementById("block_fin").style.display = "block";
    }
}

function reveal() {
    if (window.state == 1) {
        var date = new Date();
        if (date.getTime() - window.deb_att >= tps_attente) {
            document.getElementById("card_hypotheses").innerHTML = compile_txt(window.questions[window.question_actu_id].hypotheses);
            document.getElementById("card_resultat").innerHTML = compile_txt(window.questions[window.question_actu_id].resultat);
            MathJax.typesetPromise();
            window.state = 2;
        }
    }
}

function restart_all() {
    window.state = 0;
    window.score = 0;
    window.nb_question = 0;
    window.questions = window.questions_fausses.concat(window.questions_justes);
    window.questions_fausses = [];
    window.questions_justes = [];
    document.getElementById("block_input").style.display = "block";
    document.getElementById("block_fin").style.display = "none";
    next_question();
}

function restart_only_ratees() {
    if (window.questions_fausses.length == 0) {
        alert("Vous n'avez raté aucune question, vous ne pouvez donc pas recommencer avec seulement les questions fausses puisqu'il n'y en a pas !");
    } else {
        window.state = 0;
        window.score = 0;
        window.nb_question = 0;
        window.questions = window.questions_fausses;
        window.questions_fausses = [];
        window.questions_justes = [];
        document.getElementById("block_input").style.display = "block";
        document.getElementById("block_fin").style.display = "none";
        next_question();
    }
}


function card_mouse_down(event) {
    if (window.state == 2) {
        window.click_x = event.clientX;
        window.click_y = event.clientY;
        window.is_clicked = true;
        card.style.rotate = "0rad";
        card.style.boxShadow = "none";
        window.agl = 0;
    }
}


document.body.addEventListener('mousemove', e => { rotate(e); });
document.body.addEventListener('drag', e => { rotate(e); });

function rotate(e) {
    if (window.state == 2 && window.is_clicked) {
        var card = document.getElementById("card");
        var x = e.clientX;
        var y = e.clientY;
        var dx = x - window.click_x;
        var dy = 100;
        //
        if (dy > 0) {
            var agl = Math.atan(dx / dy);
            if (agl < -lim_agl) { agl = -lim_agl; }
            if (agl > lim_agl) { agl = lim_agl; }
            // console.log("agl : ", agl);
            card.style.rotate = "" + agl + "rad";
            window.agl = agl;
            //
            if (agl < 0) {
                var aa = Math.abs(agl);
                card.style.boxShadow = "0 0 0 " + (aa / 2.0) + "rem red";
            } else if (agl > 0) {
                card.style.boxShadow = "0 0 0 " + (agl / 2.0) + "rem green";
            } else {
                card.style.boxShadow = "none";
            }
        }
    }
}

document.body.addEventListener('mouseup', e => { click_up(e); });
document.body.addEventListener('mouseleave', e => { click_up(e); });

function click_up(e) {
    if (window.state == 2) {
        window.click_x = 0;
        window.click_y = 0;
        window.is_clicked = false;
        card.style.rotate = "0rad";
        card.style.boxShadow = "none";
        if (window.agl == -lim_agl) {
            // C'est raté
            window.questions_fausses.push(window.questions[window.question_actu_id]);
            window.questions.splice(window.question_actu_id, 1);
            next_question();
        } else if (window.agl == lim_agl) {
            // C'est juste
            window.questions_justes.push(window.questions[window.question_actu_id]);
            window.questions.splice(window.question_actu_id, 1);
            window.score += 1;
            next_question();
        }
        window.agl = 0;
    }
}