import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useAuthStore } from "@/store/auth-store";
import { RiUserLine } from "@remixicon/react";

const ProfilePage = () => {
  const { user, loading } = useAuthStore();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              <RiUserLine className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user?.username}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Full name:
            </div>
            <div className="text-sm text-muted-foreground">
              {user?.full_name}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Phone number:
            </div>
            <div className="text-sm text-muted-foreground">{user?.phone}</div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">Role:</div>
            <Badge variant="outline">{user?.role}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
