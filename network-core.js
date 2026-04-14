const DISCORD_CLIENT_ID = "1493662242862923806";
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDEMO-KEY", 
    databaseURL: "https://tabu-ultra-default-rtdb.europe-west1.firebasedatabase.app"
};

const NET = {
    db: null, roomRef: null, myId: null,
    async init() {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();
        this.myId = localStorage.getItem('tabu_uid') || Math.random().toString(36).substring(2, 10);
        localStorage.setItem('tabu_uid', this.myId);
        
        const params = new URLSearchParams(window.location.search);
        if (params.get('room')) this.joinRoom(params.get('room'));
        if (window.location.href.includes("discord")) this.setupDiscord();
    },
    async setupDiscord() {
        const sdk = new window.DiscordSDK.DiscordSDK(DISCORD_CLIENT_ID);
        await sdk.ready();
        await sdk.commands.authorize({ client_id: DISCORD_CLIENT_ID, response_type: "code", scope: ["identify"], prompt: "none" });
    },
    createRoom() {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        window.location.search = `?room=${code}`;
    },
    joinRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);
        this.roomRef.on('value', snap => { if(snap.exists()) ENGINE.update(snap.val()); });
        document.getElementById('screen-login').classList.remove('active');
        document.getElementById('screen-lobby').classList.add('active');
        document.getElementById('room-link-display').textContent = "ODA: " + code;
    },
    joinRole(team, role) {
        if (this.roomRef) this.roomRef.child('players/' + this.myId).update({ team, role });
    }
};
NET.init();