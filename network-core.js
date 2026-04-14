const FIREBASE_CONFIG = {
    apiKey: "BHvUIxCOTsP2bY0QcPBQWzdC8K6tY2IrEnuSgh3TQgt0vi0_jrJIfnq9JTFUN41sY5kXHXiHvnAsCP3pf75HadU",
    databaseURL: "https://suheylbul-default-rtdb.firebaseio.com"
};

const NET = {
    db: null,
    roomRef: null,
    myId: null,
    roomCode: null,
    playerName: "Oyuncu",

    init() {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();
        this.myId = localStorage.getItem('tabu_uid') || Math.random().toString(36).substring(2, 10);
        localStorage.setItem('tabu_uid', this.myId);
        this.playerName = localStorage.getItem('tabu_player_name') || "Oyuncu";

        const params = new URLSearchParams(window.location.search);
        this.roomCode = params.get('room');
        if (this.roomCode) {
            this.joinRoom(this.roomCode);
        }
    },

    createRoom() {
        const name = document.getElementById('login-name-input').value.trim() || "Oyuncu";
        this.playerName = name;
        localStorage.setItem('tabu_player_name', name);

        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        window.location.href = `?room=${code}`;
    },

    manualJoin() {
        let code = document.getElementById('join-code-input').value.trim().toUpperCase();
        if (code.length !== 5) return alert("5 karakterlik oda kodu girin!");
        const name = document.getElementById('login-name-input').value.trim() || "Oyuncu";
        this.playerName = name;
        localStorage.setItem('tabu_player_name', name);
        window.location.href = `?room=${code}`;
    },

    joinRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);

        // Oda yoksa oluştur
        this.roomRef.once('value').then((snap) => {
            if (!snap.exists()) {
                return this.roomRef.set({
                    status: 'lobby',
                    scoreRed: 0,
                    scoreBlue: 0,
                    players: {}
                });
            }
        }).then(() => {
            // Oyuncuyu ekle
            return this.roomRef.child('players/' + this.myId).update({
                name: this.playerName,
                team: 'blue',
                role: 'anlatici',
                joinedAt: Date.now()
            });
        }).catch((err) => {
            console.error("Firebase Error:", err);
            alert("Bağlantı hatası: " + err.message);
        });

        // Gerçek zamanlı dinle
        this.roomRef.on('value', (snap) => {
            if (snap.exists()) {
                ENGINE.update(snap.val());
            } else {
                console.log("Oda verisi yok");
            }
        });
    },

    joinRole(team, role) {
        if (this.roomRef) this.roomRef.child('players/' + this.myId).update({ team, role });
    },

    copyRoomCode() {
        if (this.roomCode) {
            navigator.clipboard.writeText(this.roomCode).then(() => alert("Kodu kopyaladım: " + this.roomCode));
        }
    }
};

NET.init();