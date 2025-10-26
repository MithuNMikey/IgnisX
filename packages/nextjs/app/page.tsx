"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount, useBalance } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { PortfolioDashboard } from "~~/components/ignisx/PortfolioDashboard";
import { DelegationManager } from "~~/components/ignisx/DelegationManager";
import { RebalancingHistory } from "~~/components/ignisx/RebalancingHistory";
import { AssetManager } from "~~/components/ignisx/AssetManager";

const IgnisXHome: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Portfolio", icon: "📊" },
    { id: "assets", label: "Assets", icon: "💰" },
    { id: "delegation", label: "Autopilot", icon: "🤖" },
    { id: "history", label: "History", icon: "📈" },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-3xl w-full">
            {/* Animated Logo/Brand */}
            <div className="mb-8 animate-pulse">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-6">
                <span className="text-4xl">⚡</span>
              </div>
            </div>
            
            <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IgnisX
            </h1>
            <p className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-12">
              Trustless On-Chain Multi-Chain Portfolio Autopilot
            </p>

            {/* Hero Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Connect Your Wallet</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Connect your wallet to start managing your multi-chain portfolio with IgnisX.
              </p>
              
              {/* Feature List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Multi-Chain</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage assets across multiple blockchains</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Auto Rebalancing</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lit Protocol powered automation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30">
                  <span className="text-2xl">🌉</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cross-Chain</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Seamless bridges via Avail Nexus</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Trustless</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full transparency & revocable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IgnisX
                </h1>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Portfolio Autopilot</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Connected</p>
                <Address address={connectedAddress} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 rounded-t-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === "dashboard" && <PortfolioDashboard />}
        {activeTab === "assets" && <AssetManager />}
        {activeTab === "delegation" && <DelegationManager />}
        {activeTab === "history" && <RebalancingHistory />}
      </div>
    </div>
  );
};

export default IgnisXHome;