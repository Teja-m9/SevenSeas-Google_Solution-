import React, { createContext, useState, useContext } from "react";

interface FinancialContextType {
  summaryStatement: string | null;
  setSummaryStatement: (statement: string) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(
  undefined
);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [summaryStatement, setSummaryStatement] = useState<string | null>(null);

  return (
    <FinancialContext.Provider
      value={{ summaryStatement, setSummaryStatement }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancialContext() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error(
      "useFinancialContext must be used within a FinancialProvider"
    );
  }
  return context;
}
