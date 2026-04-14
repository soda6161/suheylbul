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
            this.joinExistingRoom(this.roomCode);
        }
    },

    createRoom() {
        const name = document.getElementById('login-name-input').value.trim() || "Oyuncu";
        this.playerName = name;
        localStorage.setItem('tabu_player_name', name);

        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        this.roomCode = code;
        window.location.href = `?room=${code}`;   // sayfayı yenile
    },

    manualJoin() {
        let code = document.getElementById('join-code-input').value.trim().toUpperCase();
        if (code.length !== 5) return alert("5 karakterlik oda kodu girin!");
        const name = document.getElementById('login-name-input').value.trim() || "Oyuncu";
        this.playerName = name;
        localStorage.setItem('tabu_player_name', name);
        window.location.href = `?room=${code}`;
    },

    joinExistingRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);

        // İlk olarak oda yoksa oluştur
        this.roomRef.once('value').then(snap => {
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
            this.roomRef.child('players/' + this.myId).update({
                name: this.playerName,
                team: 'blue',
                role: 'anlatici',
                joinedAt: Date.now()
            });
        }).catch(err => {
            console.error("Firebase hatası:", err);
            alert("Firebase bağlantı hatası: " + err.message);
        });

        // Değişiklikleri dinle
        this.roomRef.on('value', snap => {
            if (snap.exists()) {
                ENGINE.update(snap.val());
            }
        });
    },

    joinRole(team, role) {
        if (this.roomRef) this.roomRef.child('players/' + this.myId).update({ team, role });
    },

    copyRoomCode() {
        if (this.roomCode) navigator.clipboard.writeText(this.roomCode).then(() => alert("Oda kodu kopyalandı: " + this.roomCode));
    }
};

NET.init();