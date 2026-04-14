const ENGINE = {
    roomData: null,
    words: [
        { m: "KORSAN", f: ["Gemi", "Deniz", "Kanca", "Hazine", "Papağan"] },
        { m: "TELEFON", f: ["Arama", "Ekran", "Mesaj", "Akıllı", "Tuş"] },
        { m: "İSTANBUL", f: ["Boğaz", "Deniz", "Şehir", "Kalabalık", "Metropol"] }
    ],
    update(data) {
        this.roomData = data;
        const me = data.players?.[NET.myId];
        if (data.status === 'playing') {
            this.renderGame(me, data);
        } else {
            this.renderLobby(data);
        }
    },
    renderLobby(data) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-lobby').classList.add('active');
    },
    renderGame(me, data) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('screen-game');
        screen.classList.add('active');
        const role = me.role === 'anlatici' ? 'narrator' : 'listener';
        const team = me.team === 'blue' ? 'blue' : 'red';
        screen.className = `screen active ${role}-${team}`;
        document.getElementById('narrator-controls').style.display = me.role === 'anlatici' ? 'block' : 'none';
        if (me.role === 'anlatici') {
            document.getElementById('word-main').textContent = data.currentWord.m;
            document.getElementById('word-forbidden').innerHTML = data.currentWord.f.join('<br>');
        } else {
            document.getElementById('word-main').textContent = "???";
            document.getElementById('word-forbidden').textContent = "ARKADAŞINI DİNLE!";
        }
    },
    startGame() {
        NET.roomRef.update({
            status: 'playing',
            currentWord: this.words[Math.floor(Math.random() * this.words.length)],
            scoreRed: 0, scoreBlue: 0
        });
    },
    reportCorrect() {
        const key = this.roomData.players[NET.myId].team === 'blue' ? 'scoreBlue' : 'scoreRed';
        NET.roomRef.child(key).set((this.roomData[key] || 0) + 1);
        this.nextWord();
        this.flash('rgba(0,255,0,0.5)');
    },
    reportTabu() {
        const key = this.roomData.players[NET.myId].team === 'blue' ? 'scoreBlue' : 'scoreRed';
        NET.roomRef.child(key).set((this.roomData[key] || 0) - 1);
        this.nextWord();
        this.flash('rgba(255,0,0,0.5)');
    },
    nextWord() {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        NET.roomRef.update({ currentWord: word });
    },
    flash(color) {
        const f = document.getElementById('flash-overlay');
        f.style.background = color; f.style.display = 'block';
        setTimeout(() => f.style.display = 'none', 200);
    }
};