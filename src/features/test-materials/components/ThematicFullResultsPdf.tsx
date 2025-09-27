import { Button } from "@/components/ui/button";
import { RiDownloadLine, RiLoader4Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useMemo, useState } from "react";
import { getAllThematicMaterialResults } from "../api/test-material";

interface MaterialInfo {
  id: number;
  type: string;
  title: string;
  total_questions?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  score_percentage?: number;
  score?: number;
  writing_task1?: { completed: boolean; score?: number };
  writing_task2?: { completed: boolean; score?: number };
  feedback?: string;
}

interface StudentData {
  student_id: number;
  full_name: string;
  phone: string;
  group_name: string;
  created_at: string;
  material_info: MaterialInfo;
}

interface TestData {
  id: number;
  title: string;
  test_type: string;
}

interface PDFGeneratorProps {
  testData?: TestData;
  type: "reading" | "writing" | "speaking" | "listening";
  material_id: string | undefined;
  group_id: string | undefined;
}

const ThematicFullResultsPdf: React.FC<PDFGeneratorProps> = ({
  testData,
  type,
  material_id,
  group_id,
}) => {
  const [isFetching, setIsFetching] = useState(false);

  // Memoize query parameters
  const queryParams = useMemo(
    () => ({ material_id, group_id }),
    [material_id, group_id]
  );

  // Fetch data on button click
  const { data, fetchStatus, refetch } = useQuery({
    queryKey: ["thematic-full-results", queryParams],
    queryFn: () => getAllThematicMaterialResults(type, material_id, group_id),
    enabled: false, // Disable automatic fetching
  });

  const generatePDF = async () => {
    setIsFetching(true);
    try {
      const result = await refetch(); // Trigger API call
      const fetchedData: StudentData[] = result.data?.results || [];

      if (fetchedData.length === 0) {
        console.error("No data fetched from API");
        return;
      }

      const doc = new jsPDF();

      // Group name
      const groupName = fetchedData[0]?.group_name || "Group Result";

      // Test information
      let currentY = 10;
      if (testData) {
        doc.setFontSize(8);
        doc.text(`Test Title: ${testData.title}`, 10, currentY);
        currentY += 5;
        doc.text(`Test Type: ${testData.test_type}`, 10, currentY);
        currentY += 10;
      }
      doc.setFontSize(12);
      doc.text(`Group: ${groupName}`, 10, currentY);
      currentY += 10;

      // Define headers based on type
      const baseHeaders = ["No", "Student Name", "Test Performed"];
      let typeSpecificHeaders: string[] = [];
      if (type === "reading" || type === "listening") {
        typeSpecificHeaders = [
          "Total Questions",
          "Correct Answers",
          "Incorrect Answers",
          "Score Percentage (%)",
        ];
      } else if (type === "writing") {
        typeSpecificHeaders = [
          "Writing (T1) Score",
          "Writing (T2) Score",
          "Total Score",
        ];
      } else if (type === "speaking") {
        typeSpecificHeaders = ["Feedback", "Score"];
      }
      const headers = [...baseHeaders, ...typeSpecificHeaders];

      // Process data for table
      const processedData = fetchedData.map((student, index) => {
        const mi = student.material_info;
        const baseData = {
          no: index + 1,
          name: student.full_name,
          created_at: `${student.created_at.slice(
            0,
            10
          )} ${student.created_at.slice(11, 19)}`,
        };

        let typeSpecificData: Record<string, string> = {};
        if (type === "reading" || type === "listening") {
          typeSpecificData = {
            total_questions: mi.total_questions?.toString() || "-",
            correct_answers: mi.correct_answers?.toString() || "-",
            incorrect_answers: mi.incorrect_answers?.toString() || "-",
            score_percentage: mi.score_percentage?.toString() || "-",
          };
        } else if (type === "writing") {
          typeSpecificData = {
            writing_task1_score:
              mi.writing_task1?.completed && mi.writing_task1?.score
                ? mi.writing_task1.score.toString()
                : "Not completed",
            writing_task2_score:
              mi.writing_task2?.completed && mi.writing_task2?.score
                ? mi.writing_task2.score.toString()
                : "Not completed",
            total_score: mi.score?.toString() || "-",
          };
        } else if (type === "speaking") {
          typeSpecificData = {
            feedback: mi.feedback || "-",
            score: mi.score?.toString() || "-",
          };
        }

        return { ...baseData, ...typeSpecificData };
      });

      // Table data array
      const tableData = processedData.map((item) => {
        const row = [item.no, item.name, item.created_at];
        if (type === "reading" || type === "listening") {
          row.push(
            item.total_questions,
            item.correct_answers,
            item.incorrect_answers,
            item.score_percentage
          );
        } else if (type === "writing") {
          row.push(
            item.writing_task1_score,
            item.writing_task2_score,
            item.total_score
          );
        } else if (type === "speaking") {
          row.push(item.feedback, item.score);
        }
        return row;
      });

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: currentY,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
        headStyles: { fillColor: [200, 200, 200], fontSize: 8 },
        columnStyles: {
          1: { cellWidth: 35 }, // Name column width
        },
        margin: { top: 10, left: 10, right: 10 },
      });

      // Footer
      const footerY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Tashkent",
      });
      doc.text(`Generated on: ${currentDate}`, 10, footerY);

      // Save PDF
      doc.save(`${groupName} - Thematic ${type} Results - ${currentDate}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Button onClick={generatePDF} disabled={isFetching}>
      {isFetching ? (
        <RiLoader4Line className="w-5 h-5 animate-spin" />
      ) : (
        <RiDownloadLine className="w-5 h-5" />
      )}{" "}
      Download
    </Button>
  );
};

export default ThematicFullResultsPdf;
