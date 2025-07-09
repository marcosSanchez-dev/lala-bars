import Player1ReadyImg from "../assets/player1_ready.png";
import BothReadyImg from "../assets/both_ready.png";

interface PlayerReadyProps {
  player: number; // 0: ambos, 1: jugador1, 2: jugador2
}

export default function PlayerReady({ player }: PlayerReadyProps) {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#AD8A2C] relative">
      {player === 0 && (
        <img
          src={BothReadyImg}
          className="h-full object-contain"
          alt="Ambos jugadores listos"
        />
      )}
      {player === 1 && (
        <img
          src={Player1ReadyImg}
          className="h-full object-contain"
          alt="Jugador 1 listo"
        />
      )}
      {player === 2 && (
        <img
          src={Player1ReadyImg}
          className="h-full object-contain"
          alt="Jugador 2 listo"
        />
      )}
    </div>
  );
}
