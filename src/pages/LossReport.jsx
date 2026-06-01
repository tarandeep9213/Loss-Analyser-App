import { PDFDocument, rgb } from "pdf-lib";

async function transformPdf(existingPdfBytes, damcoLogoBytes) {
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const logoImage = await pdfDoc.embedPng(damcoLogoBytes);

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    // ❌ Remove CNC Header (logo + text)
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(1, 1, 1),
    });

    // ❌ Remove footer/contact details
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 80,
      color: rgb(1, 1, 1),
    });

    // ✅ Add Damco Logo
    page.drawImage(logoImage, {
      x: 20,
      y: height - 100,
      width: 140,
      height: 50,
    });
  });

  return await pdfDoc.save();
}

import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import ReportSummary from "./ReportSummary";
import ReportAnalysis from "./ReportAnalysis";
import ChatBot from "../components/ChatBot";

const pdfBlobCache = new Map();

const PDFViewerContent = lazy(() => import("./PDFViewerContent"));

function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`loss-report-tabpanel-${index}`}
      aria-labelledby={`loss-report-tab-${index}`}
      sx={{ py: 3 }}
    >
      {value === index && children}
    </Box>
  );
}

function LossReport() {
  const { claimNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const rowData = location.state || {};
  const source = rowData.source || "dashboard";
  const isPropertyFiles = source === "propertyFiles";
  const [data, setData] = useState({
    reportName: rowData.loss_report_name || `Loss Report - ${claimNo}`,
    report_id: rowData.report_id,
    ...rowData,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const createdBlobUrl = useRef(null);

  const extractedFiles = isPropertyFiles
    ? rowData.all_extracted_file_name || []
    : [];

  const hasFileOptions = extractedFiles.length > 0;

  // ── Dropdown anchor & selected file state ──

  const [selectedFile, setSelectedFile] = useState(null);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!rowData.report_id || !rowData.loss_report_name) {
          throw new Error("Missing required report parameters");
        }

        const cacheKey = rowData.report_id;

        if (pdfBlobCache.has(cacheKey)) {
          setData((prev) => ({ ...prev, pdfUrl: pdfBlobCache.get(cacheKey) }));
          setLoading(false);
          return;
        }
        // Mock PDF Fetch - Loading the local file from the /public folder
        let pdfUrl;
        try {
          //const response = await fetch("/d0c193e1-405b-46f7-a176-acb5200aa1e5.pdf");
          const pdfResponse = await fetch("/d0c193e1-405b-46f7-a176-acb5200aa1e5.pdf");
          if (!pdfResponse.ok) throw new Error("Not found");
          const pdfBytes = await pdfResponse.arrayBuffer();
          //pdfUrl = URL.createObjectURL(await response.blob());
          // 👉 Load Damco logo (put in /public folder)
          const logoResponse = await fetch("/logo.png");
          const logoBytes = await logoResponse.arrayBuffer();

          // 👉 Transform PDF
          const modifiedPdfBytes = await transformPdf(pdfBytes, logoBytes);

          // 👉 Create URL
          const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
          pdfUrl = URL.createObjectURL(blob);



        } catch (err) {
          // Fallback to a dummy blank PDF if the user hasn't placed the file in the public folder yet
          console.warn("PDF not found in public folder, loading dummy PDF instead.", err);
          const dummyPdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCj4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTEKICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNjgKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIFdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDE2NyAwMDAwMCBuIAowMDAwMDAwMjk2IDAwMDAwIG4gCjAwMDAwMDAzODQgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9GCg==";
          const byteCharacters = atob(dummyPdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
          pdfUrl = URL.createObjectURL(blob);
        }

        pdfBlobCache.set(cacheKey, pdfUrl);
        createdBlobUrl.current = pdfUrl;

        setData((prevData) => ({
          ...prevData,
          pdfUrl,
        }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching report data:", error);
        if (error.message === "Missing required report parameters") {
          setError("Missing required report parameters.");
        } else {
          setError("Failed to load the PDF file. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchReportData();

    return () => {
      if (data?.pdfUrl) {
        URL.revokeObjectURL(data.pdfUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData.loss_report_name, rowData.report_id]);

  const handleBack = () => navigate(-1);
  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  // ── Open PDF blob URL directly in a new browser tab
  const handleOpenPdfNewTab = () => {
    if (data?.pdfUrl) {
      window.open(data.pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ── Open Report Analysis in a new tab.
  //    Persist params to sessionStorage so the standalone page can read them.
  const handleOpenAnalysisNewTab = () => {
    const params = new URLSearchParams();
    params.set("report_id", data?.report_id);
    if (data?.prelim_folder) {
      params.set("prelim_folder", data.prelim_folder);
    }
    window.open(
      `/report-analysis?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleFileSelect = async (fileName) => {
    if (fileName === selectedFile) return;

    const cacheKey = `${rowData.report_id}_${fileName}`;

    try {
      setPdfLoading(true);
      setError(null);
      setSelectedFile(fileName);

      // Use cache if available
      if (pdfBlobCache.has(cacheKey)) {
        setData((prev) => ({ ...prev, pdfUrl: pdfBlobCache.get(cacheKey) }));
        setPdfKey((k) => k + 1);
        setPdfLoading(false);
        return;
      }

      // Mock PDF Fetch for Property Files dropdown - Loading the local file
      let pdfUrl;
      try {
        const response = await fetch("/d0c193e1-405b-46f7-a176-acb5200aa1e5.pdf");
        if (!response.ok) throw new Error("Not found");
        pdfUrl = URL.createObjectURL(await response.blob());
      } catch (err) {
        console.warn("PDF not found in public folder, loading dummy PDF instead.", err);
        const dummyPdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCj4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTEKICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNjgKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIFdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDE2NyAwMDAwMCBuIAowMDAwMDAwMjk2IDAwMDAwIG4gCjAwMDAwMDAzODQgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9GCg==";
        const byteCharacters = atob(dummyPdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
        pdfUrl = URL.createObjectURL(blob);
      }

      pdfBlobCache.set(cacheKey, pdfUrl);

      setData((prev) => ({ ...prev, pdfUrl }));
      setPdfKey((k) => k + 1);
    } catch (err) {
      console.error("Error fetching selected PDF:", err);

      setError("Failed to load the selected PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const renderPDFViewer = () => {
    if (error) {
      return (
        <Typography color="error" align="center">
          {error}
        </Typography>
      );
    }

    if (!data?.pdfUrl) {
      return (
        <Typography color="text.secondary" align="center">
          No PDF file available
        </Typography>
      );
    }

    return (
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <PDFViewerContent key={pdfKey} data={data} />
      </Suspense>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" component="h1">
          Loss Report Details
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h8" gutterBottom>
            Report Name:{" "}
            <span>{data?.reportName || `Loss Report - ${claimNo}`}</span> /{" "}
            <Box component="span" sx={{ color: "#5B9B98" }}>
              Claim No: {claimNo}
            </Box>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="loss report tabs"
          >
            <Tab label="Loss Report Analysis" />
            <Tab label="Report Summary" />
            {!isPropertyFiles && <Tab label="ChatBot" />}
          </Tabs>
        </Box>

        {/* ── Tab 0: Split screen — PDF left, Analysis right ── */}
        <TabPanel value={activeTab} index={0}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              height: "80vh",
              overflow: "hidden",
            }}
          >
            {/* ── Left panel: PDF Viewer ── */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1,
              }}
            >
              {/* Panel header row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                  flexShrink: 0,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Loss Report
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {isPropertyFiles && hasFileOptions && (
                    <Select
                      size="small"
                      displayEmpty
                      value={selectedFile || ""}
                      onChange={(e) => handleFileSelect(e.target.value)}
                      sx={{
                        minWidth: 160,

                        fontSize: "0.875rem",

                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "divider",
                        },
                      }}
                      renderValue={(val) => val || "Select File"}
                    >
                      {extractedFiles.map((fileName) => (
                        <MenuItem key={fileName} value={fileName}>
                          {fileName}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                  <Tooltip title="Open in new tab">
                    {/* span wrapper keeps Tooltip working when button is disabled */}
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleOpenPdfNewTab}                
                        disabled={!data?.pdfUrl || loading || pdfLoading}
                        sx={{ color: "text.secondary" }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ mb: 1, flexShrink: 0 }} />

              {/* Scrollable PDF content */}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                {loading || pdfLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  renderPDFViewer()
                )}
              </Box>
            </Box>

            {/* Vertical divider */}
            <Divider orientation="vertical" flexItem />

            {/* ── Right panel: Report Analysis ── */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1,
              }}
            >
              {/* Panel header row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                  flexShrink: 0,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Report Analysis
                </Typography>
                <Tooltip title="Open in new tab">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleOpenAnalysisNewTab}
                      disabled={!data?.report_id}
                      sx={{ color: "text.secondary" }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Divider sx={{ mb: 1, flexShrink: 0 }} />

              {/* Scrollable analysis content */}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <ReportAnalysis
                  reportId={data?.report_id}
                  prelim_folder={data?.prelim_folder}
                  pdfUrl={data?.pdfUrl}
                />
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* ── Tab 1: Report Summary ── */}
        <TabPanel value={activeTab} index={1}>
          <ReportSummary reportId={data?.report_id} />
        </TabPanel>

        {/* ── Tab 2: ChatBot ── */}
        {!isPropertyFiles && (
          <TabPanel value={activeTab} index={2}>
            <ChatBot reportId={data?.report_id} userId />
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
}

export default LossReport;
