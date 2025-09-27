import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background border-b border-border-alpha-light transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1 scale-75" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h3 className="font-medium capitalize text-xl">WONDERS MOCK IELTS</h3>
      </div>
    </header>
  );
}
