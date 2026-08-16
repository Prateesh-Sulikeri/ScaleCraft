import { ThemeToggle } from "@/app/ThemeToggle";
import { HomeCanvas } from "@/app/HomeCanvas";
import { AboutButton } from "@/app/AboutButton";
import { ReleaseNotesButton } from "@/app/ReleaseNotesButton";
import { AppUserButton } from "@/app/AppUserButton";

export default function RootPage() {
  return (
    <main className="relative min-h-0 flex-1 overflow-hidden">
      <div className="absolute inset-0">
        <HomeCanvas />
      </div>

      <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
        <ThemeToggle />
        <AppUserButton />
      </div>

      <div className="absolute bottom-16 left-6 z-10">
        <AboutButton />
      </div>

      <ReleaseNotesButton />
    </main>
  );
}
