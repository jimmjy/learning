import homeImg from "public/home.jpg";
import Hero from "@/component/hero";

export default function Home() {
  return (
    <Hero
      imgData={homeImg}
      imgAlt="Car factory"
      title="Professional Cloud Hosting"
    />
  );
}
