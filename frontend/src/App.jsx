import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Database,
  FileText,
  Gauge,
  Image as ImageIcon,
  Lock,
  Menu,
  MessageSquare,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Upload,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("Dashboard");

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  // ---------------------------------------------------------
  // SYSTEM
  // ---------------------------------------------------------

  const [systemStatus, setSystemStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [investigation, setInvestigation] = useState(null);

  const [investigating, setInvestigating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // ---------------------------------------------------------
  // AI QUESTION
  // ---------------------------------------------------------

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);

  // ---------------------------------------------------------
  // SENSOR DATA
  // ---------------------------------------------------------

  const [sensor, setSensor] = useState({
    vibration: 7.2,
    temperature: 86,
    pressure: 2.3,
    rpm: 2980,
  });

  const [sensorResult, setSensorResult] = useState(null);
  const [sensorLoading, setSensorLoading] = useState(false);

  // ---------------------------------------------------------
  // DOCUMENT UPLOAD
  // ---------------------------------------------------------

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // ---------------------------------------------------------
  // VISUAL INSPECTION
  // ---------------------------------------------------------

  const [imageFile, setImageFile] = useState(null);
  const [visionResult, setVisionResult] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);

  // ---------------------------------------------------------
  // REPORT
  // ---------------------------------------------------------

  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // ---------------------------------------------------------
  // LOGIN HANDLER
  // ---------------------------------------------------------

  function handleLogin(event) {
    event.preventDefault();

    if (username === "admin" && password === "sovereign123") {
      setIsLoggedIn(true);
      setLoginError("");
      setPage("Dashboard");
    } else {
      setLoginError("Invalid username or password.");
    }
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  function handleLogout() {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setLoginError("");
    setPage("Dashboard");
    setMenuOpen(false);
  }

  // ---------------------------------------------------------
  // INITIAL DATA
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isLoggedIn) return;

    loadSystemStatus();
    loadDocuments();
  }, [isLoggedIn]);

  // ---------------------------------------------------------
  // SYSTEM STATUS
  // ---------------------------------------------------------

  async function loadSystemStatus() {
    try {
      setLoadingStatus(true);

      const response = await fetch(`${API}/api/system-status`);

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      setSystemStatus(data);
    } catch (error) {
      console.error("System status error:", error);
      setSystemStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  // ---------------------------------------------------------
  // DOCUMENTS
  // ---------------------------------------------------------

  async function loadDocuments() {
    try {
      const response = await fetch(`${API}/api/documents`);

      if (!response.ok) {
        throw new Error("Unable to load documents");
      }

      const data = await response.json();

      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Document loading failed:", error);
    }
  }

  // ---------------------------------------------------------
  // INVESTIGATION
  // ---------------------------------------------------------

  async function startInvestigation() {
    setPage("AI Agent");
    setInvestigating(true);
    setInvestigation(null);

    try {
      const response = await fetch(`${API}/api/investigate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Investigation failed");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Investigation engine returned an error");
      }

      setInvestigation(data);
    } catch (error) {
      console.error("Investigation error:", error);

      setInvestigation({
        success: false,
        agent_summary:
          "Unable to connect to the local investigation engine.",
        steps: [],
      });
    } finally {
      setInvestigating(false);
    }
  }

  // ---------------------------------------------------------
  // AI QUESTION
  // ---------------------------------------------------------

  async function askAI() {
    if (!question.trim()) return;

    try {
      setAsking(true);
      setAnswer(null);

      const response = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data = await response.json();

      setAnswer(data);
    } catch (error) {
      console.error("AI question error:", error);

      setAnswer({
        success: false,
        answer: "Unable to connect to the local AI engine.",
      });
    } finally {
      setAsking(false);
    }
  }

  // ---------------------------------------------------------
  // SENSOR ANALYSIS
  // ---------------------------------------------------------

  async function analyzeSensors() {
    try {
      setSensorLoading(true);
      setSensorResult(null);

      const response = await fetch(`${API}/api/analyze-sensor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sensor),
      });

      const data = await response.json();

      setSensorResult(data);
    } catch (error) {
      console.error("Sensor analysis error:", error);

      setSensorResult({
        success: false,
        risk: "UNKNOWN",
        risk_score: 0,
        alerts: ["Unable to connect to local analysis engine."],
      });
    } finally {
      setSensorLoading(false);
    }
  }

  // ---------------------------------------------------------
  // DOCUMENT UPLOAD
  // ---------------------------------------------------------

  async function uploadDocument(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setUploadMessage("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(`${API}/api/upload-document`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadMessage(`✓ ${file.name} stored locally`);

        await loadDocuments();
      } else {
        setUploadMessage("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);

      setUploadMessage("Unable to upload document");
    } finally {
      setUploading(false);
    }
  }

  // ---------------------------------------------------------
  // DELETE DOCUMENT
  // ---------------------------------------------------------

  async function deleteDocument(filename) {
    const confirmed = window.confirm(
      `Delete "${filename}" from the local knowledge base?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/api/documents/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete document"
        );
      }

      await loadDocuments();

      setAnswer(null);
    } catch (error) {
      console.error("Delete document error:", error);

      alert("Unable to delete the document.");
    }
  }

  // ---------------------------------------------------------
  // VISUAL INSPECTION
  // ---------------------------------------------------------

  async function inspectImage() {
    if (!imageFile) return;

    try {
      setVisionLoading(true);
      setVisionResult(null);

      const formData = new FormData();

      formData.append("file", imageFile);

      const response = await fetch(`${API}/api/inspect-image`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setVisionResult(data);
    } catch (error) {
      console.error("Vision error:", error);

      setVisionResult({
        success: false,
        message:
          "Unable to connect to local vision engine.",
      });
    } finally {
      setVisionLoading(false);
    }
  }

  // ---------------------------------------------------------
  // REPORT
  // ---------------------------------------------------------

  async function generateReport() {
    try {
      setReportLoading(true);

      const response = await fetch(`${API}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      setReport(data);
      setPage("Reports");
    } catch (error) {
      console.error("Report error:", error);
    } finally {
      setReportLoading(false);
    }
  }

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------

  const navigation = [
    {
      name: "Dashboard",
      icon: Gauge,
    },
    {
      name: "Knowledge Base",
      icon: Database,
    },
    {
      name: "Visual Inspection",
      icon: ImageIcon,
    },
    {
      name: "AI Agent",
      icon: Bot,
    },
    {
      name: "Data Analysis",
      icon: BarChart3,
    },
    {
      name: "Reports",
      icon: FileText,
    },
  ];

  function navigate(name) {
    setPage(name);
    setMenuOpen(false);
  }

  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">

          <div className="login-brand-icon">
            <ShieldCheck size={30} />
          </div>

          <div className="login-brand">
            SOVEREIGN AI
          </div>

          <div className="login-subtitle">
            SECURE INDUSTRIAL AI WORKBENCH
          </div>

          <div className="login-divider" />

          <div className="login-heading">
            Secure Access
          </div>

          <p className="login-description">
            Sign in to access the private industrial
            intelligence workspace.
          </p>

          <form onSubmit={handleLogin}>

            <div className="login-field">

              <label>USERNAME</label>

              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setLoginError("");
                }}
                placeholder="Enter username"
                autoComplete="username"
              />

            </div>

            <div className="login-field">

              <label>PASSWORD</label>

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError("");
                }}
                placeholder="Enter password"
                autoComplete="current-password"
              />

            </div>

            {loginError && (
              <div className="login-error">
                <AlertTriangle size={15} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >
              <Lock size={17} />
              SIGN IN
            </button>

          </form>

          <div className="login-security">

            <ShieldCheck size={16} />

            <div>
              <strong>
                AUTHORIZED PERSONNEL ONLY
              </strong>

              <span>
                Local industrial intelligence environment
              </span>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (
    <div className="app-shell">

      {/* MOBILE OVERLAY */}

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <ShieldCheck size={22} />
          </div>

          <div>
            <div className="sidebar-title">
              SOVEREIGN AI
            </div>

            <div className="sidebar-subtitle">
              INDUSTRIAL WORKBENCH
            </div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>

        </div>

        {/* NAVIGATION */}

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  page === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() => navigate(item.name)}
              >

                <Icon size={18} />

                <span>{item.name}</span>

                {page === item.name && (
                  <ChevronRight
                    size={15}
                    className="nav-active-arrow"
                  />
                )}

              </button>
            );
          })}

        </nav>

        {/* SECURITY STATUS */}

        <div className="sidebar-bottom">

          <div className="sidebar-security">

            <div className="sidebar-security-icon">
              <Lock size={16} />
            </div>

            <div>

              <strong>
                SOVEREIGN MODE
              </strong>

              <span>
                Local processing active
              </span>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <WifiOff size={15} />
            Sign out
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <div className="topbar-left">

            <button
              className="menu-button"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
            >
              <Menu size={21} />
            </button>

            <div>

              <div className="topbar-page">
                {page}
              </div>

              
            </div>

          </div>

          <div className="topbar-right">

            <div className="connection-status">

              <span className="connection-dot" />

              LOCAL

            </div>

            <div className="topbar-divider" />

            <div className="notification-button">
              <Bell size={18} />
            </div>

            <div className="user-badge">
              <div className="user-avatar">
                {username
                  ? username
                      .charAt(0)
                      .toUpperCase()
                  : "A"}
              </div>

              <div className="user-info">

                <strong>
                  {username || "Admin"}
                </strong>

                <span>
                   System Administrator
                </span>

              </div>
            </div>

          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="page-content">

          {page === "Dashboard" && (
            <Dashboard
              systemStatus={systemStatus}
              startInvestigation={
                startInvestigation
              }
              navigate={navigate}
              investigation={investigation}
              loadingStatus={loadingStatus}
            />
          )}

          {page === "Knowledge Base" && (
            <KnowledgeBase
              documents={documents}
              uploadDocument={uploadDocument}
              uploading={uploading}
              uploadMessage={uploadMessage}
              deleteDocument={deleteDocument}
              question={question}
              setQuestion={setQuestion}
              askAI={askAI}
              asking={asking}
              answer={answer}
            />
          )}

          {page === "Visual Inspection" && (
            <VisualInspection
              imageFile={imageFile}
              setImageFile={setImageFile}
              inspectImage={inspectImage}
              visionResult={visionResult}
              visionLoading={visionLoading}
            />
          )}

          {page === "AI Agent" && (
            <AgentPage
              investigation={investigation}
              investigating={investigating}
              startInvestigation={
                startInvestigation
              }
              generateReport={generateReport}
              reportLoading={reportLoading}
            />
          )}

          {page === "Data Analysis" && (
            <DataAnalysis
              sensor={sensor}
              setSensor={setSensor}
              analyzeSensors={analyzeSensors}
              sensorResult={sensorResult}
              sensorLoading={sensorLoading}
            />
          )}

          {page === "Reports" && (
            <Reports
              report={report}
              generateReport={generateReport}
              reportLoading={reportLoading}
            />
          )}

        </div>

      </main>

    </div>
  );
}


