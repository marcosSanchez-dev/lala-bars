import { useEffect, useRef, useState } from "react";
import "./index.css";
import ClockIcon from "./assets/clock.png";
import RunIcon from "./assets/figure.run.png";
import LalaLogo from "./assets/Lala_Logo.png";

function App() {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [winner, setWinner] = useState<null | number>(null);

  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (startTime && !winner) {
      intervalRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startTime.getTime());
      }, 10);
    }
    return () => clearInterval(intervalRef.current!);
  }, [startTime, winner]);

  const increase = (player: number) => {
    if (!startTime) setStartTime(new Date());
    if (winner) return;

    if (player === 1) {
      setProgress1((prev) => {
        const newVal = Math.min(prev + 5, 100);
        if (newVal >= 100) setWinner(1);
        return newVal;
      });
    } else {
      setProgress2((prev) => {
        const newVal = Math.min(prev + 5, 100);
        if (newVal >= 100) setWinner(2);
        return newVal;
      });
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return {
      minSec: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`,
      ms: `:${String(milliseconds).padStart(2, "0")}`,
    };
  };

  const resetGame = () => {
    setProgress1(0);
    setProgress2(0);
    setStartTime(null);
    setElapsed(0);
    setWinner(null);
  };

  const handleGlobalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Evitar activar fullscreen si se clickeó una barra
    if (target.closest(".progress-bar")) return;

    // Activar fullscreen si no estamos ya en él
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error al entrar en fullscreen:", err);
      });
    }
  };

  const time = formatTime(elapsed);

  return (
    <div
      ref={containerRef}
      onClick={handleGlobalClick}
      className="w-screen h-screen bg-gradient-to-br from-[#fffdf4] via-[#fff9e9] to-[#fff5d8] text-[#a19246] font-bebas flex items-center justify-center overflow-hidden relative"
    >
      {/* Logo */}
      <img
        src={LalaLogo}
        alt="Lala Logo"
        className="absolute top-8 right-12 w-[150px] object-contain"
      />

      {/* Ganador */}
      {winner && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-white text-[#a8842b] text-4xl rounded-xl shadow-md flex items-center gap-4 z-20">
          🏆 ¡JUGADOR {winner} GANÓ!
        </div>
      )}

      {/* Reiniciar */}
      {winner && (
        <button
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white text-[#a8842b] text-xl px-6 py-3 rounded-full shadow-md z-20"
          onClick={resetGame}
        >
          REINICIAR JUEGO
        </button>
      )}

      <div className="max-w-[1440px] w-full h-[90vh] grid grid-cols-3 items-center px-12">
        {/* Izquierda */}
        <div className="flex flex-col justify-between h-full items-end text-right">
          {/* TIEMPO */}
          <div className="space-y-1 pt-20">
            <div className="flex flex-col items-end gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[90px] leading-[90px]">{time.minSec}</div>
            <div className="text-[80px] leading-[80px] -mt-4">{time.ms}</div>
          </div>

          {/* JUGADOR */}
          <div className="space-y-1 pb-[6px]">
            <div className="text-[36px]">JUGADOR</div>
            <div className="text-[72px] flex items-center justify-end gap-2">
              <img src={RunIcon} alt="Jugador 1" className="w-14 h-14" />1
            </div>
          </div>
        </div>

        {/* Barras */}
        <div className="flex justify-center gap-40 items-center h-full relative z-10">
          <div
            className="progress-bar relative w-[90px] h-[80%] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end cursor-pointer"
            onClick={() => increase(1)}
          >
            <div
              className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
              style={{
                height: `${progress1}%`,
                marginBottom: "6px",
                background: "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
              }}
            />
          </div>

          <div
            className="progress-bar relative w-[90px] h-[80%] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end cursor-pointer"
            onClick={() => increase(2)}
          >
            <div
              className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
              style={{
                height: `${progress2}%`,
                marginBottom: "6px",
                background: "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
              }}
            />
          </div>
        </div>

        {/* Derecha */}
        <div className="flex flex-col justify-between h-full items-start text-left">
          {/* TIEMPO */}
          <div className="space-y-1 pt-20">
            <div className="flex flex-col items-start gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[90px] leading-[90px]">{time.minSec}</div>
            <div className="text-[80px] leading-[80px] -mt-4">{time.ms}</div>
          </div>

          {/* JUGADOR */}
          <div className="space-y-1 pb-[6px]">
            <div className="text-[36px]">JUGADOR</div>
            <div className="text-[72px] flex items-center justify-start gap-2">
              2<img src={RunIcon} alt="Jugador 2" className="w-14 h-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
