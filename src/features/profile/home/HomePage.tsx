import IllustrationImage from "@/assets/skyMen.webp"; // Adjust the path as necessary
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  RiBookOpenLine,
  RiHeadphoneLine,
  RiLayout2Line,
  RiMic2Line,
  RiPencilLine,
} from "@remixicon/react";
import React from "react";
import { useNavigate } from "react-router-dom";

type SkillCardProps = {
  title: string;
  icon: React.ReactNode;
  count: number;
  path: string;
};

const skills: SkillCardProps[] = [
  {
    title: "Speaking",
    icon: <RiMic2Line className="h-6 w-6 " />,
    count: 0,
    path: "/profile/exams/speakings",
  },
  {
    title: "Listening",
    icon: <RiHeadphoneLine className="h-6 w-6" />,
    count: 0,
    path: "/profile/exams/listenings",
  },
  {
    title: "Reading",
    icon: <RiBookOpenLine className="h-6 w-6" />,
    count: 0,
    path: "/profile/exams/readings",
  },
  {
    title: "Writing",
    icon: <RiPencilLine className="h-6 w-6 " />,
    count: 1,
    path: "/profile/exams/writings",
  },
  {
    title: "Full exam",
    icon: <RiLayout2Line className="h-6 w-6 " />,
    count: 0,
    path: "/profile/exams/full-exam",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="flex justify-between items-center p-6">
        <div>
          <h2 className="text-xl font-semibold">Welcome, Abbosbek Ibragimov</h2>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Card key={skill.title} className="p-6 space-y-4">
            <Button
              className="pointer-events-none"
              variant={"outline"}
              size="icon"
            >
              {skill.icon}
            </Button>
            <CardTitle className="text-base font-medium">
              {skill.title}
            </CardTitle>
            <CardContent className="space-y-2 mt-2 flex items-center justify-between p-0">
              <div className="text-2xl font-bold">{skill.count}</div>
              <Button
                variant="destructive"
                onClick={() => navigate(skill.path)}
              >
                Start test
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
