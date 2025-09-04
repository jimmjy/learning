import performanceImg from "public/performance.jpg";
import Hero from "@/component/hero";

export default function PerformancePage() {
  return (
    <Hero
      imgData={performanceImg}
      imgAlt="welding"
      title="We serve high performance applications"
    />
  );
}
