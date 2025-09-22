import { Button } from "@/components/ui/button";
import { RiDownloadLine } from "@remixicon/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React from "react";

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
  data: StudentData[];
  testData?: TestData; // Test ma'lumotlari ixtiyoriy
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, testData }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Group name
    const groupName = data[0]?.group_name || "Group Result";

    // Test ma'lumotlarini qo'shish (jadvaldan oldin)
    let currentY = 10;
    if (testData) {
      doc.setFontSize(8); // Kichikroq font test uchun
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
    doc.text(`Group: ${groupName}`, 10, currentY); // Jadval yuqorisidagi group name
    currentY += 10;

    // Data ni process qilish: Result ni hisoblash va sort qilish
    const processedData = data.map((student, index) => {
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

    // Table data array
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

    // Jadvalni qo'shish va ranglarni belgilash
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: currentY,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" }, // Font o'lchami rasmga mos
      headStyles: { fillColor: [200, 200, 200], fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 35 }, // Name ustuni kengligi
      },
      willDrawCell: (data) => {
        if (data.column.index === 8 && data.row.section === "body") {
          // Result ustuni
          const result = data.cell.raw as string;
          if (result === "Qualified") {
            doc.setFillColor(255, 255, 0); // Sariq
          } else if (result === "Saved Chance") {
            doc.setFillColor(144, 238, 144); // Yashil
          } else if (result === "Failed") {
            doc.setFillColor(255, 99, 71); // Qizil
          } else if (result === "D") {
            doc.setFillColor(128, 128, 128); // Kulrang
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

    // Jadvaldan keyin qo'shimcha ma'lumotlarni pastda chiqarish
    const footerY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8); // Footer fonti
    const footerText = [
      "* Qualified --> those who got at least overall 6",
      "** Saved chance --> those who nearly passed",
      "*** Writing total formula just in case: ((T2*2)+T1)/3",
      "**** D --> Disqualified due to the occurrence of cheating",
    ];
    footerText.forEach((line, index) => {
      doc.text(line, 10, footerY + index * 6);
    });

    // Qo'shimcha ma'lumot: Sana va vaqt
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Tashkent",
    });
    doc.text(
      `Generated on: ${currentDate}`,
      10,
      footerY + footerText.length * 6 + 5
    );

    doc.save(`${groupName} - ${currentDate}`);
  };

  return (
    <Button onClick={generatePDF}>
      <RiDownloadLine className="w-5 h-5"/> Doownload
    </Button>
  );
};

export default PDFGenerator;
