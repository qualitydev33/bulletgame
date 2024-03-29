import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Confetti from 'react-confetti';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../components/wallet/connectors';
import useSound from 'use-sound';
import Bullet from "../util/bullet";
import Enemy from "../util/enemy";
import Player from "../util/player";
import UserStats from "../components/userStats";
import { GAME_SETTING } from "../constants/game";
import GameModal from "../components/gameModal";
import { GameStatus } from "../types/game";
import storage, {StorageType} from "../lib/storage";
import { STORAGE_KEY } from "../constants/storage";
import shootingAudio from "../assets/audio/shooting.wav";
import explodeAudio from "../assets/audio/explode.mp3";
import winAudio from "../assets/audio/win.wav";
import lostAudio from "../assets/audio/lost.mp3";

const Board = () => {
    const canvasRef = useRef(null);
    let player;
    let enemies = [];
    let bullets = [];
    let animationId;
    let createEnemyInterval;

    const [user, setUser] = useState({account: null, score: 0, level: 1});
    const [status, setStatus] = useState(GameStatus.Init)
    const {active, account, library, connector, activate, deactivate } = useWeb3React();
    const [shootingPlay] = useSound(shootingAudio);
    const [explodePlay] = useSound(explodeAudio);
    const [winPlay] = useSound(winAudio);
    const [lostPlay] = useSound(lostAudio);
    const connect = async() => {
        try {
            await activate(injected);
            if (account) {
                storage.rcSetItem(StorageType.local, STORAGE_KEY.IS_WALLET_CONNECTED, true);
                setUser(prev => ({...prev, account: account}));
            }
        } catch (error) {
            console.log(error)
        }
    }
    const disconnect = async() => {
        try {
            deactivate();
            setUser(prev => ({...prev, account: null}));
            storage.rcSetItem(StorageType.local, STORAGE_KEY.IS_WALLET_CONNECTED, false);
            initGame()
        } catch (error) {
            console.log(error)
        }
    }
    
    const createPlayer = (canvas) => {
        player = new Player(canvas, canvas.width / 2, canvas.height / 2, 10, 'white');
    }
    const createEnemy = (canvas) => {
        let numEnemyGenerated = 0;
        createEnemyInterval = setInterval(() => {
            const radius = Math.random() * (30 - 4) + 4;
            let x;
            let y;
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
                y = Math.random() * canvas.height;
            } else {
                x = Math.random() * canvas.width;
                y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
            }
            const color = 'red';
            const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
            const velocity = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
            enemies.push(new Enemy(canvas, x, y, radius, color, velocity));
            numEnemyGenerated++

            // Stop generating enemy by game setting
            if (numEnemyGenerated === GAME_SETTING.level[user.level - 1].numberEnemy) {
                clearInterval(createEnemyInterval);
            }
        }, GAME_SETTING.level[user.level - 1].enemyGenerateTime)
    }
    const createBullet = (canvas, event) => {
        const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }
        bullets.push(new Bullet(canvas, canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
    }
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        let canvas = document.querySelector("canvas");
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.draw();
        
        enemies.forEach((enemy, idx) => {
            enemy.update()
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            //End of the game by enemy by touching player and enemy
            if (dist - enemy.radius - player.radius < 1) {
                window.cancelAnimationFrame(animationId);
                clearInterval(createEnemyInterval);
                setStatus(GameStatus.Lost);
                explodePlay();
                lostPlay();
            }
            bullets.forEach((bullet, bulletIdx) => {
                const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                // When the bullets touch the enemy 
                if (dist - enemy.radius - bullet.radius < 1) {
                    explodePlay();
                    if (enemy.radius - 10 > 5) {
                        // Scoring enemy damaged
                        setUser(prev => ({...prev, score: prev.score + GAME_SETTING.damageScore}));
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        setTimeout(() => {
                            bullets.splice(bulletIdx, 1)
                        }, 0)
                    } else {
                        // Scoring enemy dead
                        setUser(prev => ({...prev, score: prev.score + GAME_SETTING.deadScore}));
                        setTimeout(() => {
                            enemies.splice(idx, 1)
                            bullets.splice(bulletIdx, 1)
                            
                            // Completed game level and go next level
                            if (enemies.length === 0) {
                                setStatus(GameStatus.Next);
                                winPlay()
                            }
                        }, 0)
                    }
                }
            })
        })
        bullets.forEach((bullet, idx) => {
            bullet.update();
            //remove the projectile from the corner of the screen
            if (bullet.x + bullet.radius < 0 || bullet.x - bullet.radius > canvas.width || bullet.y + bullet.radius < 0 || bullet.y - bullet.radius > canvas.height) {
                setTimeout(() => {
                    bullets.splice(idx, 1)
                }, 0)
            }
        })
    }

    const initGame = () => {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    }
    const startGame = () => {
        if (!user.account) {
            connect();
            return
        };
        let canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createPlayer(canvas);
        createEnemy(canvas);
        animate();
        canvas.addEventListener('click', (evt) => {
            shootingPlay();
            createBullet(canvas, evt);
        })
        setStatus(GameStatus.Start)
    }
    const restartGame = () => {
        setUser(prev => ({...prev, score: 0, level: 1}));
        startGame()
    }
    const startNextGameLevel = () => {
        if (user.level === 3) {
            setStatus(GameStatus.Win)
            winPlay();
            return
        }
        setUser(prev => ({...prev, level: prev.level + 1}))
        startGame()
    }
    const winGame = () => {
        restartGame()
    }
    useEffect(() => {
        const connectWalletOnPageLoad = async () => {
            if (storage.rcGetItem(StorageType.local, STORAGE_KEY.IS_WALLET_CONNECTED)) {
              try {
                await activate(injected);
                storage.rcSetItem(StorageType.local, STORAGE_KEY.IS_WALLET_CONNECTED, true);
                setUser(prev => ({...prev, account: account}));
              } catch (ex) {
                console.log(ex)
              }
            }
        }
        connectWalletOnPageLoad()
    }, [])
    return (
        <>
            <UserStats
                user={user}
                onConnect={connect}
                onDisconnect={disconnect}
            />
            <canvas ref={canvasRef} />
            {(status === GameStatus.Init || status === GameStatus.Next || status === GameStatus.Lost || status === GameStatus.Win) &&  
            <GameModal 
                onRestart={restartGame}
                onStart={startGame}
                onNext={startNextGameLevel}
                onWin={winGame}
                type={status}
                user={user}
            />
            }
            {status === GameStatus.Win && <Confetti id="confettiCanvas" />}
        </>
    );
}

export default Board