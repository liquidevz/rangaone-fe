"use client";

import { useEffect, useState } from "react";
import { portfolioService } from "@/services/portfolio.service";
import { authService } from "@/services/auth.service";

export function TestPortfolio({ portfolioId }: { portfolioId: string }) {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Check auth token
      const token = authService.getAccessToken();
      results.push({
        test: "Auth Token",
        status: token ? "✅ PASS" : "❌ FAIL",
        details: token ? "Token exists" : "No token found"
      });

      // Test 2: Debug portfolio access
      results.push({
        test: "Portfolio API Debug",
        status: "🔍 RUNNING",
        details: "Check console for detailed logs"
      });
      await portfolioService.debugPortfolioAccess();

      // Test 3: Try to fetch specific portfolio
      try {
        const portfolio = await portfolioService.getById(portfolioId);
        results.push({
          test: "Fetch Portfolio",
          status: "✅ PASS",
          details: `Portfolio loaded: ${portfolio.name}, Holdings: ${portfolio.holdings?.length || 0}`
        });
        
        if (portfolio.holdings && portfolio.holdings.length > 0) {
          results.push({
            test: "Holdings Data",
            status: "✅ PASS",
            details: JSON.stringify(portfolio.holdings, null, 2)
          });
        } else {
          results.push({
            test: "Holdings Data",
            status: "⚠️ WARN",
            details: "No holdings found in portfolio"
          });
        }
      } catch (error) {
        results.push({
          test: "Fetch Portfolio",
          status: "❌ FAIL",
          details: `Error: ${error}`
        });
      }

      // Test 4: Try public endpoint
      try {
        const publicPortfolios = await portfolioService.getPublic();
        results.push({
          test: "Public Portfolios",
          status: "✅ PASS",
          details: `Found ${publicPortfolios.length} public portfolios`
        });
      } catch (error) {
        results.push({
          test: "Public Portfolios",
          status: "❌ FAIL",
          details: `Error: ${error}`
        });
      }

    } catch (error) {
      results.push({
        test: "General Error",
        status: "❌ FAIL",
        details: `Error: ${error}`
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, [portfolioId]);

  return (
    <div className="p-6 bg-gray-100 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Portfolio Loading Diagnostics</h3>
      <button 
        onClick={runTests} 
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Running Tests..." : "Run Tests"}
      </button>
      
      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div key={index} className="p-3 bg-white rounded border">
            <div className="font-medium">{result.status} {result.test}</div>
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{result.details}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 