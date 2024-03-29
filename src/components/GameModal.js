import React from 'react';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';
import useSound from 'use-sound';
import Button from './customButton';
import { GameStatus, User } from '../types/game';
import RestartData from '../lottie/restart.json';
import PlayData from '../lottie/player.json';
import NewGamingData from '../lottie/newGaming.json';
import WinnerData from '../lottie/winner.json';
import GetGoldData from '../lottie/getGold.json';
import CryingData from '../lottie/crying.json';
import clickAudio from "../assets/audio/click.wav";

const GameModal = ({
    type,
    user,
    onStart,
    onRestart,
    onNext,
    onWin,
}) => {
    const [clickPlay] = useSound(clickAudio);
    const lostOption = {
        loop: true,
        autoPlay: true,
        animationData: CryingData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }
    const restartOption = {
        loop: true,
        autoPlay: true,
        animationData: RestartData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }
    const playOption = {
        loop: true,
        autoPlay: true,
        animationData: PlayData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }
    const newGamingOption = {
        loop: true,
        autoPlay: true,
        animationData: NewGamingData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }
    const winOption = {
        loop: true,
        autoPlay: true,
        animationData: WinnerData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }
    const nextOption = {
        loop: true,
        autoPlay: true,
        animationData: GetGoldData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }

    const startGame = () => {
        clickPlay();
        onStart();
    }
    const restartGame = () => {
        clickPlay();
        onRestart()
    }
    const nextLevel = () => {
        clickPlay();
        onNext();
    }
    const winGame = () => {
        clickPlay();
        onWin();
    }
     

    return(
        <div className="gameModal">
            {type === GameStatus.Lost &&
            <>
                <div className=''>
                    <h1>You are lost!</h1>
                </div>
                <Lottie options={lostOption} height={250} width={250} />
                <br /><br /><br />
                <Button 
                    lottieItem={<Lottie options={restartOption} height={90} width={90} />}
                    type="lottie"
                    onClick={restartGame}
                />
            </>
            }

            {type === GameStatus.Init &&
            <>
                <div className=''>
                    <h1>Start Game</h1>
                </div>
                <Lottie options={newGamingOption} />
                <Button 
                    lottieItem={<Lottie options={playOption} height={90} width={90} />}
                    type="lottie"
                    onClick={startGame}
                />
            </>
            }

            {type === GameStatus.Next &&
            <>
                <div className=''>
                    <h1>Round {user.level}</h1>
                </div>
                <Lottie options={nextOption} />
                <Button 
                    lottieItem={<Lottie options={playOption} height={90} width={90} />}
                    type="lottie"
                    onClick={nextLevel}
                />
            </>
            }

            {type === GameStatus.Win &&
            <>
                <div className=''>
                    <h1>Congratulations!</h1>
                </div>
                <Lottie options={winOption} />
                <Button 
                    lottieItem={<Lottie options={restartOption} height={90} width={90} />}
                    type="lottie"
                    onClick={winGame}
                />
            </>
            }
        </div>
    )
}
GameModal.prototype = {
    type: PropTypes.oneOf(Object.keys(GameStatus)).isRequired,
    user: PropTypes.shape(User).isRequired,
    onStart: PropTypes.func.isRequired,
    onRestart: PropTypes.func.isRequired,
    onWin: PropTypes.func.isRequired
}
export default GameModal