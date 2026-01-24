import { Button } from "@/components/ui/button";
import { RiDownloadLine, RiLoader4Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
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
      // Dynamic import of docx - loaded only when needed
      const docxModule = await import("docx");
      const {
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
      } = docxModule;

      const result = await refetch(); // Trigger API call
      const fetchedData: StudentData[] = result.data?.results || [];

      if (fetchedData.length === 0) {
        console.error("No data fetched from API");
        return;
      }

      // Group name
      const groupName = fetchedData[0]?.group_name || "Group Result";

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
          total: total.toFixed(1),
          result,
        };
      });

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

      // Calculate column widths for A4 format
      // A4 width: 210mm = 11906 twips
      // With 1 inch (1440 twips) margins on each side: usable width = 11906 - 2880 = 9026 twips
      const columnCount = headers.length;
      const totalTableWidth = 9026; // twips (maximum usable width on A4 with 1" margins)
      
      // Calculate proportional widths for columns
      // No column: 0.4x, Name column: 2.0x, others: 0.8x
      const widthMultipliers = [
        0.4,  // No column - smaller
        2.0,  // Name column - larger
        0.8,  // L
        0.8,  // R
        0.8,  // T1
        0.8,  // T2
        0.8,  // Writing total
        0.8,  // Total score
        0.8,  // Result
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

      // Helper function to get result cell shading color
      const getResultShading = (result: string) => {
        if (result === "Qualified") return "FFFF00"; // Yellow
        else if (result === "Saved Chance") return "90EE90"; // Green
        else if (result === "Failed") return "FF6347"; // Red
        else if (result === "D") return "808080"; // Gray
        return undefined;
      };

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
        const rowData: (string | number)[] = [
          item.no,
          item.name,
          item.l,
          item.r,
          item.t1,
          item.t2,
          item.writing,
          item.total,
          item.result,
        ];

        return new TableRow({
          children: rowData.map(
            (cellValue, index) => {
              const isResultColumn = index === 8;
              const shading = isResultColumn
                ? getResultShading(String(cellValue))
                : undefined;

              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: String(cellValue),
                      }),
                    ],
                    alignment:
                      index === 0
                        ? AlignmentType.CENTER
                        : AlignmentType.LEFT,
                  }),
                ],
                shading: shading
                  ? {
                      fill: shading,
                    }
                  : undefined,
                width: {
                  size: getColumnWidth(index),
                  type: WidthType.DXA,
                },
              });
            }
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
                text: `Test Title: ${testData.test_info.test_title}`,
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
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Material Title: ${testData.title}`,
                size: 20,
              }),
            ],
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Materials:",
                size: 20,
              }),
            ],
          })
        );
        testData.materials.forEach((mat, index) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${mat.type.toUpperCase()}: ${mat.title}`,
                  size: 20,
                }),
              ],
            })
          );
        });
        children.push(new Paragraph({ text: "" })); // Empty line
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
      const footerText = [
        "* Qualified --> those who got at least overall 6",
        "** Saved chance --> those who nearly passed",
        "*** Writing total formula just in case: ((T2*2)+T1)/3",
        "**** D --> Disqualified due to the occurrence of cheating",
      ];
      footerText.forEach((line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 20,
              }),
            ],
          })
        );
      });
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
      link.download = `${groupName} - Mock Results - ${fileNameDate}.docx`;
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

export default MockFullResultsPdf;
