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
    },

    createRoom() {
        const name = document.getElementById('login-name-input').value.trim() || "Oyuncu";
        this.playerName = name;
        localStorage.setItem('tabu_player_name', name);

        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        this.roomCode = code;
        this.joinRoom(code);
    },

    manualJoin() {
        let code = document.getElementById('join-code-input').value.trim().toUpperCase();
        if (code.length !== 5) return alert("5 karakterlik oda kodu girin!");
        
        const name = document.getElementById('login-name-input').value.trim() || "Oyuncu";
        this.playerName = name;
        localStorage.setItem('tabu_player_name', name);

        this.roomCode = code;
        this.joinRoom(code);
    },

    joinRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);
        this.roomRef.on('value', snap => {
            if (snap.exists()) ENGINE.update(snap.val());
            else alert("Oda bulunamadı veya silinmiş!");
        });

        this.roomRef.child('players/' + this.myId).update({
            name: this.playerName,
            team: 'blue',
            role: 'anlatici'
        });
    },

    joinRole(team, role) {
        if (this.roomRef) this.roomRef.child('players/' + this.myId).update({ team, role });
    },

    copyRoomCode() {
        if (this.roomCode) {
            navigator.clipboard.writeText(this.roomCode).then(() => {
                alert(`✅ Kodu kopyalandı!\nArkadaşına gönder: ${this.roomCode}`);
            });
        }
    }
};

NET.init();