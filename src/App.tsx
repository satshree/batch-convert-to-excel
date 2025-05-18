import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import "./App.css";

function App() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const zip = new JSZip();

    for (const file of acceptedFiles) {
      try {
        const text = await file.text();

        // Parse tab-delimited data
        const { data } = Papa.parse<string[]>(text, { delimiter: "\t" });

        // Create Excel workbook
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Convert workbook to binary string
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        // Add to ZIP
        const outputFileName = file.name.replace(/\.txt$/, ".xlsx");
        zip.file(outputFileName, excelBuffer);
      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err);
      }
    }

    // Generate ZIP and trigger download
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "converted_excels.zip");
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"] },
    multiple: true,
  });

  return (
    <>
      <div className="app">
        <div className="header">
          <h2>Batch Convert into Excel</h2>
        </div>

        <div>
          <div
            {...getRootProps()}
            className={`dropzone-div center ${
              isDragActive ? "dropzone-active" : ""
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the .txt files here...</p>
            ) : (
              <p className="text-center">
                Drag & drop tab-delimited .txt files here
                <br /> or click to select
              </p>
            )}
          </div>

          <br />

          <div className="text-center">
            <small>Do not upload folder</small>
          </div>
        </div>

        <div className="footer">
          Made by{" "}
          <a href="https://satshree.com.np" target="_blank">
            Satshree Shrestha
          </a>
        </div>
      </div>
    </>
  );
}

export default App;
