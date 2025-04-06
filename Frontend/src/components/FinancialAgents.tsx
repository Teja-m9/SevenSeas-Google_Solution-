import React, { useEffect, useRef } from 'react';
import { Circle, BrainCircuit, DollarSign, TrendingUp, Target, Shield, BarChart as ChartBar, Workflow, Coins, Building, Scale, LineChart, Landmark } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
}

const agents: Agent[] = [
  { id: 'data_collection', name: 'Data Collection', icon: <Circle className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'data_analyst', name: 'Data Analysis', icon: <BrainCircuit className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'debt_management', name: 'Debt Management', icon: <DollarSign className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'budget_optimization', name: 'Budget Optimization', icon: <TrendingUp className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'goal_planning', name: 'Goal Planning', icon: <Target className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'risk_advisor', name: 'Risk Advisor', icon: <Shield className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'trading_strategy', name: 'Trading Strategy', icon: <ChartBar className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'execution', name: 'Execution', icon: <Workflow className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'crypto', name: 'Crypto Investment', icon: <Coins className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'real_estate', name: 'Real Estate', icon: <Building className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'gold', name: 'Gold Investment', icon: <Scale className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'mutual_funds', name: 'Mutual Funds', icon: <LineChart className="w-6 h-6" />, position: { x: 0, y: 0 } },
  { id: 'fixed_income', name: 'Fixed Income', icon: <Landmark className="w-6 h-6" />, position: { x: 0, y: 0 } },
];

export function FinancialAgents() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<Agent[]>(agents.map(agent => ({
    ...agent,
    position: {
      x: Math.random() * window.innerWidth * 0.4,
      y: Math.random() * window.innerHeight * 0.6,
    }
  })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
      agentsRef.current.forEach((agent, i) => {
        agentsRef.current.forEach((otherAgent, j) => {
          if (i !== j) {
            ctx.moveTo(agent.position.x, agent.position.y);
            ctx.lineTo(otherAgent.position.x, otherAgent.position.y);
          }
        });
      });
      ctx.stroke();

      // Update positions
      agentsRef.current = agentsRef.current.map(agent => ({
        ...agent,
        position: {
          x: agent.position.x + (Math.random() - 0.5) * 2,
          y: agent.position.y + (Math.random() - 0.5) * 2,
        }
      }));

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {agentsRef.current.map((agent) => (
        <div
          key={agent.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-navy-800 border border-navy-700 rounded-lg p-2 shadow-lg hover:scale-110 transition-transform cursor-pointer group"
          style={{
            left: agent.position.x,
            top: agent.position.y,
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="text-gold group-hover:text-blue-500 transition-colors">
              {agent.icon}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-gold transition-colors">
              {agent.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}