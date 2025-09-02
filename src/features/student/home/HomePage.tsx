import IllustrationImage from "@/assets/skyMen.webp"; // Adjust the path as necessary
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <Card className="flex justify-between items-center p-6">
        <div>
          <h2 className="text-xl font-semibold">Welcome, {user?.username}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Enhance your skills and reach new heights. Choose a package to start
            your IELTS simulation exam. Consistent practice leads to great
            results.
          </p>
        </div>
        <img
          src={IllustrationImage} // rasm yo‘li
          alt="Student"
          className="w-32 h-auto hidden md:block"
        />
      </Card>
    </div>
  );
}
