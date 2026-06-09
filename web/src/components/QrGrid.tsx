export default function QrGrid() {
  const cells = Array.from({ length: 25 });
  return (
    <div className="mx-auto mt-3 grid h-28 w-28 grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-2 shadow">
      {cells.map((_, index) => (
        <span
          key={index}
          className={`rounded-[3px] ${[0, 1, 3, 4, 5, 8, 10, 12, 13, 16, 18, 20, 21, 23, 24].includes(index) ? 'bg-slate-950' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  );
}
