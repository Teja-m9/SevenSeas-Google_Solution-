import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  Link as LinkIcon,
  ArrowLeft,
  Loader2,
  Bot,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FinancialAgents } from "../components/FinancialAgents";
import { useFinancialContext } from "../contexts/FinancialContext";

interface ApiResponse {
  message: string;
  job_id: string;
}

interface AgentMessage {
  name: string;
  description: string;
  summary: string;
  expected_output: string;
  raw: string;
  json_dict?: any;
  agent: string;
}

interface JobStatusResponse {
  status: string;
  result: AgentMessage[];
}

export function InvestmentPage() {
  const [userData, setUserData] = useState<string>("");
  const [userQuery, setUserQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { summaryStatement } = useFinancialContext();

  // New state for job tracking
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Update userData when summaryStatement changes
  useEffect(() => {
    if (summaryStatement) {
      setUserData(summaryStatement);
    } else if (localStorage.getItem("summary")) {
      setUserData(JSON.parse(localStorage.getItem("summary") || "") || "");
    }
  }, [summaryStatement]);

  // Polling mechanism for job status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (jobId) {
      // Initial fetch
      fetchJobStatus();
      // Set up polling
      intervalId = setInterval(fetchJobStatus, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (
      agentMessages &&
      agentMessages.length > lastMessageCount &&
      conversationRef.current
    ) {
      const scrollContainer = conversationRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      setLastMessageCount(agentMessages.length);
    }
  }, [agentMessages, lastMessageCount]);

  const fetchJobStatus = async () => {
    if (!jobId) return;
    try {
      const response = await fetch(`http://localhost:8000/api/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job status");
      }
      const data: JobStatusResponse = await response.json();
      setJobStatus(data.status);
      setAgentMessages(data.result || []); // Ensure agentMessages is never undefined

      // When processing is complete, set the final response
      if (data.status === "completed" && data.result.length > 0) {
        const lastMessage = data.result[data.result.length - 1];
        if (lastMessage.json_dict && lastMessage.json_dict.message) {
          setResponse(convertToJsonString(lastMessage.json_dict.message));
        } else if (lastMessage.raw) {
          try {
            const rawJson = JSON.parse(lastMessage.raw);
            setResponse(rawJson.message || "Processing complete");
          } catch (e) {
            setResponse(lastMessage.raw);
          }
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching job status:", err);
    }
  };

  const handleSubmit = async () => {
    if (!userData || !userQuery) {
      setError("Both user data and query are required");
      return;
    }
    setLoading(true);
    setError(null);
    setResponse(null);
    setJobId(null);
    setJobStatus("idle");
    setAgentMessages([]);
    setLastMessageCount(0);
    try {
      const response = await fetch("http://localhost:8000/api/execute/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_data: userData,
          user_query: userQuery,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to execute query");
      }
      const data: ApiResponse = await response.json();
      setJobId(data.job_id);
      setResponse(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const convertToJsonString = (data: any) => {
    let result = "";

    // Helper function to recursively process nested objects
    function processObject(obj: any, indent = "") {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && !Array.isArray(value)) {
          result += `${indent}${key}:\n`;
          processObject(value, indent + "  "); // Recursively process nested objects
        } else if (Array.isArray(value)) {
          result += `${indent}${key}: ${value.join(", ")}\n`; // Handle arrays
        } else {
          result += `${indent}${key}: ${value}\n`; // Handle primitive values
        }
      }
    }

    processObject(data);
    return result.trim(); // Trim to remove any trailing whitespace
  };

  const formatAgentMessage = (message: AgentMessage) => {
    if (message.json_dict && message.json_dict.message) {
      const msg = message.json_dict.message;
      if (typeof msg === "object") {
        // Convert JSON object to a readable string
        return convertToJsonString(msg);
      }
      return msg; // If it's already a string, return as-is
    }
    if (message.raw) {
      try {
        const rawJson = JSON.parse(message.raw);
        return rawJson.message || message.summary;
      } catch (e) {
        return message.summary;
      }
    }
    return message.summary;
  };

  const getRandomColor = (name: string) => {
    // Generate a consistent color based on agent name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = 40 + (hash % 20);
    return `hsl(${h}, 80%, 65%)`;
  };

  return (
    <div className="min-h-screen bg-navy-900 text-gray-100 relative overflow-hidden">
      <div className="particles-bg"></div>
      {/* Back to Home Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 flex items-center space-x-2 text-gray-300 hover:text-gold transition-colors z-50">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>
      {/* Main Content - Upper Section (75vh) */}
      <div className="h-[75vh] flex flex-col md:flex-row">
        {/* Left Side - Financial Agents */}
        <div className="w-full md:w-1/2 p-6 border-r border-navy-700">
          <div className="h-full bg-navy-800/50 rounded-xl p-6 backdrop-blur-sm border border-navy-700 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gold to-blue-500 bg-clip-text text-transparent">
              AI Financial Agents Network
            </h2>
            <FinancialAgents />
          </div>
        </div>
        {/* Right Side - Response Display */}
        <div className="w-full md:w-1/2 p-6">
          <div className="h-full bg-navy-800/50 rounded-xl p-6 backdrop-blur-sm border border-navy-700 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-gold bg-clip-text text-transparent">
              AI Response
            </h2>
            <div ref={conversationRef} className="h-full overflow-auto pb-4">
              {loading ? (
                jobId ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-gold font-medium mb-2">
                        {jobStatus === "processing"
                          ? "Agents are working on your request..."
                          : "Starting agents..."}
                      </div>
                      <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 text-gold animate-spin" />
                      </div>
                    </div>
                    {/* Agent conversation UI */}
                    {agentMessages && agentMessages.length > 0 ? (
                      <div className="space-y-6">
                        {agentMessages.map((msg, index) => (
                          <div
                            key={index}
                            className="message-container animate-slideUp"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                            }}>
                            <div className="flex items-start space-x-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: getRandomColor(
                                    msg.name || msg.agent
                                  ),
                                }}>
                                <Bot className="w-5 h-5 text-navy-900" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gold">
                                    {msg.name || msg.agent}
                                  </span>
                                  {msg.description && (
                                    <span className="text-xs text-gray-400">
                                      {msg.description}
                                    </span>
                                  )}
                                </div>
                                <div className="bg-navy-700/50 rounded-lg p-3 text-gray-200 border border-navy-600">
                                  {formatAgentMessage(msg)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        Initializing agents...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  </div>
                )
              ) : response ? (
                <pre className="whitespace-pre-wrap text-gray-300">
                  {response}
                </pre>
              ) : (
                <div className="text-gray-400 text-center mt-8">
                  Enter your data and query below to get started
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Lower Section (25vh) */}
      <div className="h-[25vh] grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* User Data Input */}
        <div className="relative group">
          <textarea
            value={userData || ""}
            onChange={(e) => setUserData(e.target.value)}
            placeholder="Enter your financial data..."
            className="w-full h-full bg-navy-800/50 border border-navy-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold/50 backdrop-blur-sm transition-all duration-300 resize-none"
          />
        </div>
        {/* User Query Input */}
        <div className="relative group">
          <div className="flex h-full">
            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Enter your query..."
              className="flex-1 bg-navy-800/50 border border-navy-700 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold/50 backdrop-blur-sm transition-all duration-300 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 bg-gold text-navy-900 rounded-r-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        {/* File Upload */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) =>
              e.target.files && handleFiles(Array.from(e.target.files))
            }
            multiple
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`h-full bg-navy-800/50 border-2 border-dashed rounded-lg backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
              isDragging
                ? "border-gold bg-gold/10"
                : "border-navy-700 hover:border-gold/50"
            }`}
            onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-8 h-8 text-gold mb-2" />
            <p className="text-sm text-gray-400">Upload or drag files here</p>
            {uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add global CSS for animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
