"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Asset {
  tokenAddress: string;
  chainId: number;
  targetPercentage: number;
  isActive: boolean;
}

interface Portfolio {
  assets: Asset[];
  totalValue: string;
  lastRebalance: string;
  isActive: boolean;
}

export const PortfolioDashboard = () => {
  const { address } = useAccount();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  // Read portfolio data from contract
  const { data: portfolioData } = useScaffoldReadContract({
    contractName: "IgnisX",
    functionName: "getUserPortfolio",
    args: [address],
  });

  useEffect(() => {
    if (portfolioData) {
      setPortfolio(portfolioData as Portfolio);
      setLoading(false);
    }
  }, [portfolioData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin animate-reverse"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-600 dark:text-gray-400">Loading portfolio...</p>
      </div>
    );
  }

  if (!portfolio || !portfolio.isActive) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6">
              <span className="text-6xl">📊</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">No Portfolio Found</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            You haven&apos;t created a portfolio yet. Create one to start managing your multi-chain assets.
          </p>
          <button className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg">
            <span className="mr-2 text-xl">✨</span>
            Create Your First Portfolio
          </button>
        </div>
      </div>
    );
  }

  const totalValue = portfolio.totalValue ? (Number(portfolio.totalValue) / 1e18).toFixed(2) : "0.00";
  const lastRebalance = portfolio.lastRebalance
    ? new Date(Number(portfolio.lastRebalance) * 1000).toLocaleDateString()
    : "Never";

  return (
    <div className="space-y-8">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-blue-200 dark:border-blue-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Total Value
            </h3>
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
          </div>
          <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">${totalValue}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Portfolio value</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-purple-200 dark:border-purple-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Assets</h3>
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">{portfolio.assets.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Active positions</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-green-200 dark:border-green-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Last Rebalance
            </h3>
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{lastRebalance}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Recently synced</p>
        </div>
      </div>

      {/* Asset Allocation Chart */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Allocation</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">Target distribution</div>
        </div>

        <div className="space-y-5">
          {portfolio.assets.map((asset, index) => (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      {asset.tokenAddress.slice(0, 6)}...{asset.tokenAddress.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chain ID: {asset.chainId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                    {(asset.targetPercentage / 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Target allocation</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${asset.targetPercentage / 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span className="relative z-10 flex items-center justify-center">
              <span className="mr-2 text-xl">🔄</span>
              Rebalance Now
            </span>
          </button>
          <button className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span className="relative z-10 flex items-center justify-center">
              <span className="mr-2 text-xl">⚙️</span>
              Edit Portfolio
            </span>
          </button>
          <button className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span className="relative z-10 flex items-center justify-center">
              <span className="mr-2 text-xl">📊</span>
              View Analytics
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
