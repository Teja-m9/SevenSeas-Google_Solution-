import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import {
  ArrowUpCircle,
  BookDown as BookDollar,
  BrainCircuit,
  BarChart3,
  PieChart,
  NewspaperIcon,
  MessageSquare,
  Shield,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
} from "lucide-react";
import { ChatWindow } from "./components/ChatWindow";
import { AuthPages } from "./components/AuthPages";
import { UserMenu } from "./components/UserMenu";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { InvestmentPage } from "./pages/InvestmentPage";
import { FinancialDetailsForm } from "./components/FinancialDetailsForm";
import { FinancialProvider } from "./contexts/FinancialContext";
// import InvestmentPage from "./pages/InvestmentPage";

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFinancialFormOpen, setIsFinancialFormOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleStartInvesting = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else if (user) {
      setIsFinancialFormOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-gray-100">
      <div className="particles-bg"></div>

      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-navy-900/80 backdrop-blur-md border-b border-navy-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpCircle className="w-8 h-8 text-gold animate-pulse" />
              <span className="text-xl font-bold">FinanceAI</span>
            </div>

            <nav className="hidden md:flex space-x-6">
              {[
                "Home",
                "Learn",
                "Invest",
                "Portfolio",
                "Sentiment",
                "Support",
              ].map((item) => (
                <a key={item} href="#" className="nav-link">
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {!loading &&
                (user ? (
                  <>
                    {" "}
                    <button
                      onClick={handleStartInvesting}
                      className="glow px-8 py-3 bg-gold text-navy-900 font-bold rounded-lg hover:bg-gold/90 transition-colors"
                    >
                      Upload Data
                    </button>{" "}
                    <UserMenu />
                  </>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="hidden md:block px-6 py-2 bg-gold text-navy-900 font-bold rounded-lg hover:bg-gold/90 transition-colors"
                  >
                    Sign In
                  </button>
                ))}
              <button
                className="md:hidden text-gray-300 hover:text-gold"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-navy-800 border-b border-navy-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {[
                  "Home",
                  "Learn",
                  "Invest",
                  "Portfolio",
                  "Sentiment",
                  "Support",
                ].map((item) => (
                  <a key={item} href="#" className="nav-link">
                    {item}
                  </a>
                ))}
                {!loading && !user && (
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="px-6 py-2 bg-gold text-navy-900 font-bold rounded-lg hover:bg-gold/90 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gold to-blue-500 bg-clip-text text-transparent animate-gradient">
              Your AI-Powered Financial Assistant for Smarter Investments
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Get personalized advice, explore products, and grow your wealth
              effortlessly
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <button
                  onClick={() => navigate("/invest")}
                  className="glow px-8 py-3 bg-gold text-navy-900 font-bold rounded-lg hover:bg-gold/90 transition-colors"
                >
                  Start Investing Now
                </button>
              ) : (
                <></>
              )}
              <button className="px-8 py-3 border border-gray-500 rounded-lg hover:border-gold transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-navy-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="feature-icon" />,
                title: "User Interaction Bot",
              },
              {
                icon: <BookDollar className="feature-icon" />,
                title: "Financial Literacy Bot",
              },
              {
                icon: <BarChart3 className="feature-icon" />,
                title: "Product Recommendation Bot",
              },
              {
                icon: <Shield className="feature-icon" />,
                title: "Risk Assessment Bot",
              },
              {
                icon: <PieChart className="feature-icon" />,
                title: "Portfolio Management Bot",
              },
              {
                icon: <NewspaperIcon className="feature-icon" />,
                title: "Sentiment Analysis Bot",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                {feature.icon}
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">
                  Advanced AI-powered analysis and recommendations tailored to
                  your financial goals.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="w-12 h-12 text-gold" />,
                title: "Ask Your Question",
              },
              {
                icon: <BrainCircuit className="w-12 h-12 text-gold" />,
                title: "Get Personalized Advice",
              },
              {
                icon: <BarChart3 className="w-12 h-12 text-gold" />,
                title: "Invest Confidently",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">
                  Experience the power of AI-driven financial guidance.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <div className="fixed bottom-8 right-8 glow">
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-gold text-navy-900 p-4 rounded-full shadow-lg hover:bg-gold/90 transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Chat Window */}
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Auth Pages */}
      {isAuthOpen && <AuthPages onClose={() => setIsAuthOpen(false)} />}

      {/* Financial Details Form */}
      {isFinancialFormOpen && (
        <FinancialDetailsForm
          onClose={() => {
            setIsFinancialFormOpen(false);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-navy-800/50 border-t border-navy-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FinanceAI</h3>
              <p className="text-gray-400">
                Your trusted AI financial assistant
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-gold">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gold">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gold">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gold">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gold">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gold">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-navy-900 border border-navy-700 rounded-l-lg px-4 py-2 focus:outline-none focus:border-gold"
                />
                <button className="bg-gold text-navy-900 px-4 py-2 rounded-r-lg hover:bg-gold/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FinancialProvider>
        <Router>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Investment Page */}
            <Route path="/invest" element={<InvestmentPage />} />
          </Routes>
        </Router>
      </FinancialProvider>
    </AuthProvider>
  );
}

export default App;
