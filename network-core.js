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

        // URL'den oda kodu kontrolü
        const params = new URLSearchParams(window.location.search);
        this.roomCode = params.get('room');
        if (this.roomCode) {
            this.joinExistingRoom(this.roomCode);
        }
    },

    createRoom() {
        const nameInput = document.getElementById('login-name-input').value.trim();
        if (nameInput) {
            this.playerName = nameInput;
            localStorage.setItem('tabu_player_name', this.playerName);
        }

        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        this.roomCode = code;

        // Direkt URL değiştir + oda oluştur
        window.location.href = `?room=${code}`;
        // (Yukarıdaki satır sayfayı yeniler ve init() otomatik join yapacak)
    },

    manualJoin() {
        let code = document.getElementById('join-code-input').value.trim().toUpperCase();
        if (code.length !== 5) {
            alert("Lütfen 5 karakterlik geçerli bir oda kodu girin!");
            return;
        }
        const nameInput = document.getElementById('login-name-input').value.trim();
        if (nameInput) {
            this.playerName = nameInput;
            localStorage.setItem('tabu_player_name', this.playerName);
        }
        this.roomCode = code;
        window.location.href = `?room=${code}`;
    },

    joinExistingRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);

        // Listener'ı kur
        this.roomRef.on('value', (snap) => {
            if (snap.exists()) {
                ENGINE.update(snap.val());
            } else {
                // Oda yoksa oluştur (ilk oyuncu için)
                this.roomRef.set({
                    status: 'lobby',
                    players: {},
                    scoreRed: 0,
                    scoreBlue: 0
                }).then(() => {
                    this.addPlayerToRoom();
                }).catch(err => console.error("Oda oluşturma hatası:", err));
            }
        });

        // Oyuncuyu ekle (eğer oda varsa direkt ekle)
        setTimeout(() => this.addPlayerToRoom(), 300);
    },

    addPlayerToRoom() {
        if (!this.roomRef) return;
        this.roomRef.child('players/' + this.myId).update({
            name: this.playerName,
            team: 'blue',
            role: 'anlatici',
            joinedAt: Date.now()
        }).catch(err => console.error("Oyuncu ekleme hatası:", err));
    },

    joinRole(team, role) {
        if (this.roomRef) {
            this.roomRef.child('players/' + this.myId).update({ team, role });
        }
    },

    copyRoomCode() {
        if (this.roomCode) {
            navigator.clipboard.writeText(this.roomCode).then(() => {
                alert(`✅ Oda kodu kopyalandı: ${this.roomCode}\nArkadaşına gönder!`);
            });
        }
    }
};

NET.init();