import { useEffect, useRef, useState } from "react";
import "./index.css";
import ClockIcon from "./assets/clock.png";
import RunIcon from "./assets/figure.run.png";
import LalaLogo from "./assets/Lala_Logo.png";
import PlayerReady from "./scenes/PlayerReady";
import StandbyScene from "./scenes/StandbyScene";
import Player1ReadyImg from "./assets/player1_ready.jpeg";
import Player2ReadyImg from "./assets/player2_ready.jpeg";

function App() {
  const [currentScene, setCurrentScene] = useState<
    "slideshow" | "playerReady" | "tutorial" | "game"
  >("slideshow");

  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [winner, setWinner] = useState<null | number>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const readyPlayerRef = useRef<0 | 1 | 2 | null>(null);

  // 🧠 WebSocket con reconexión
  useEffect(() => {
    let socket: WebSocket;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      socket = new WebSocket("ws://localhost:8080");

      socket.onopen = () => {
        if (!isMounted) return;
        console.log("🌐 Conectado a WebSocket");
        reconnectAttempts = 0;
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        const msg = event.data.trim();
        console.log("📨 Mensaje WebSocket recibido:", msg);

        if (msg === "PLAYER1_READY") {
          setPlayer1Ready(true);
        } else if (msg === "PLAYER2_READY") {
          setPlayer2Ready(true);
        } else if (msg === "BOTH_PLAYERS_READY") {
          setPlayer1Ready(true);
          setPlayer2Ready(true);
          readyPlayerRef.current = 0;
          setCurrentScene("playerReady");
          setTimeout(() => setCurrentScene("tutorial"), 2000);
        }

        if (msg === "PLAYER1") increase(1);
        if (msg === "PLAYER2") increase(2);
      };

      socket.onerror = (err) => {
        if (!isMounted) return;
        console.error("❌ Error WebSocket:", err);
      };

      socket.onclose = () => {
        if (!isMounted) return;
        console.log("🔌 WebSocket cerrado");

        if (reconnectAttempts < maxReconnectAttempts && isMounted) {
          const delay = Math.min(3000, 1000 * (reconnectAttempts + 1));
          console.log(`⏳ Reconectando en ${delay}ms...`);
          setTimeout(() => {
            if (isMounted) connect();
          }, delay);
          reconnectAttempts++;
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (currentScene === "game" && startTime && !winner) {
      intervalRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startTime.getTime());
      }, 10);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime, winner, currentScene]);

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
    setPlayer1Ready(false);
    setPlayer2Ready(false);
    setCurrentScene("slideshow");
  };

  const handleGlobalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".progress-bar")) return;

    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error fullscreen:", err);
      });
    }
  };

  const time = formatTime(elapsed);

  // 🎬 RENDER ESCENAS
  if (currentScene === "slideshow") {
    return (
      <div className="relative w-screen h-screen">
        <StandbyScene />
        <div className="absolute inset-0 flex z-20">
          <div className="w-1/2 h-full flex justify-end">
            {player1Ready && (
              <img
                src={Player1ReadyImg}
                className="h-full object-contain"
                alt="Jugador 1 listo"
                style={{ maxWidth: "100%" }}
              />
            )}
          </div>
          <div className="w-1/2 h-full flex justify-start">
            {player2Ready && (
              <img
                src={Player2ReadyImg}
                className="h-full object-contain"
                alt="Jugador 2 listo"
                style={{ maxWidth: "100%" }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentScene === "playerReady" && readyPlayerRef.current !== null)
    return <PlayerReady player={readyPlayerRef.current} />;

  if (currentScene === "tutorial")
    return (
      <div className="w-screen h-screen bg-blue-900 text-white flex flex-col items-center justify-center text-5xl">
        Tutorial aquí
        <button
          onClick={() => setCurrentScene("game")}
          className="mt-8 px-6 py-3 bg-white text-blue-900 rounded-full"
        >
          Ir a juego →
        </button>
      </div>
    );

  // 🎮 ESCENA DEL JUEGO
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
        <div className="flex flex-col justify-center h-full items-end text-right gap-32">
          {/* TIEMPO */}
          <div className="space-y-1 pt-20  ">
            <div className="flex flex-col items-end gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[90px] leading-[90px]">{time.minSec}</div>
            <div className="text-[80px] leading-[80px] -mt-4">{time.ms}</div>
          </div>

          {/* JUGADOR */}
          <div className="space-y-1 pb-[6px]  ">
            <div className="text-[36px]">JUGADOR</div>
            <div className="text-[72px] flex items-center justify-end gap-2">
              <img src={RunIcon} alt="Jugador 1" className="w-14 h-14" />1
            </div>
          </div>
        </div>

        {/* Barras */}
        <div className="flex justify-center gap-40 items-center h-full relative z-10">
          <div className="progress-bar relative w-[90px] h-[80%] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end">
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

          <div className="progress-bar relative w-[90px] h-[80%] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end">
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
        <div className="flex flex-col justify-center h-full items-start text-left gap-32">
          {/* TIEMPO */}
          <div className="space-y-1 pt-20 ">
            <div className="flex flex-col items-start gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[90px] leading-[90px]">{time.minSec}</div>
            <div className="text-[80px] leading-[80px] -mt-4">{time.ms}</div>
          </div>

          {/* JUGADOR */}
          <div className="space-y-1 pb-[6px] ">
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
