import { useEffect, useState } from "react";

const slides = [
  "/src/assets/standby_scene1.png",
  "/src/assets/standby_scene2.png",
  "/src/assets/standby_scene3.png",
];

export default function StandbyScene() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {slides.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`slide ${index + 1}`}
          className={`absolute w-full h-full object-contain transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />
      ))}
    </div>
  );
}
