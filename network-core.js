const DISCORD_CLIENT_ID = "1493662242862923806";
const FIREBASE_CONFIG = {
    apiKey: "BHvUIxCOTsP2bY0QcPBQWzdC8K6tY2IrEnuSgh3TQgt0vi0_jrJIfnq9JTFUN41sY5kXHXiHvnAsCP3pf75HadU", 
    databaseURL: "https://suheylbul-default-rtdb.firebaseio.com"
};

const NET = {
    db: null, roomRef: null, myId: null, roomCode: null,
    async init() {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();
        this.myId = localStorage.getItem('tabu_uid') || Math.random().toString(36).substring(2, 10);
        localStorage.setItem('tabu_uid', this.myId);
        
        const params = new URLSearchParams(window.location.search);
        this.roomCode = params.get('room');
        if (this.roomCode) this.joinRoom(this.roomCode);
    },
    createRoom() {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        window.location.search = `?room=${code}`;
    },
    joinRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);
        this.roomRef.on('value', snap => { if(snap.exists()) ENGINE.update(snap.val()); });
        this.roomRef.child('players/' + this.myId).update({ name: "Oyuncu", team: 'blue', role: 'anlatici' });
    },
    joinRole(team, role) {
        if (this.roomRef) this.roomRef.child('players/' + this.myId).update({ team, role });
    }
};
NET.init();