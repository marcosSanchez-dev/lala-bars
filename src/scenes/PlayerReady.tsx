import Player1ReadyImg from "../assets/player1_ready.jpeg";
import Player2ReadyImg from "../assets/player2_ready.jpeg";
import BothReadyImg from "../assets/both_ready.png";

interface PlayerReadyProps {
  player: number; // 0: ambos, 1: jugador1, 2: jugador2
}

export default function PlayerReady({ player }: PlayerReadyProps) {
  return (
    <div className="w-screen h-screen bg-[#AD8A2C] flex">
      {player === 0 && (
        <img
          src={BothReadyImg}
          className="w-full h-full object-contain"
          alt="Ambos jugadores listos"
        />
      )}
      {player === 1 && (
        <img
          src={Player1ReadyImg}
          className="w-1/2 h-full object-contain"
          alt="Jugador 1 listo"
        />
      )}
      {player === 2 && (
        <img
          src={Player2ReadyImg}
          className="w-1/2 h-full object-contain"
          alt="Jugador 2 listo"
        />
      )}
    </div>
  );
}
