import Hero from "@/components/hero";
import Features from "@/components/features";
import Stats from "@/components/stats";

export default function Home() {
  return (
    <div className="space-y-12">
      <Hero />
      <Stats />
      <Features />
    </div>
  );
}
