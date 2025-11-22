import { Button } from "@/components/ui/button";
import { RiDownloadLine, RiLoader4Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  PageOrientation,
} from "docx";
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

      // Group name
      const groupName = fetchedData[0]?.group_name || "Group Result";

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

      // Calculate column widths for A4 format
      // A4 width: 210mm = 11906 twips
      // With 1 inch (1440 twips) margins on each side: usable width = 11906 - 2880 = 9026 twips
      // Use maximum available width for table
      const columnCount = headers.length;
      const totalTableWidth = 9026; // twips (maximum usable width on A4 with 1" margins)
      
      // Calculate proportional widths for columns
      // No column: 0.5x, Name column: 1.8x, others: 1x
      const widthMultipliers = [
        0.5,  // No column - smaller
        1.8,  // Name column - larger
        ...Array(columnCount - 2).fill(1.0), // Other columns - standard
      ];
      const totalMultiplier = widthMultipliers.reduce((sum, m) => sum + m, 0);
      const baseWidth = Math.floor(totalTableWidth / totalMultiplier);
      
      // Calculate actual column widths
      const columnWidths = widthMultipliers.map((multiplier) =>
        Math.floor(baseWidth * multiplier)
      );
      
      // Adjust to ensure total equals totalTableWidth (distribute remainder)
      const currentTotal = columnWidths.reduce((sum, w) => sum + w, 0);
      const remainder = totalTableWidth - currentTotal;
      if (remainder > 0) {
        // Add remainder to the largest column (Name column)
        columnWidths[1] += remainder;
      }
      
      const getColumnWidth = (index: number) => columnWidths[index];

      // Create header row
      const headerRow = new TableRow({
        children: headers.map(
          (header, index) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                fill: "D3D3D3",
              },
              width: {
                size: getColumnWidth(index),
                type: WidthType.DXA, // DXA = twips (twentieths of a point)
              },
            })
        ),
      });

      // Create data rows
      const dataRows = processedData.map((item) => {
        const rowData: (string | number)[] = [item.no, item.name, item.created_at];
        if (type === "reading" || type === "listening") {
          rowData.push(
            item.total_questions,
            item.correct_answers,
            item.incorrect_answers,
            item.score_percentage
          );
        } else if (type === "writing") {
          rowData.push(
            item.writing_task1_score,
            item.writing_task2_score,
            item.total_score
          );
        } else if (type === "speaking") {
          rowData.push(item.feedback, item.score);
        }

        return new TableRow({
          children: rowData.map(
            (cellValue, index) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: String(cellValue),
                      }),
                    ],
                    alignment: AlignmentType.LEFT,
                  }),
                ],
                width: {
                  size: getColumnWidth(index),
                  type: WidthType.DXA,
                },
              })
          ),
        });
      });

      // Create table with maximum width for A4
      const table = new Table({
        rows: [headerRow, ...dataRows],
        width: {
          size: totalTableWidth,
          type: WidthType.DXA, // Use twips for precise A4 width
        },
        columnWidths: headers.map((_, index) => getColumnWidth(index)),
      });

      // Create document children
      const children: (Paragraph | Table)[] = [];

      // Test information
      if (testData) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Test Title: ${testData.title}`,
                size: 20,
              }),
            ],
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Test Type: ${testData.test_type}`,
                size: 20,
              }),
            ],
          })
        );
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Group: ${groupName}`,
              size: 24,
              bold: true,
            }),
          ],
        })
      );

      children.push(new Paragraph({ text: "" })); // Empty line

      // Add table
      children.push(table);

      // Footer
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Tashkent",
      });
      children.push(new Paragraph({ text: "" })); // Empty line
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${currentDate}`,
              size: 20,
            }),
          ],
        })
      );

      // Create document with A4 page size and margins
      // A4 dimensions: 210mm x 297mm = 11906 twips x 16838 twips
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation: PageOrientation.PORTRAIT,
                  width: 11906, // A4 width in twips (210mm)
                  height: 16838, // A4 height in twips (297mm)
                },
                margin: {
                  top: 1440, // 1 inch = 1440 twips
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: children,
          },
        ],
      });

      // Generate and download Word document
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Format date for filename (remove invalid characters)
      const fileNameDate = currentDate.replace(/[/:]/g, "-").replace(/,/g, "");
      link.download = `${groupName} - Thematic ${type} Results - ${fileNameDate}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Word document:", error);
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
