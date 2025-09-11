export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-[100px] m-2.5 shadow-md border flex justify-center items-center">
      {children}
    </div>
  );
}
