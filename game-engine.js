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
        { m: "TELEFON", f: ["Akıllı","Ekran","Arama","Mesaj","Şarj"] },
        { m: "ROKET", f: ["Uzay","Ateş","Hız","Yıldız","Gök"] },
        { m: "KÖPEK", f: ["Havlama","Sadık","Kemik","Kuyruk","Patı"] }
    ],

    update(data) {
        this.roomData = data;
        const me = data.players?.[NET.myId];
        if (!me) return;

        if (data.status === 'playing') this.renderGame(me, data);
        else this.renderLobby(data);
    },

    renderLobby(data) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-lobby').classList.add('active');
        document.getElementById('room-code-display').textContent = NET.roomCode;

        const slots = { red: { anlatici: [], dinleyici: [] }, blue: { anlatici: [], dinleyici: [] } };
        Object.values(data.players || {}).forEach(p => {
            if (p.team && p.role) slots[p.team][p.role].push(p.name);
        });

        const makeList = (arr) => {
            const container = document.createElement('div');
            arr.forEach(name => {
                const span = document.createElement('span');
                span.textContent = name;
                container.appendChild(span);
            });
            return container.innerHTML || '<span style="opacity:0.5">Bekleniyor...</span>';
        };

        document.getElementById('slot-red-narrator').innerHTML = makeList(slots.red.anlatici);
        document.getElementById('slot-red-guesser').innerHTML = makeList(slots.red.dinleyici);
        document.getElementById('slot-blue-narrator').innerHTML = makeList(slots.blue.anlatici);
        document.getElementById('slot-blue-guesser').innerHTML = makeList(slots.blue.dinleyici);
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
            document.getElementById('word-forbidden').innerHTML = "ARKADAŞINI DİNLE!";
        }

        this.startTimer();
    },

    startGame() {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        NET.roomRef.update({ status: 'playing', currentWord: word, scoreRed: 0, scoreBlue: 0 });
    },

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        let time = 60;
        const el = document.getElementById('timer-display');
        el.textContent = `00:${time}`;

        this.timerInterval = setInterval(() => {
            time--;
            el.textContent = `00:${time < 10 ? '0' : ''}${time}`;
            if (time <= 0) {
                clearInterval(this.timerInterval);
                this.nextWord();
            }
        }, 1000);
    },

    reportCorrect() { this.scoreChange(1); this.nextWord(); this.flash('#00cc44'); },
    reportTabu() { this.scoreChange(-1); this.nextWord(); this.flash('#ff3333'); },
    passCard() { this.nextWord(); this.flash('#ffaa00'); },

    scoreChange(delta) {
        const teamKey = this.roomData.players[NET.myId].team === 'blue' ? 'scoreBlue' : 'scoreRed';
        NET.roomRef.child(teamKey).set((this.roomData[teamKey] || 0) + delta);
    },

    nextWord() {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        NET.roomRef.update({ currentWord: word });
    },

    submitGuess() {
        const input = document.getElementById('guess-input');
        if (input.value.trim()) {
            alert(`Tahminin: "${input.value.trim()}" 🔥`);
            input.value = '';
        }
    },

    flash(color) {
        const f = document.getElementById('flash-overlay');
        f.style.background = color;
        f.style.opacity = '0.4';
        f.style.display = 'block';
        setTimeout(() => { f.style.display = 'none'; f.style.opacity = '0'; }, 300);
    }
};