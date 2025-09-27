import { Button } from "@/components/ui/button";
import { RiDownloadLine, RiLoader4Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useMemo, useState } from "react";
import { getAllMockMaterialResults } from "../api/test-material";

interface MaterialInfo {
  test_material_id: number;
  type: string;
  title: string;
  reading_complete: boolean;
  listening_complete: boolean;
  writing_complete: boolean;
  speaking_complete: boolean;
  listening_total_questions: number;
  listening_correct_answers: number;
  listening_score: number;
  reading_total_questions: number;
  reading_correct_answers: number;
  reading_score: number;
  writing_task1_score: number;
  writing_task2_score: number;
  writing_overall_score: number;
  speaking_overall_score: number;
  total_overall_score: number;
}

interface Material {
  id: number;
  type: string;
  title: string;
}

interface TestInfo {
  test_title: string;
  test_id: number;
}

interface TestData {
  id: number;
  title: string;
  test_type: string;
  test_info: TestInfo;
  materials: Material[];
}

interface StudentData {
  student_id: number;
  full_name: string;
  phone: string;
  group_name: string;
  created_at: string;
  material_info: MaterialInfo;
}

interface PDFGeneratorProps {
  testData?: TestData;
  material_id: string | undefined;
  group_id: string | undefined;
}

const MockFullResultsPdf: React.FC<PDFGeneratorProps> = ({
  testData,
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
    queryKey: ["mock-full-results", queryParams],
    queryFn: () => getAllMockMaterialResults(material_id, group_id),
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
        doc.text(`Test Title: ${testData.test_info.test_title}`, 10, currentY);
        currentY += 5;
        doc.text(`Test Type: ${testData.test_type}`, 10, currentY);
        currentY += 5;
        doc.text(`Material Title: ${testData.title}`, 10, currentY);
        currentY += 5;
        doc.text("Materials:", 10, currentY);
        currentY += 5;
        testData.materials.forEach((mat, index) => {
          doc.text(
            `${index + 1}. ${mat.type.toLocaleUpperCase()}: ${mat.title}`,
            15,
            currentY + index * 5
          );
        });
        currentY += testData.materials.length * 5 + 5;
      }
      doc.setFontSize(12);
      doc.text(`Group: ${groupName}`, 10, currentY);
      currentY += 10;

      // Process data
      const processedData = fetchedData.map((student, index) => {
        const mi = student.material_info;
        const lStr = mi.listening_complete
          ? `${mi.listening_correct_answers}/${mi.listening_score}`
          : mi.listening_score > 0
          ? mi.listening_score.toString()
          : "-";
        const rStr = mi.reading_complete
          ? `${mi.reading_correct_answers}/${mi.reading_score}`
          : mi.reading_score > 0
          ? mi.reading_score.toString()
          : "-";
        const t1 =
          mi.writing_task1_score > 0 ? mi.writing_task1_score.toString() : "-";
        const t2 =
          mi.writing_task2_score > 0 ? mi.writing_task2_score.toString() : "-";
        const writingTotal =
          mi.writing_overall_score > 0
            ? mi.writing_overall_score.toString()
            : t1 !== "-" && t2 !== "-"
            ? ((parseFloat(t2) * 2 + parseFloat(t1)) / 3).toFixed(1)
            : "-";
        const total = mi.total_overall_score || 0;
        let result = "Failed";
        if (total >= 6) result = "Qualified";
        else if (total === 5.5) result = "Saved Chance";
        else if (t1 === "D" || t2 === "D") result = "D";

        return {
          no: index + 1,
          name: student.full_name,
          l: lStr,
          r: rStr,
          t1,
          t2,
          writing: writingTotal,
          total,
          result,
        };
      });

      // Table data
      const tableData = processedData.map((item) => [
        item.no,
        item.name,
        item.l,
        item.r,
        item.t1,
        item.t2,
        item.writing,
        item.total,
        item.result,
      ]);

      const headers = [
        "No",
        "Names and Surnames",
        "L",
        "R",
        "T1",
        "T2",
        "Writing total",
        "Total score",
        "Result",
      ];

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: currentY,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
        headStyles: { fillColor: [200, 200, 200], fontSize: 8 },
        columnStyles: {
          1: { cellWidth: 35 },
        },
        willDrawCell: (data) => {
          if (data.column.index === 8 && data.row.section === "body") {
            const result = data.cell.raw as string;
            if (result === "Qualified") {
              doc.setFillColor(255, 255, 0); // Yellow
            } else if (result === "Saved Chance") {
              doc.setFillColor(144, 238, 144); // Green
            } else if (result === "Failed") {
              doc.setFillColor(255, 99, 71); // Red
            } else if (result === "D") {
              doc.setFillColor(128, 128, 128); // Gray
            }
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
          }
        },
        margin: { top: 10, left: 10, right: 10 },
      });

      // Footer
      const footerY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      const footerText = [
        "* Qualified --> those who got at least overall 6",
        "** Saved chance --> those who nearly passed",
        "*** Writing total formula just in case: ((T2*2)+T1)/3",
        "**** D --> Disqualified due to the occurrence of cheating",
      ];
      footerText.forEach((line, index) => {
        doc.text(line, 10, footerY + index * 6);
      });

      // Generation date
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Tashkent",
      });
      doc.text(
        `Generated on: ${currentDate}`,
        10,
        footerY + footerText.length * 6 + 5
      );

      doc.save(`${groupName} - ${currentDate}`);
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

export default MockFullResultsPdf;
