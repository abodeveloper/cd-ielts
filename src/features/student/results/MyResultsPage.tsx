import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useAuthStore } from "@/store/auth-store";
import { RiArticleLine, RiBookmark3Line, RiUserLine } from "@remixicon/react";
import { useNavigate } from "react-router-dom";
import MyMocksPage from "./components/MyMocksPage";
import MyThematicsPage from "./components/MyThematicsPage";

const MyResultsPage = () => {
  const navigate = useNavigate();

  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <Card className="w-full">
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
      <div className="space-y-6">
        <div className="text-xl font-semibold text-center">My results</div>
        <Tabs defaultValue="mock" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="mock"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
            >
              <RiArticleLine className="w-5 h-5" />
              Mock
            </TabsTrigger>
            <TabsTrigger
              value="thematic"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
            >
              <RiBookmark3Line className="w-5 h-5" />
              Thematic
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mock" className="mt-6">
            <MyMocksPage />
          </TabsContent>
          <TabsContent value="thematic" className="mt-6">
            <MyThematicsPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyResultsPage;
