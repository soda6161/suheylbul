const ENGINE = {
    roomData: null,
    timerInterval: null,
    words: [
        { m: "KORSAN", f: ["Gemi","Deniz","Kanca","Hazine","Papağan"] },
        { m: "PİZZA", f: ["Hamur","İtalyan","Peynir","Dilim","Sucuk"] },
        { m: "ASTRONOT", f: ["Uzay","Ay","Roket","Kıyafet","Yıldız"] },
        { m: "VAMPİR", f: ["Diş","Gece","Kan","Pelerin","Sarımsak"] },
        { m: "KİTAP", f: ["Sayfa","Roman","Kütüphane","Okumak","Yazar"] },
        { m: "UFO", f: ["Uzaylı","Disk","Işık","Gök","Yabancı"] },
        { m: "KEDİ", f: ["Hayvan","Patı","Miyav","Süt","Tüy"] },
        { m: "TELEFON", f: ["Akıllı","Ekran","Arama","Mesaj","Şarj"] }
    ],

    update(data) {
        this.roomData = data;
        const me = data.players?.[NET.myId];

        if (!me) return;

        if (data.status === 'playing') {
            this.renderGame(me, data);
        } else {
            this.renderLobby(data);
        }
    },

    renderLobby(data) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-lobby').classList.add('active');
        document.getElementById('room-code-display').textContent = NET.roomCode;

        const slots = { red: { anlatici: [], dinleyici: [] }, blue: { anlatici: [], dinleyici: [] } };
        Object.values(data.players || {}).forEach(p => {
            if (p.team && p.role) slots[p.team][p.role].push(p.name || "Oyuncu");
        });

        document.getElementById('slot-red-narrator').textContent = slots.red.anlatici[0] || 'Bekleniyor...';
        document.getElementById('slot-red-guesser').textContent = slots.red.dinleyici[0] || 'Bekleniyor...';
        document.getElementById('slot-blue-narrator').textContent = slots.blue.anlatici[0] || 'Bekleniyor...';
        document.getElementById('slot-blue-guesser').textContent = slots.blue.dinleyici[0] || 'Bekleniyor...';
    },

    renderGame(me, data) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('screen-game');
        screen.classList.add('active');

        const team = me.team === 'blue' ? 'blue' : 'red';
        const role = me.role === 'anlatici' ? 'narrator' : 'listener';
        screen.className = `screen active ${role}-${team}`;

        const isNarrator = me.role === 'anlatici';
        document.getElementById('narrator-controls').style.display = isNarrator ? 'flex' : 'none';
        document.getElementById('listener-controls').style.display = isNarrator ? 'none' : 'flex';

        document.getElementById('score-display').textContent = `K: ${data.scoreRed || 0} | M: ${data.scoreBlue || 0}`;

        if (isNarrator) {
            document.getElementById('word-main').textContent = data.currentWord.m;
            document.getElementById('word-forbidden').innerHTML = data.currentWord.f.join('<br>');
        } else {
            document.getElementById('word-main').textContent = "???";
            document.getElementById('word-forbidden').innerHTML = "ARKADAŞINI DİNLE!<br>TAHMİNİNİ YAZ";
        }

        this.startTimer();
    },

    startGame() {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        NET.roomRef.update({
            status: 'playing',
            currentWord: word,
            scoreRed: 0,
            scoreBlue: 0
        });
    },

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        let time = 60;
        const timerEl = document.getElementById('timer-display');
        timerEl.textContent = `00:${time}`;

        this.timerInterval = setInterval(() => {
            time--;
            timerEl.textContent = `00:${time < 10 ? '0' : ''}${time}`;
            if (time <= 0) {
                clearInterval(this.timerInterval);
                this.nextWord();
                this.flash('rgba(255,165,0,0.5)');
            }
        }, 1000);
    },

    reportCorrect() {
        const teamKey = this.roomData.players[NET.myId].team === 'blue' ? 'scoreBlue' : 'scoreRed';
        NET.roomRef.child(teamKey).set((this.roomData[teamKey] || 0) + 1);
        this.nextWord();
        this.flash('rgba(0,255,0,0.45)');
    },

    reportTabu() {
        const teamKey = this.roomData.players[NET.myId].team === 'blue' ? 'scoreBlue' : 'scoreRed';
        NET.roomRef.child(teamKey).set((this.roomData[teamKey] || 0) - 1);
        this.nextWord();
        this.flash('rgba(255,0,0,0.45)');
    },

    passCard() {
        this.nextWord();
        this.flash('rgba(255,165,0,0.45)');
    },

    nextWord() {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        NET.roomRef.update({ currentWord: word });
    },

    submitGuess() {
        const input = document.getElementById('guess-input');
        if (input.value.trim()) {
            alert(`Tahminin: "${input.value.trim()}"\nArkadaşların duydu! 🔥`);
            input.value = '';
        }
    },

    flash(color) {
        const f = document.getElementById('flash-overlay');
        f.style.background = color;
        f.style.display = 'block';
        setTimeout(() => f.style.display = 'none', 280);
    }
};