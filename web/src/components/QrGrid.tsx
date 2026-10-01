import { useEffect, useState } from "react";

const LIGHT_CELLS = [2, 6, 7, 9, 11, 14, 15, 17, 19, 22];

export default function QrGrid() {
  const cells = Array.from({ length: 25 });
  const [activeCell, setActiveCell] = useState(LIGHT_CELLS[0]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveCell((currentCell) => {
        const currentIndex = LIGHT_CELLS.indexOf(currentCell);
        return LIGHT_CELLS[(currentIndex + 1) % LIGHT_CELLS.length];
      });
    }, 450);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto mt-3 grid h-28 w-28 grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-2 shadow">
      {cells.map((_, index) => (
        <span
          key={index}
          className={`relative rounded-[3px] transition-all duration-300 ${[0, 1, 3, 4, 5, 8, 10, 12, 13, 16, 18, 20, 21, 23, 24].includes(index) ? 'bg-slate-950' : 'bg-slate-200'}`}
        >
            {index === activeCell && <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[#713cff] shadow-[0_0_6px_rgba(113,60,255,0.75)]" />}
        </span>
      ))}
    </div>
  );
}