// ============================================================
// DASHBOARD
// ============================================================

function Dashboard({
  systemStatus,
  startInvestigation,
  navigate,
  investigation,
  loadingStatus,
}) {
  const features = [
    {
      title: "Document AI",
      text: "Search confidential manuals, SOPs and maintenance records.",
      icon: FileText,
      page: "Knowledge Base",
    },
    {
      title: "Visual AI",
      text: "Inspect industrial equipment images locally.",
      icon: ImageIcon,
      page: "Visual Inspection",
    },
    {
      title: "Agent Engine",
      text: "Coordinate multi-step industrial investigations.",
      icon: Bot,
      page: "AI Agent",
    },
    {
      title: "Data Analysis",
      text: "Analyze equipment telemetry and detect anomalies.",
      icon: BarChart3,
      page: "Data Analysis",
    },
  ];

  return (
    <>
      {/* HERO */}

      <section className="hero">

        <div className="hero-copy">

          <div className="eyebrow">
            <Sparkles size={14} />
            SOVEREIGN INDUSTRIAL AI
          </div>

          <h1>
            PRIVATE AI FOR
            <span> INDUSTRIAL INTELLIGENCE</span>
          </h1>

          <p>
            An on-premise multimodal AI workbench that
            investigates industrial incidents using
            confidential documents, visual evidence and
            equipment telemetry — without sending data
            to external services.
          </p>

          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={startInvestigation}
            >
              <Play
                size={17}
                fill="currentColor"
              />
              Start Investigation
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate("Knowledge Base")
              }
            >
              Explore Knowledge Base
              <ArrowRight size={16} />
            </button>

          </div>

        </div>

        <div className="hero-status">

          <div className="status-ring">
            <ShieldCheck size={31} />
          </div>

          <div className="hero-status-title">
            SOVEREIGN MODE
          </div>

          <div className="hero-status-text">
            Processing stays local
          </div>

          <div className="hero-status-line">
            <span />
            External API calls: 0
          </div>

        </div>

      </section>


      {/* FEATURE CARDS */}

      <section className="section">

        <div className="section-heading">

          <div>
            <h2>
              Intelligence Workspace
            </h2>

            <p>
              Multimodal capabilities for confidential
              industrial operations.
            </p>
          </div>

        </div>

        <div className="feature-grid">

          {features.map((feature) => {

            const Icon = feature.icon;

            return (
              <button
                key={feature.title}
                className="feature-card"
                onClick={() =>
                  navigate(feature.page)
                }
              >

                <div className="feature-icon">
                  <Icon size={21} />
                </div>

                <div className="feature-content">

                  <h3>{feature.title}</h3>

                  <p>{feature.text}</p>

                </div>

                <ArrowRight
                  size={17}
                  className="feature-arrow"
                />

              </button>
            );
          })}

        </div>

      </section>


      {/* ACTIVE INVESTIGATION */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              Active Investigation
            </h2>

            <p>
              Current industrial incident under analysis.
            </p>

          </div>

          <button
            className="text-button"
            onClick={() =>
              navigate("AI Agent")
            }
          >
            View investigation
            <ArrowRight size={15} />
          </button>

        </div>

        <div className="investigation-card">

          <div className="investigation-main">

            <div className="equipment-icon">
              <Activity size={24} />
            </div>

            <div>

              <div className="equipment-label">
                EQUIPMENT
              </div>

              <h2>
                Pump P-204
              </h2>

              <div className="equipment-location">
                Production Unit A
              </div>

            </div>

          </div>

          <div className="incident-info">

            <div className="info-label">
              INCIDENT
            </div>

            <strong>
              Abnormal vibration
            </strong>

            <span>
              Detected from equipment telemetry
            </span>

          </div>

          <div className="risk-block">

            <div className="info-label">
              CURRENT RISK
            </div>

            <div className="risk-high">
              HIGH
            </div>

          </div>

          <div className="investigation-action">

            <button
              className="small-primary"
              onClick={startInvestigation}
            >
              Investigate
              <ArrowRight size={15} />
            </button>

          </div>

        </div>

      </section>


      {/* LOWER GRID */}

      <section className="dashboard-lower">

        {/* SYSTEM STATUS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                System Status
              </h3>

              <span>
                Local infrastructure health
              </span>

            </div>

            <Server size={19} />

          </div>

          {loadingStatus ? (

            <div className="loading-state">

              <RefreshCw
                size={20}
                className="spin"
              />

              Checking local systems...

            </div>

          ) : systemStatus ? (

            <div className="status-list">

              <StatusRow
                label="Local Inference"
                value="READY"
              />

              <StatusRow
                label="Knowledge Base"
                value="READY"
              />

              <StatusRow
                label="File Storage"
                value="LOCAL"
              />

              <StatusRow
                label="External APIs"
                value="0"
              />

              <StatusRow
                label="Internet Required"
                value="NO"
              />

            </div>

          ) : (

            <div className="offline-message">

              <AlertTriangle size={18} />

              Backend connection unavailable.

            </div>

          )}

        </div>


        {/* SECURITY */}

        <div className="panel security-panel">

          <div className="panel-header">

            <div>

              <h3>
                Security Boundary
              </h3>

              <span>
                Data sovereignty controls
              </span>

            </div>

            <Lock size={19} />

          </div>

          <div className="security-main">

            <div className="security-check">
              <CheckCircle2 size={21} />
            </div>

            <div>

              <strong>
                Your data stays local
              </strong>

              <p>
                Documents, telemetry and investigation
                results remain inside the organization's
                infrastructure.
              </p>

            </div>

          </div>

          <div className="security-metrics">

            <div>
              <strong>0</strong>
              <span>External APIs</span>
            </div>

            <div>
              <strong>LOCAL</strong>
              <span>File Storage</span>
            </div>

            <div>
              <strong>ON</strong>
              <span>Audit Logging</span>
            </div>

          </div>

        </div>

      </section>


      {/* RECENT EVENTS */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              Recent Activity
            </h2>

            <p>
              Events processed by the local intelligence
              workspace.
            </p>

          </div>

        </div>

        <div className="events-list">

          <Event
            icon={AlertTriangle}
            title="Pump P-204 anomaly detected"
            time="Just now"
            type="HIGH"
          />

          <Event
            icon={FileText}
            title="Maintenance manual available"
            time="2 min ago"
            type="DOCUMENT"
          />

          <Event
            icon={ShieldCheck}
            title="Local security boundary verified"
            time="5 min ago"
            type="SECURITY"
          />

        </div>

      </section>
    </>
  );
}


// ============================================================
// KNOWLEDGE BASE
// ============================================================

function KnowledgeBase({
  documents,
  uploadDocument,
  uploading,
  uploadMessage,
  deleteDocument,
  question,
  setQuestion,
  askAI,
  asking,
  answer,
}) {
  return (
    <PageHeader
      eyebrow="KNOWLEDGE"
      title="Private Knowledge Base"
      description="Search and manage confidential industrial documents stored locally."
    >

      <div className="knowledge-layout">

        <div className="panel documents-panel">

          <div className="panel-header">

            <div>

              <h3>
                Document Library
              </h3>

              <span>
                {documents.length} documents available
              </span>

            </div>

            <label className="upload-button">

              <Upload size={16} />

              {uploading
                ? "Uploading..."
                : "Upload Document"}

              <input
                type="file"
                hidden
                onChange={uploadDocument}
              />

            </label>

          </div>

          {uploadMessage && (
            <div className="upload-message">
              {uploadMessage}
            </div>
          )}

          <div className="document-list">

            {documents.length === 0 ? (

              <div className="empty-state">
                <FileText size={30} />
                <strong>
                  No documents available
                </strong>
                <span>
                  Upload a document to add it to the
                  local knowledge base.
                </span>
              </div>

            ) : (

              documents.map((doc) => (

                <div
                  className="document-row"
                  key={doc.id || doc.name}
                >

                  <div className="document-icon">
                    <FileText size={19} />
                  </div>

                  <div className="document-details">

                    <strong>
                      {doc.name}
                    </strong>

                    <span>
                      {doc.category} · {doc.size}
                    </span>

                  </div>

                  <div className="document-status">
                    {doc.status}
                  </div>

                  <button
                    className="delete-document-btn"
                    onClick={() =>
                      deleteDocument(doc.name)
                    }
                    title="Delete document"
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        </div>


        <div className="panel ai-search-panel">

          <div className="panel-header">

            <div>

              <h3>
                Private AI Assistant
              </h3>

              <span>
                Query the local knowledge system
              </span>

            </div>

            <Bot size={20} />

          </div>

          <div className="ai-search-box">

            <Search size={19} />

            <input
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  askAI();
                }

              }}
              placeholder="Ask about Pump P-204..."
            />

            <button
              onClick={askAI}
              disabled={asking}
            >

              {asking ? (

                <RefreshCw
                  size={16}
                  className="spin"
                />

              ) : (

                <ArrowRight size={17} />

              )}

            </button>

          </div>

          {answer && (

            <div className="ai-answer">

              <div className="answer-label">

                <Sparkles size={14} />

                LOCAL AI RESPONSE

              </div>

              <p>
                {answer.answer}
              </p>

              {answer.evidence?.length > 0 && (

                <div className="evidence-list">

                  <strong>
                    Evidence considered
                  </strong>

                  {answer.evidence.map(
                    (item, index) => (

                      <div key={index}>

                        <CheckCircle2 size={14} />

                        {item}

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </PageHeader>
  );
}


// ============================================================
// VISUAL INSPECTION
// ============================================================

function VisualInspection({
  imageFile,
  setImageFile,
  inspectImage,
  visionResult,
  visionLoading,
}) {
  return (
    <PageHeader
      eyebrow="MULTIMODAL VISION"
      title="Visual Inspection"
      description="Analyze equipment imagery using the local vision engine."
    >

      <div className="vision-layout">

        <div className="panel image-upload-panel">

          <div className="panel-header">

            <div>

              <h3>
                Equipment Image
              </h3>

              <span>
                Upload an inspection photograph
              </span>

            </div>

            <ImageIcon size={20} />

          </div>

          <label className="drop-zone">

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                setImageFile(
                  e.target.files?.[0] || null
                )
              }
            />

            {imageFile ? (

              <>

                <CheckCircle2 size={31} />

                <strong>
                  {imageFile.name}
                </strong>

                <span>
                  Image ready for local inspection
                </span>

              </>

            ) : (

              <>

                <Upload size={31} />

                <strong>
                  Drop equipment image here
                </strong>

                <span>
                  or click to browse
                </span>

              </>

            )}

          </label>

          <button
            className="primary-button full-button"
            disabled={
              !imageFile ||
              visionLoading
            }
            onClick={inspectImage}
          >

            {visionLoading ? (

              <>

                <RefreshCw
                  size={17}
                  className="spin"
                />

                Analyzing Locally...

              </>

            ) : (

              <>

                <Sparkles size={17} />

                Run Visual Inspection

              </>

            )}

          </button>

        </div>


        <div className="panel vision-result-panel">

          <div className="panel-header">

            <div>

              <h3>
                Inspection Findings
              </h3>

              <span>
                Local multimodal analysis
              </span>

            </div>

            <ShieldCheck size={20} />

          </div>

          {!visionResult ? (

            <div className="empty-state">

              <ImageIcon size={32} />

              <strong>
                No inspection performed
              </strong>

              <span>
                Upload an equipment image to begin.
              </span>

            </div>

          ) : visionResult.success ? (

            <div className="vision-results">

              <div className="confidence-card">

                <div>

                  <span>
                    CONFIDENCE
                  </span>

                  <strong>
                    {visionResult.confidence}%
                  </strong>

                </div>

                <div className="risk-high">
                  {visionResult.risk}
                </div>

              </div>

              {visionResult.findings?.map(
                (finding, index) => (

                  <div
                    className="finding-row"
                    key={index}
                  >

                    <CheckCircle2 size={17} />

                    <span>
                      {finding}
                    </span>

                  </div>

                )
              )}

              <div className="local-badge">

                <Lock size={14} />

                PROCESSED LOCALLY · EXTERNAL API CALLS: 0

              </div>

            </div>

          ) : (

            <div className="offline-message">

              <AlertTriangle size={18} />

              {visionResult.message}

            </div>

          )}

        </div>

      </div>

    </PageHeader>
  );
}


// ============================================================
// AI AGENT
// ============================================================

function AgentPage({
  investigation,
  investigating,
  startInvestigation,
  generateReport,
  reportLoading,
}) {
  return (
    <PageHeader
      eyebrow="AGENT ENGINE"
      title="Agentic Investigation"
      description="A multi-step local reasoning workflow for industrial incidents."
    >

      <div className="agent-top">

        <div className="panel incident-summary">

          <div className="incident-equipment">

            <div className="equipment-icon large">
              <Activity size={28} />
            </div>

            <div>

              <span>
                EQUIPMENT
              </span>

              <h2>
                {investigation?.equipment?.id ||
                  "P-204"}
              </h2>

              <p>
                {investigation?.equipment?.name ||
                  "Process Water Pump"}
              </p>

            </div>

          </div>

          <div className="incident-risk">

            <span>
              RISK LEVEL
            </span>

            <strong>
              {investigation?.assessment?.risk ||
                "HIGH"}
            </strong>

          </div>

        </div>

        <button
          className="primary-button"
          onClick={startInvestigation}
          disabled={investigating}
        >

          {investigating ? (

            <>

              <RefreshCw
                size={17}
                className="spin"
              />

              Investigation Running

            </>

          ) : (

            <>

              <Play
                size={17}
                fill="currentColor"
              />

              Run Investigation

            </>

          )}

        </button>

      </div>


      <div className="panel agent-workflow">

        <div className="panel-header">

          <div>

            <h3>
              Investigation Workflow
            </h3>

            <span>
              Agent execution trace
            </span>

          </div>

          <Bot size={20} />

        </div>

        {!investigation ? (

          <div className="empty-agent">

            <div className="agent-orb">
              <Bot size={31} />
            </div>

            <h3>
              Ready to investigate
            </h3>

            <p>
              The agent will correlate private documents,
              telemetry and visual evidence.
            </p>

            <button
              className="secondary-button"
              onClick={startInvestigation}
            >
              Start Agent
              <ArrowRight size={16} />
            </button>

          </div>

        ) : (

          <div className="workflow-list">

            {investigation.steps?.map(
              (step, index) => (

                <div
                  className="workflow-step"
                  key={step.step}
                >

                  <div className="workflow-number">
                    {step.step}
                  </div>

                  <div className="workflow-line">

                    {index <
                      investigation.steps.length - 1 && (
                      <span />
                    )}

                  </div>

                  <div className="workflow-content">

                    <strong>
                      {step.name}
                    </strong>

                    <span
                      className={
                        step.status === "completed"
                          ? "completed"
                          : investigating
                          ? "running"
                          : "pending"
                      }
                    >

                      {step.status ===
                      "completed" ? (

                        <>
                          <CheckCircle2 size={14} />
                          Completed
                        </>

                      ) : investigating ? (

                        <>
                          <RefreshCw
                            size={14}
                            className="spin"
                          />
                          Processing...
                        </>

                      ) : (

                        <>
                          <CircleDot size={14} />
                          Pending
                        </>

                      )}

                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {investigation && (
        <>

          <div className="evidence-grid">

            <div className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Evidence Correlation
                  </h3>

                  <span>
                    Sources used by the agent
                  </span>

                </div>

                <Search size={19} />

              </div>

              <div className="evidence-cards">

                {investigation.evidence?.map(
                  (item, index) => (

                    <div
                      className="evidence-card"
                      key={index}
                    >

                      <div className="evidence-card-icon">
                        <FileText size={17} />
                      </div>

                      <div>

                        <strong>
                          {item.source}
                        </strong>

                        <p>
                          {item.finding}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            <div className="panel assessment-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    AI Assessment
                  </h3>

                  <span>
                    Correlated conclusion
                  </span>

                </div>

                <AlertTriangle size={19} />

              </div>

              <div className="assessment-risk">

                <span>
                  RISK
                </span>

                <strong>
                  {investigation.assessment?.risk}
                </strong>

              </div>

              <div className="assessment-cause">

                <span>
                  POSSIBLE CAUSE
                </span>

                <strong>
                  {investigation.assessment?.possible_cause}
                </strong>

                <div className="confidence">

                  Confidence{" "}
                  {investigation.assessment?.confidence}%

                </div>

              </div>

              <p className="agent-summary">
                {investigation.agent_summary}
              </p>

            </div>

          </div>


          <div className="panel recommendation-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Recommended Actions
                </h3>

                <span>
                  Generated from correlated evidence
                </span>

              </div>

              <Zap size={19} />

            </div>

            <div className="recommendation-list">

              {investigation.recommendation?.map(
                (item, index) => (

                  <div
                    className="recommendation-row"
                    key={index}
                  >

                    <div>
                      {index + 1}
                    </div>

                    <span>
                      {item}
                    </span>

                  </div>

                )
              )}

            </div>

            <button
              className="primary-button"
              onClick={generateReport}
              disabled={reportLoading}
            >

              {reportLoading ? (

                <>

                  <RefreshCw
                    size={17}
                    className="spin"
                  />

                  Generating...

                </>

              ) : (

                <>

                  <FileText size={17} />

                  Generate Incident Report

                </>

              )}

            </button>

          </div>

        </>
      )}

    </PageHeader>
  );
}


// ============================================================
// DATA ANALYSIS
// ============================================================

function DataAnalysis({
  sensor,
  setSensor,
  analyzeSensors,
  sensorResult,
  sensorLoading,
}) {
  const sensorCards = [
    {
      key: "vibration",
      label: "Vibration",
      unit: "mm/s",
      icon: Activity,
    },
    {
      key: "temperature",
      label: "Temperature",
      unit: "°C",
      icon: Zap,
    },
    {
      key: "pressure",
      label: "Pressure",
      unit: "bar",
      icon: Gauge,
    },
    {
      key: "rpm",
      label: "RPM",
      unit: "rpm",
      icon: RefreshCw,
    },
  ];

  return (
    <PageHeader
      eyebrow="TELEMETRY"
      title="Industrial Data Analysis"
      description="Analyze equipment sensor telemetry locally and identify abnormal conditions."
    >

      <div className="sensor-grid">

        {sensorCards.map((card) => {

          const Icon = card.icon;

          return (
            <div
              className="sensor-card"
              key={card.key}
            >

              <div className="sensor-card-top">

                <div className="sensor-icon">
                  <Icon size={18} />
                </div>

                <span>
                  {card.label}
                </span>

              </div>

              <div className="sensor-input">

                <input
                  type="number"
                  step="0.1"
                  value={sensor[card.key]}
                  onChange={(e) =>
                    setSensor({
                      ...sensor,
                      [card.key]:
                        Number(e.target.value),
                    })
                  }
                />

                <span>
                  {card.unit}
                </span>

              </div>

            </div>
          );

        })}

      </div>


      <button
        className="primary-button analyze-button"
        onClick={analyzeSensors}
        disabled={sensorLoading}
      >

        {sensorLoading ? (

          <>

            <RefreshCw
              size={17}
              className="spin"
            />

            Analyzing Telemetry...

          </>

        ) : (

          <>

            <BarChart3 size={17} />

            Analyze Sensor Data

          </>

        )}

      </button>


      {sensorResult && (

        <div className="sensor-results">

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Analysis Result
                </h3>

                <span>
                  Local anomaly detection
                </span>

              </div>

              <Activity size={20} />

            </div>

            <div className="analysis-overview">

              <div className="analysis-risk">

                <span>
                  RISK LEVEL
                </span>

                <strong>
                  {sensorResult.risk}
                </strong>

                <small>
                  Score: {sensorResult.risk_score}/100
                </small>

              </div>

              <div className="analysis-alerts">

                <span>
                  DETECTED CONDITIONS
                </span>

                {sensorResult.alerts?.length ? (

                  sensorResult.alerts.map(
                    (alert, index) => (

                      <div key={index}>

                        <AlertTriangle size={15} />

                        {alert}

                      </div>

                    )
                  )

                ) : (

                  <div>

                    <CheckCircle2 size={15} />

                    No abnormal conditions detected.

                  </div>

                )}

              </div>

            </div>

            <div className="local-badge">

              <Lock size={14} />

              LOCAL ANALYSIS · EXTERNAL API CALLS: 0

            </div>

          </div>

        </div>

      )}

    </PageHeader>
  );
}


// ============================================================
// REPORTS
// ============================================================

function Reports({
  report,
  generateReport,
  reportLoading,
}) {
  return (
    <PageHeader
      eyebrow="REPORTING"
      title="Incident Reports"
      description="Generate structured industrial investigation reports from local evidence."
    >

      {!report ? (

        <div className="panel report-empty">

          <div className="report-icon">
            <FileText size={32} />
          </div>

          <h2>
            No report generated yet
          </h2>

          <p>
            Run an investigation and generate a
            structured incident report.
          </p>

          <button
            className="primary-button"
            onClick={generateReport}
            disabled={reportLoading}
          >

            {reportLoading ? (

              <>

                <RefreshCw
                  size={17}
                  className="spin"
                />

                Generating...

              </>

            ) : (

              <>

                <FileText size={17} />

                Generate Report

              </>

            )}

          </button>

        </div>

      ) : (

        <div className="report-document">

          <div className="report-header">

            <div>

              <div className="report-kicker">
                SOVEREIGN AI
              </div>

              <h1>
                Industrial Incident
                Investigation Report
              </h1>

              <p>
                Report ID: {report.report_id}
              </p>

            </div>

            <div className="report-status">

              <CheckCircle2 size={17} />

              GENERATED LOCALLY

            </div>

          </div>


          <div className="report-section">

            <div className="report-section-title">
              EQUIPMENT
            </div>

            <div className="report-value">
              {report.equipment}
            </div>

          </div>


          <div className="report-grid">

            <div className="report-box">

              <span>
                INCIDENT
              </span>

              <strong>
                {report.incident}
              </strong>

            </div>

            <div className="report-box">

              <span>
                RISK
              </span>

              <strong className="risk-text">
                {report.risk}
              </strong>

            </div>

            <div className="report-box">

              <span>
                ASSESSMENT
              </span>

              <strong>
                {report.assessment}
              </strong>

            </div>

          </div>


          <div className="report-section">

            <div className="report-section-title">
              EVIDENCE
            </div>

            <div className="report-evidence">

              {report.evidence?.map(
                (item, index) => (

                  <div key={index}>

                    <CheckCircle2 size={15} />

                    {item}

                  </div>

                )
              )}

            </div>

          </div>


          <div className="report-section recommendation-report">

            <div className="report-section-title">
              RECOMMENDED ACTION
            </div>

            <p>
              {report.recommended_action}
            </p>

          </div>


          <div className="report-footer">

            <div>

              <ShieldCheck size={16} />

              ON-PREMISE PROCESSING

            </div>

            <div>
              EXTERNAL API CALLS: 0
            </div>

            <div>
              INTERNET REQUIRED: NO
            </div>

          </div>

        </div>

      )}

    </PageHeader>
  );
}


// ============================================================
// SHARED COMPONENTS
// ============================================================

function PageHeader({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="inner-page">

      <div className="inner-header">

        <div className="eyebrow">

          <Sparkles size={14} />

          {eyebrow}

        </div>

        <h1>
          {title}
        </h1>

        <p>
          {description}
        </p>

      </div>

      {children}

    </div>
  );
}


function StatusRow({
  label,
  value,
}) {
  return (
    <div className="status-row">

      <div>

        <span className="status-dot" />

        {label}

      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}


function Event({
  icon: Icon,
  title,
  time,
  type,
}) {
  return (
    <div className="event-row">

      <div className="event-icon">
        <Icon size={17} />
      </div>

      <div className="event-content">

        <strong>
          {title}
        </strong>

        <span>
          {time}
        </span>

      </div>

      <div className="event-type">
        {type}
      </div>

      <ChevronRight size={16} />

    </div>
  );
}


export default App;