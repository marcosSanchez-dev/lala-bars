import { useState } from "react";
import "@fontsource/bebas-neue";
import "./index.css";

// Importar imágenes
import ClockIcon from "./assets/clock.png";
import RunIcon from "./assets/figure.run.png";
import LalaLogo from "./assets/Lala_Logo.png";

function App() {
  const [progress1, setProgress1] = useState(40);
  const [progress2, setProgress2] = useState(90);

  const increase = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter((prev) => Math.min(prev + 10, 100));
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#fffdf4] via-[#fff9e9] to-[#fff5d8] text-[#a8842b] font-bebas flex items-center justify-center overflow-hidden relative">
      {/* Logo LALA */}
      <img
        src={LalaLogo}
        alt="Lala Logo"
        className="absolute top-4 right-6 w-[120px] object-contain"
      />

      <div className="w-full max-w-screen-xl h-[90%] grid grid-cols-3 items-center px-8">
        {/* Columna Izquierda */}
        <div className="flex flex-col justify-between h-full py-8 text-right pr-4">
          <div className="space-y-2">
            <div className="flex flex-col items-end gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[140px] leading-[120px]">00:00</div>
            <div className="text-[64px]">:00</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[40px]">JUGADOR</div>
            <div className="text-[80px] flex items-center gap-3">
              <img src={RunIcon} alt="Jugador 1" className="w-14 h-14" />1
            </div>
          </div>
        </div>

        {/* Columnas del medio (barras) */}
        <div className="flex justify-center gap-28 items-end h-full">
          {/* Barra Jugador 1 */}
          <div
            className="relative w-[80px] h-full bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end cursor-pointer"
            onClick={() => increase(setProgress1)}
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

          {/* Barra Jugador 2 */}
          <div
            className="relative w-[80px] h-full bg-[#f6f5f2] rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] flex items-end cursor-pointer"
            onClick={() => increase(setProgress2)}
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

        {/* Columna Derecha */}
        <div className="flex flex-col justify-between h-full py-8 text-left pl-4">
          <div className="space-y-2">
            <div className="flex flex-col items-start gap-1">
              <img src={ClockIcon} alt="Clock" className="w-10 h-10" />
              <div className="text-[32px]">TIEMPO</div>
            </div>
            <div className="text-[140px] leading-[120px]">00:00</div>
            <div className="text-[64px]">:00</div>
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
