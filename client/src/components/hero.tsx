import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Hero() {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
        invOCR.ai - Transform Your Invoice Processing
      </h1>
      <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
        Streamline your auto repair shop's workflow with AI-powered invoice processing. Save time, reduce errors, and improve efficiency.
      </p>
      <div className="space-x-4">
        <Link href="/upload">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="lg">View Demo</Button>
        </Link>
      </div>
    </div>
  );
}
