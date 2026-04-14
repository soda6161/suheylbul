const DISCORD_CLIENT_ID = "1493662242862923806";
const FIREBASE_CONFIG = {
    apiKey: "BHvUIxCOTsP2bY0QcPBQWzdC8K6tY2IrEnuSgh3TQgt0vi0_jrJIfnq9JTFUN41sY5kXHXiHvnAsCP3pf75HadU", 
    databaseURL: "https://suheylbul-default-rtdb.firebaseio.com"
};

const NET = {
    db: null, roomRef: null, myId: null, myName: "Oyuncu",
    async init() {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();
        this.myId = localStorage.getItem('tabu_uid') || Math.random().toString(36).substring(2, 10);
        localStorage.setItem('tabu_uid', this.myId);
        const params = new URLSearchParams(window.location.search);
        const roomCode = params.get('room');
        if (roomCode) this.joinRoom(roomCode);
        if (window.location.href.includes("discord")) this.setupDiscord();
    },
    async setupDiscord() {
        try {
            const sdk = new window.DiscordSDK.DiscordSDK(DISCORD_CLIENT_ID);
            await sdk.ready();
            await sdk.commands.authorize({client_id: DISCORD_CLIENT_ID, response_type: "code", scope: ["identify"], prompt: "none"});
        } catch (e) { console.log("Web Modu"); }
    },
    createRoom() {
        const name = document.getElementById('login-name-input').value || "Oyuncu";
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        window.location.search = `?room=${code}&name=${name}`;
    },
    joinRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);
        const params = new URLSearchParams(window.location.search);
        this.myName = params.get('name') || "Oyuncu";
        this.roomRef.child('players/' + this.myId).update({ name: this.myName, team: 'none', role: 'none' });
        this.roomRef.on('value', snap => { if(snap.exists()) ENGINE.update(snap.val()); });
    },
    joinRole(team, role) {
        if (this.roomRef) this.roomRef.child('players/' + this.myId).update({ team, role });
    }
};
NET.init();