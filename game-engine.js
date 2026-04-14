const ENGINE = {
    roomData: null,
    words: [
        { main: "ELMA", forbidden: ["Meyve", "Kırmızı", "Amasya", "Ağaç", "Isırmak"] },
        { main: "GÜNEŞ", forbidden: ["Sarı", "Sıcak", "Yıldız", "Gündüz", "Parlak"] }
    ],
    update(data) {
        this.roomData = data;
        const me = data.players?.[NET.myId];
        if (data.status === 'playing') {
            document.getElementById('screen-lobby').classList.remove('active');
            document.getElementById('screen-game').classList.add('active');
            this.renderGame(me);
        }
        document.getElementById('score-display').textContent = `A: ${data.scoreA || 0} | B: ${data.scoreB || 0}`;
    },
    renderGame(me) {
        const screen = document.getElementById('screen-game');
        const isAnlatici = me?.role === 'anlatici';
        screen.className = `screen active ${me?.role}-${me?.team === 'blue' ? 'a' : 'b'}`;
        
        document.getElementById('narrator-controls').style.display = isAnlatici ? 'block' : 'none';
        document.getElementById('guess-area').style.display = isAnlatici ? 'none' : 'block';
        
        if (isAnlatici && this.roomData.currentWord) {
            document.getElementById('word-main').textContent = this.roomData.currentWord.main;
            document.getElementById('word-forbidden').innerHTML = this.roomData.currentWord.forbidden.join('<br>');
        } else {
            document.getElementById('word-main').textContent = "???";
            document.getElementById('word-forbidden').textContent = "Arkadaşını Dinle!";
        }
    },
    startGame() {
        NET.roomRef.update({
            status: 'playing',
            scoreA: 0, scoreB: 0,
            currentWord: this.words[Math.floor(Math.random() * this.words.length)]
        });
    },
    reportCorrect() {
        const key = this.roomData.currentTurn === 'blue' ? 'scoreA' : 'scoreB';
        NET.roomRef.child(key).set((this.roomData[key] || 0) + 1);
        this.nextWord();
    },
    nextWord() {
        NET.roomRef.update({ currentWord: this.words[Math.floor(Math.random() * this.words.length)] });
    }
};