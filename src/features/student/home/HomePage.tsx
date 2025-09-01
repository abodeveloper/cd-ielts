import IllustrationImage from "@/assets/skyMen.webp"; // Adjust the path as necessary
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getMaterials } from "@/features/home/api/material";
import { useAuthStore } from "@/store/auth-store";
import {
  RiBookOpenLine,
  RiHeadphoneLine,
  RiLayout2Line,
  RiMic2Line,
  RiPencilLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type SkillCardProps = {
  title: string;
  icon: React.ReactNode;
  count: number;
  path: string;
};

const testMaterials = [
  {
    id: 1,
    title: "IELTS Practice Test 1",
    sections: [
      {
        id: 1,
        type: "reading",
        title: "Reading Section 1",
      },
      {
        id: 2,
        type: "listening",
        title: "Listening Section 1",
      },
      {
        id: 3,
        type: "writing",
        title: "Writing Section 1",
      },
      {
        id: 4,
        type: "speaking",
        title: "Speaking Section 1",
      },
    ],
  },
  {
    id: 2,
    title: "IELTS Practice Test 2",
    sections: [
      {
        id: 1,
        type: "reading",
        title: "Reading Section 1",
      },
      {
        id: 2,
        type: "listening",
        title: "Listening Section 1",
      },
      {
        id: 3,
        type: "writing",
        title: "Writing Section 1",
      },
      {
        id: 4,
        type: "speaking",
        title: "Speaking Section 1",
      },
    ],
  },
];

export interface Data {
  id: number;
  title: string;
  test_type: string;
  test_number: string;
  date: string;
  materials: TestMaterial[];
}

export interface TestMaterial {
  id: number;
  title: string;
  materials: Material[];
}

export interface Material {
  id: number;
  type: string;
  title: string;
}

export default function Home() {
  const navigate = useNavigate();

  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery<Data[]>({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

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

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.map((item, index) => {
          const test_materials = item.materials;
          if (!test_materials || test_materials.length === 0) {
            return (
              <Card key={item.id} className="p-6 space-y-4">
                <CardTitle className="text-base font-medium">
                  {item.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  No test materials available
                </div>
              </Card>
            );
          }
          return (
            <div key={item.id}>
              <h1>{item.title}</h1>

              {test_materials?.map((test) => (
                <Card key={test.title} className="p-6 space-y-4">
                  <CardTitle className="text-base font-medium">
                    {test.title}
                  </CardTitle>

                  <CardContent className="space-y-2 p-0 pt-2">
                    {test?.materials?.map((section) => (
                      <div className="flex items-center gap-2" key={section.id}>
                        <Button
                          className="pointer-events-none"
                          variant={"outline"}
                          size="icon"
                        >
                          {section.type === "reading" ? (
                            <RiBookOpenLine className="h-6 w-6" />
                          ) : section.type === "listening" ? (
                            <RiHeadphoneLine className="h-6 w-6" />
                          ) : section.type === "writing" ? (
                            <RiPencilLine className="h-6 w-6" />
                          ) : (
                            <RiMic2Line className="h-6 w-6" />
                          )}
                        </Button>
                        <Button
                          key={section.id}
                          variant="outline"
                          size="sm"
                          className="w-full text-left"
                          onClick={() =>
                            navigate(`/profile/exams/${section.type}`)
                          }
                        >
                          {section.title}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })}
      </div> */}
    </div>
  );
}
