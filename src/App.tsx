import { useEffect, useRef, useState } from "react";
import "@fontsource/bebas-neue";
import "./index.css";

// Importar imágenes
import ClockIcon from "./assets/clock.png";
import RunIcon from "./assets/figure.run.png";
import LalaLogo from "./assets/Lala_Logo.png";

function App() {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cronómetro
  useEffect(() => {
    if (isRunning && !winner) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isRunning, winner]);

  // Función para llenar barras
  const handleClick = (player: "p1" | "p2") => {
    if (!isRunning || winner) return;

    if (player === "p1") {
      setProgress1((prev) => {
        const next = Math.min(prev + 10, 100);
        if (next === 100) {
          setWinner("Jugador 1");
          setIsRunning(false);
        }
        return next;
      });
    } else {
      setProgress2((prev) => {
        const next = Math.min(prev + 10, 100);
        if (next === 100) {
          setWinner("Jugador 2");
          setIsRunning(false);
        }
        return next;
      });
    }
  };

  const resetGame = () => {
    setProgress1(0);
    setProgress2(0);
    setSeconds(0);
    setWinner(null);
    setIsRunning(true);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#fffdf4] via-[#fff9e9] to-[#fff5d8] text-[#a8842b] font-bebas flex items-center justify-center overflow-hidden relative">
      {/* Logo LALA */}
      <img
        src={LalaLogo}
        alt="Lala Logo"
        className="absolute top-4 right-6 w-[120px] object-contain"
      />

      {/* Mensaje ganador */}
      {winner && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[60px] text-[#d97706] bg-white/70 px-6 py-2 rounded-xl shadow-lg backdrop-blur-md z-20">
          🏆 ¡{winner} ganó!
        </div>
      )}

      {/* Botón de reinicio */}
      {winner && (
        <button
          onClick={resetGame}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#fcb045] hover:bg-[#fd7e37] text-white text-2xl px-8 py-3 rounded-full shadow-lg transition-all duration-300 font-bold"
        >
          Reiniciar juego
        </button>
      )}

      <div className="w-full max-w-screen-xl h-[90%] grid grid-cols-3 items-center px-8">
        {/* Jugador 1 */}
        <div className="flex flex-col justify-between h-full py-8 text-right pr-4">
          <div className="space-y-2">
            <div className="flex flex-col items-end gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[140px] leading-[120px]">
              {formatTime(seconds)}
            </div>
            <div className="text-[64px]">
              :{(seconds % 100).toString().padStart(2, "0")}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[40px]">JUGADOR</div>
            <div className="text-[80px] flex items-center gap-3">
              <img src={RunIcon} alt="Jugador 1" className="w-14 h-14" />1
            </div>
          </div>
        </div>

        {/* Barras */}
        <div className="flex justify-center gap-28 items-end h-full">
          {/* Barra 1 */}
          <div
            className="relative w-[80px] h-full bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end cursor-pointer"
            onClick={() => handleClick("p1")}
          >
            <div
              className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
              style={{
                height: `${progress1}%`,
                marginBottom: "6px",
                background: "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
              }}
            ></div>
          </div>

          {/* Barra 2 */}
          <div
            className="relative w-[80px] h-full bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end cursor-pointer"
            onClick={() => handleClick("p2")}
          >
            <div
              className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
              style={{
                height: `${progress2}%`,
                marginBottom: "6px",
                background: "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
              }}
            ></div>
          </div>
        </div>

        {/* Jugador 2 */}
        <div className="flex flex-col justify-between h-full py-8 text-left pl-4">
          <div className="space-y-2">
            <div className="flex flex-col items-start gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[140px] leading-[120px]">
              {formatTime(seconds)}
            </div>
            <div className="text-[64px]">
              :{(seconds % 100).toString().padStart(2, "0")}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="text-[40px]">JUGADOR</div>
            <div className="text-[80px] flex items-center gap-3">
              2
              <img src={RunIcon} alt="Jugador 2" className="w-14 h-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
