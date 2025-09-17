export default function Responsive({ style }: { style?: string }) {
  return (
    <div className={`text-4xl ${style ?? ""}`}>
      <div className="invisible">base</div>
      <div className="invisible sm:visible md:text-red-500">base</div>
      <div className="invisible md:visible">base</div>
      <div className="invisible lg:visible">base</div>
      <div className="invisible xl:visible">base</div>
      <div className="invisible 2xl:visible">base</div>
    </div>
  );
}
