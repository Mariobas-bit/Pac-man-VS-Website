const socket = io('https://pac-man-vs-servercode.onrender.com');

let currentRoomCode = "";
let myPlayerRole = "";
let currentScores = {};
let pointsToWin = 1000;
let isHost = false;
let lastLobbyData = null;

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.typedCode = "";
        this.menuMode = "Select";
    }

    create() {
        console.log("Main Menu Scene Loaded");
        this.renderMenuText();

        socket.on('lobby_update', (data) => {
            currentRoomCode = data.room_code;
            lastLobbyData = data;
            this.menuMode = "Lobby";
            console.log(data);
            
            this.renderLobbyInterface();
        });

        socket.on('lobby_status_personal', (data) => {
            isHost = data.is_host;
            console.log(data)
            
            if (this.menuMode === "Lobby") {
                this.renderLobbyInterface();
            }
        });

        socket.on('error_message', (data) => {
            this.showErrorMessage(data.msg);
        });

        this.input.keyboard.on('keydown', (event) => {
            const key = event.key.toUpperCase();

            if (this.menuMode === "Select") {
                if (key === 'H') {
                    socket.emit('create_game_room');
                } else if (key === 'J') {
                    this.menuMode = "Typing";
                    this.typedCode = "";
                    this.renderMenuText();
                }
            } 
            else if (this.menuMode === "Typing") {
                if (event.keyCode === 8 && this.typedCode.length > 0) {
                    this.typedCode = this.typedCode.slice(0, -1);
                    this.renderMenuText();
                } else if (this.typedCode.length < 4 && /^[A-Z0-9]$/.test(key)) {
                    this.typedCode += key;
                    this.renderMenuText();
                } else if (key === 'ENTER' && this.typedCode.length === 4) {
                    socket.emit('join_game_room', { room_code: this.typedCode });
                } else if (key === 'ESCAPE') {
                    this.menuMode = "Select";
                    this.renderMenuText();
                }
            } 
            else if (this.menuMode === "Lobby") {
                if (isHost && key === 'ENTER') {
                    socket.emit('start_game_request', { 
                        room_code: currentRoomCode, 
                        points_to_win: 1000 
                    });
                }
            }
        });
    }

    renderMenuText() {
        this.children.removeAll();

        this.add.text(112, 40, 'PAC-MAN VS', { fontSize: '24px', fill: '#fff', fontFamily: 'monospace' }).setOrigin(0.5);
        this.add.text(112, 80, 'ONLINE', { fontSize: '14px', fill: '#ffff00', fontFamily: 'monospace' }).setOrigin(0.5);

        if (this.menuMode === "Select") {
            this.add.text(112, 150, 'PRESS [H] TO HOST', { fontSize: '12px', fill: '#00ffff', fontFamily: 'monospace' }).setOrigin(0.5);
            this.add.text(112, 190, 'PRESS [J] TO JOIN', { fontSize: '12px', fill: '#ff00ff', fontFamily: 'monospace' }).setOrigin(0.5);
        } 
        else if (this.menuMode === "Typing") {
            this.add.text(112, 130, 'ENTER 4-CHARACTER CODE:', { fontSize: '10px', fill: '#aaa', fontFamily: 'monospace' }).setOrigin(0.5);
            
            let displayString = this.typedCode;
            while(displayString.length < 4) displayString += "_";
            
            this.add.text(112, 170, displayString.split("").join(" "), { fontSize: '20px', fill: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }).setOrigin(0.5);
            this.add.text(112, 220, 'PRESS [ENTER] TO JOIN', { fontSize: '9px', fill: '#00ff00', fontFamily: 'monospace' }).setOrigin(0.5);
            this.add.text(112, 245, 'PRESS [ESC] TO GO BACK', { fontSize: '8px', fill: '#555', fontFamily: 'monospace' }).setOrigin(0.5);
        }
    }

    renderLobbyInterface() {
        this.children.removeAll();
        
        let count = lastLobbyData ? lastLobbyData.player_count : 1;

        this.add.text(112, 40, 'GAME LOBBY', { fontSize: '20px', fill: '#00ffff', fontFamily: 'monospace' }).setOrigin(0.5);
        this.add.text(112, 90, `ROOM CODE: ${currentRoomCode}`, { fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace', fontWeight: 'bold' }).setOrigin(0.5);
        this.add.text(112, 140, `PLAYERS: ${count}/4`, { fontSize: '12px', fill: '#ffff00', fontFamily: 'monospace' }).setOrigin(0.5);

        if (isHost) {
            this.add.text(112, 200, 'YOU ARE THE HOST', { fontSize: '10px', fill: '#00ff00', fontFamily: 'monospace' }).setOrigin(0.5);
            this.add.text(112, 230, 'PRESS [ENTER] TO START', { fontSize: '10px', fill: '#ff00ff', fontFamily: 'monospace' }).setOrigin(0.5);
        } else {
            this.add.text(112, 200, 'WAITING FOR HOST...', { fontSize: '10px', fill: '#ff0000', fontFamily: 'monospace' }).setOrigin(0.5);
        }
    }

    showErrorMessage(msg) {
        this.menuMode = "Select"
        this.renderMenuText();
        let errText = this.add.text(112, 275, `ERROR: ${msg}`, { fontSize: '9px', fill: '#ff0000', fontFamily: 'monospace' }).setOrigin(0.5);
        this.time.delayedCall(3000, () => { errText.destroy(); });
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-div',
    width: 224,
    height: 288,
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [MainMenuScene]
};

const game = new Phaser.Game(config);
