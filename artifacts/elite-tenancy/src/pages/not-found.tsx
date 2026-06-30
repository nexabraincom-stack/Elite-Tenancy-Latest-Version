import { Link } from "wouter";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary text-accent flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground tracking-tight mb-2">Page not found</h1>
        <p className="text-muted-foreground text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
            <Home size={16} /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
