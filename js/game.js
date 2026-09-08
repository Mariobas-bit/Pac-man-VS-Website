const socket = io('https://pac-man-vs-servercode.onrender.com');

let currentRoomCode = "";
let myPlayerRole = "";
let currentScores = {};
let pointsToWin = 1000;
let isHost = false;

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        //loads assets
    }

    create() {
        console.log("Main Menu Loaded!");

        this.add.text(112, 50, 'PAC-MAN VS', { 
            fontSize: '24px', 
            fill: '#fff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.add.text(112, 100, 'ONLINE', { 
            fontSize: '16px', 
            fill: '#ffff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        let statusText = this.add.text(112, 200, 'CONNECTING TO CLOUD...', { 
            fontSize: '10px', 
            fill: '#888',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        socket.on('connect', () => {
            statusText.setText('SERVER LIVE!');
            statusText.setFill('#00ff00');
            
            socket.emit('join_game_room', { room_code: '1234' });
        });

        socket.on('lobby_update', (data) => {
            currentRoomCode = data.room_code;
            isHost = data.is_host;
            
            this.add.text(112, 240, `ROOM: ${currentRoomCode}`, { fontSize: '12px', fill: '#fff' }).setOrigin(0.5);
            statusText.setText(`PLAYERS READY: ${data.player_count}/4`);
        });
    }

    update() {
        //placeholder
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-div',
    width: 224,
    height: 288,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [MainMenuScene] 
};

const game = new Phaser.Game(config);
