import { useEffect, useRef, useState } from "react";
import "./index.css";
import ClockIcon from "./assets/clock.png";
import Frame13_text from "./assets/frame13_text.png";
import RunIcon from "./assets/figure.run.png";
import LalaLogo from "./assets/Lala_Logo.png";
import PlayerReady from "./scenes/PlayerReady";
import StandbyScene from "./scenes/StandbyScene";
import Player1ReadyImg from "./assets/player1_ready.jpeg";
import Player2ReadyImg from "./assets/player2_ready.png";
import Frame14_text from "./assets/frame14_text.png";
import frame12Image from "./assets/frame12.png";
import Player1WinImg from "./assets/player1_win.png";
import Player2WinImg from "./assets/player2_win.png";

function App() {
  const [currentScene, setCurrentScene] = useState<
    | "slideshow"
    | "playerReady"
    | "tutorial"
    | "game"
    | "frame13"
    | "frame14"
    | "frame12"
    | "winner"
  >("slideshow");

  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [tutorialBar1, setTutorialBar1] = useState(0);
  const [tutorialBar2, setTutorialBar2] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [winner, setWinner] = useState<null | number>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const readyPlayerRef = useRef<0 | 1 | 2 | null>(null);
  const countdownRef = useRef<number | null>(null);
  const [winnerDisplayTime, setWinnerDisplayTime] = useState(20000);

  // Referencias para acceder a los estados actuales en los callbacks de WebSocket
  const currentSceneRef = useRef(currentScene);
  const winnerRef = useRef(winner);

  // Actualizar referencias cuando cambian los estados
  useEffect(() => {
    currentSceneRef.current = currentScene;
  }, [currentScene]);

  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);

  const gameTimeLimit = 60000;
  const [timeRemaining, setTimeRemaining] = useState(gameTimeLimit);

  useEffect(() => {
    let winnerTimer: number;
    let switchToWinnerTimer: number;

    if (winner !== null) {
      if (currentScene === "game") {
        switchToWinnerTimer = window.setTimeout(() => {
          setCurrentScene("winner");
        }, 1000);
      }

      winnerTimer = window.setTimeout(() => {
        setPlayer1Ready(false);
        setPlayer2Ready(false);
        setProgress1(0);
        setProgress2(0);
        setTutorialBar1(0);
        setTutorialBar2(0);
        setTimeRemaining(gameTimeLimit);
        setWinner(null);
        setCurrentScene("slideshow");
      }, winnerDisplayTime);
    }

    return () => {
      if (winnerTimer) clearTimeout(winnerTimer);
      if (switchToWinnerTimer) clearTimeout(switchToWinnerTimer);
    };
  }, [winner, winnerDisplayTime]);

  // 🧠 WebSocket con reconexión (corregido)
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

        // Normalizar mensajes con espacios
        const normalizedMsg = msg.replace(/\s/g, "");

        // Acceder a los valores actuales a través de referencias
        const currentScene = currentSceneRef.current;
        const winner = winnerRef.current;

        if (normalizedMsg === "PLAYER1_READY") {
          setPlayer1Ready(true);
        } else if (normalizedMsg === "PLAYER2_READY") {
          setPlayer2Ready(true);
        } else if (normalizedMsg === "BOTH_PLAYERS_READY") {
          setPlayer1Ready(true);
          setPlayer2Ready(true);
          readyPlayerRef.current = 0;
          setCurrentScene("playerReady");
        } else if (normalizedMsg === "FRAME13") {
          setCurrentScene("tutorial");
        } else if (normalizedMsg === "FRAME14") {
          setCurrentScene("frame14");
          setCountdown(3);
        } else if (normalizedMsg === "FRAME12") {
          setCurrentScene("frame12");
        } else if (normalizedMsg === "FRAME5") {
          setProgress1(0);
          setProgress2(0);
          setWinner(null);
          setTimeRemaining(gameTimeLimit);
          setCurrentScene("game");
        } else if (normalizedMsg === "CONTINUE") {
          setCountdown(null);
        } else if (msg.startsWith("BARRA1_")) {
          const value = parseInt(msg.replace("BARRA1_", ""), 10);
          if (!isNaN(value)) {
            if (currentScene === "tutorial" || currentScene === "frame14") {
              setTutorialBar1(value);
            } else if (currentScene === "game") {
              setProgress1(value);
              if (value >= 100 && !winner) {
                setWinner(1);
              }
            }
          }
        } else if (msg.startsWith("BARRA2_")) {
          const value = parseInt(msg.replace("BARRA2_", ""), 10);
          if (!isNaN(value)) {
            if (currentScene === "tutorial" || currentScene === "frame14") {
              setTutorialBar2(value);
            } else if (currentScene === "game") {
              setProgress2(value);
              if (value >= 100 && !winner) {
                setWinner(2);
              }
            }
          }
        } else if (msg.startsWith("FELICIDADES_")) {
          const seconds = parseInt(msg.replace("FELICIDADES_", ""), 10);
          if (!isNaN(seconds)) {
            setWinnerDisplayTime(seconds * 1000);
          }
        } else if (normalizedMsg === "PLAYER1") {
          if (currentScene === "game" && !winner) {
            setProgress1((prev) => {
              const newVal = Math.min(prev + 5, 100);
              if (newVal >= 100) setWinner(1);
              return newVal;
            });
          }
        } else if (normalizedMsg === "PLAYER2") {
          if (currentScene === "game" && !winner) {
            setProgress2((prev) => {
              const newVal = Math.min(prev + 5, 100);
              if (newVal >= 100) setWinner(2);
              return newVal;
            });
          }
        }
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
  }, []); // Dependencias vacías = solo al montar

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownRef.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 1;
          }
          return prev! - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [countdown]);

  useEffect(() => {
    if (currentScene === "game" && !winner) {
      const start = Date.now();
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsedTime = now - start;
        const remaining = Math.max(0, gameTimeLimit - elapsedTime);
        setTimeRemaining(remaining);

        if (remaining <= 0 && !winner) {
          if (progress1 > progress2) {
            setWinner(1);
          } else if (progress2 > progress1) {
            setWinner(2);
          } else {
            setWinner(1);
          }
        }
      }, 10);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentScene, winner, progress1, progress2]);

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

  const handleGlobalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".progress-bar")) return;

    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error fullscreen:", err);
      });
    }
  };

  const time = formatTime(timeRemaining);

  if (currentScene === "frame12") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <img
          src={frame12Image}
          alt="Frame 12"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (currentScene === "frame14") {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-[#fffdf4] via-[#fff9e9] to-[#fff5d8] flex flex-col items-center justify-center">
        <img
          src={LalaLogo}
          alt="Lala Logo"
          className="absolute top-8 right-12 w-[150px] object-contain"
        />
        <div className="flex gap-24 items-end">
          <div className="h-full flex flex-col items-center justify-center">
            <img src={Frame14_text} alt="Instrucciones" className="w-[8rem]" />
            {countdown !== null && (
              <div className="mt-4 text-[#a19246] text-[120px] font-bebas">
                {countdown}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="progress-bar relative w-24 h-[700px] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end">
              <div
                className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
                style={{
                  height: `${tutorialBar1}%`,
                  marginBottom: "6px",
                  background:
                    "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                  boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="progress-bar relative w-24 h-[700px] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end">
              <div
                className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
                style={{
                  height: `${tutorialBar2}%`,
                  marginBottom: "6px",
                  background:
                    "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                  boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
                }}
              />
            </div>
          </div>

          <div className="h-full flex flex-col items-center justify-center">
            <img src={Frame14_text} alt="Instrucciones" className="w-[8rem]" />
            {countdown !== null && (
              <div className="mt-4 text-[#a19246] text-[120px] font-bebas">
                {countdown}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentScene === "winner") {
    const winnerImage = winner === 1 ? Player1WinImg : Player2WinImg;
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <img
          src={winnerImage}
          alt={`Player ${winner} wins`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

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
      <div className="w-screen h-screen bg-gradient-to-br from-[#fffdf4] via-[#fff9e9] to-[#fff5d8] flex flex-col items-center justify-center">
        <div className="flex gap-24 items-end">
          <img
            src={LalaLogo}
            alt="Lala Logo"
            className="absolute top-8 right-12 w-[150px] object-contain"
          />
          <div className="h-full grid place-items-center">
            <img src={Frame13_text} alt="Clock" className="w-[10rem]" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="progress-bar relative w-24 h-[700px] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end">
              <div
                className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
                style={{
                  height: `${tutorialBar1}%`,
                  marginBottom: "6px",
                  background:
                    "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                  boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="progress-bar relative w-24 h-[700px] bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end">
              <div
                className="w-full rounded-[20px] transition-all duration-300 ease-in-out"
                style={{
                  height: `${tutorialBar2}%`,
                  marginBottom: "6px",
                  background:
                    "linear-gradient(to top, #fcb045 0%, #fd7e37 100%)",
                  boxShadow: "0 8px 20px rgba(255, 167, 36, 0.3)",
                }}
              />
            </div>
          </div>
          <div className="h-full grid place-items-center">
            <img src={Frame13_text} alt="Clock" className="w-[10rem]" />
          </div>
        </div>
      </div>
    );

  return (
    <div
      ref={containerRef}
      onClick={handleGlobalClick}
      className="w-screen h-screen bg-gradient-to-br from-[#fffdf4] via-[#fff9e9] to-[#fff5d8] text-[#a19246] font-bebas flex items-center justify-center overflow-hidden relative"
    >
      <img
        src={LalaLogo}
        alt="Lala Logo"
        className="absolute top-8 right-12 w-[150px] object-contain"
      />

      <div className="max-w-[1440px] w-full h-[90vh] grid grid-cols-3 items-center px-12">
        <div className="flex flex-col justify-center h-full items-end text-right gap-32">
          <div className="space-y-1 pt-20  ">
            <div className="flex flex-col items-end gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[90px] leading-[90px]">{time.minSec}</div>
            <div className="text-[80px] leading-[80px] -mt-4">{time.ms}</div>
          </div>

          <div className="space-y-1 pb-[6px]  ">
            <div className="text-[36px]">JUGADOR</div>
            <div className="text-[72px] flex items-center justify-end gap-2">
              <img src={RunIcon} alt="Jugador 1" className="w-14 h-14" />1
            </div>
          </div>
        </div>

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

        <div className="flex flex-col justify-center h-full items-start text-left gap-32">
          <div className="space-y-1 pt-20 ">
            <div className="flex flex-col items-start gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[90px] leading-[90px]">{time.minSec}</div>
            <div className="text-[80px] leading-[80px] -mt-4">{time.ms}</div>
          </div>

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
