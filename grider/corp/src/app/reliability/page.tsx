import reliabilityImg from "public/reliability.jpg";
import Hero from "@/component/hero";

export default function ReliabiltyPage() {
  return (
    <Hero
      imgData={reliabilityImg}
      imgAlt="welding"
      title="Super high reliability hosting"
    />
  );
}
