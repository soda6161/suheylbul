// game-engine.js revize edilmiş bölümler

const ENGINE = {
    // ... mevcut veriler ...

    update(data) {
        this.roomData = data;
        const me = data.players?.[NET.myId];
        
        if (data.status === 'playing') {
            this.renderGame(me, data);
        } else {
            this.renderLobby(data);
        }
    },

    renderGame(me, data) {
        const screen = document.getElementById('screen-game');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');

        // Takım ve Role göre arka plan değiştirme
        const roleClass = me.role === 'anlatici' ? 'narrator' : 'listener';
        const teamClass = me.team === 'blue' ? 'blue' : 'red';
        screen.className = `screen active ${roleClass}-${teamClass}`;

        const wordMain = document.getElementById('word-main');
        const wordForbidden = document.getElementById('word-forbidden');
        const narratorControls = document.getElementById('narrator-controls');

        if (me.role === 'anlatici') {
            // Anlatıcı kelimeleri görür
            wordMain.textContent = data.currentWord.m;
            wordForbidden.innerHTML = data.currentWord.f.join('<br>');
            narratorControls.style.display = 'block';
        } else {
            // Dinleyici kelimeleri görmez, heyecanı korur
            wordMain.textContent = "???";
            wordForbidden.textContent = "TAKIM ARKADAŞINI DİNLE VE TAHMİN ET!";
            narratorControls.style.display = 'none';
        }

        // Puan Güncelleme
        document.getElementById('score-display').textContent = `KIRMIZI: ${data.scoreRed || 0} | MAVİ: ${data.scoreBlue || 0}`;
    },

    // Pas geçme fonksiyonu eksikti, ekledim
    passCard() {
        this.flash('rgba(255, 255, 255, 0.3)');
        this.nextWord();
    }
};