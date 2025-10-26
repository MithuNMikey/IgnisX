"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface DelegationPolicy {
  delegate: string;
  maxSlippage: number;
  maxRebalanceAmount: string;
  rebalanceThreshold: number;
  cooldownPeriod: number;
  isActive: boolean;
}

export const DelegationManager = () => {
  const { address } = useAccount();
  const [policy, setPolicy] = useState<DelegationPolicy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    maxSlippage: 50, // 0.5%
    maxRebalanceAmount: "1000", // $1000
    rebalanceThreshold: 100, // 1%
    cooldownPeriod: 3600, // 1 hour
    sessionExpiry: 7 * 24 * 3600, // 7 days
    maxOperations: 100,
  });

  // Read delegation policy from contract
  const { data: policyData } = useScaffoldReadContract({
    contractName: "IgnisX",
    functionName: "getUserDelegationPolicy",
    args: [address],
  });

  useEffect(() => {
    if (policyData) {
      setPolicy(policyData as DelegationPolicy);
    }
  }, [policyData]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEnableAutopilot = async () => {
    setIsCreating(true);
    try {
      // This would integrate with Lit Protocol Vincent
      // For now, we'll show a placeholder
      console.log("Enabling autopilot with policy:", formData);
      alert("Autopilot enabled! (This is a demo - Lit Protocol integration coming soon)");
    } catch (error) {
      console.error("Error enabling autopilot:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDisableAutopilot = async () => {
    try {
      // This would call the contract to disable autopilot
      console.log("Disabling autopilot");
      alert("Autopilot disabled! (This is a demo)");
    } catch (error) {
      console.error("Error disabling autopilot:", error);
    }
  };

  if (policy && policy.isActive) {
    return (
      <div className="space-y-8">
        {/* Current Policy Status */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-xl p-8 rounded-3xl shadow-xl border-2 border-green-500/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Autopilot Active</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your portfolio is being managed automatically
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-green-500/20 rounded-full">
              <span className="text-green-700 dark:text-green-400 font-bold uppercase tracking-wider text-sm">
                ✓ Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 dark:bg-gray-800/60 p-5 rounded-2xl shadow-md">
              <h4 className="font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="mr-2 text-xl">⚙️</span>
                Policy Settings
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Max Slippage:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(policy.maxSlippage / 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Max Rebalance:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${(Number(policy.maxRebalanceAmount) / 1e18).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(policy.rebalanceThreshold / 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400">Cooldown:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{policy.cooldownPeriod / 3600}h</span>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 p-5 rounded-2xl shadow-md">
              <h4 className="font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="mr-2 text-xl">🔗</span>
                Delegate Address
              </h4>
              <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                {policy.delegate.slice(0, 6)}...{policy.delegate.slice(-4)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleDisableAutopilot}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">🛑</span>
              Disable Autopilot
            </button>
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="mr-2">✏️</span>
              Update Policy
            </button>
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Security & Transparency</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-success">✅ What&apos;s Protected</h4>
              <ul className="text-sm space-y-1">
                <li>• Delegation is policy-limited</li>
                <li>• All actions are on-chain</li>
                <li>• Revocable at any time</li>
                <li>• No custody risk</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-warning">⚠️ What&apos;s Delegated</h4>
              <ul className="text-sm space-y-1">
                <li>• Automated rebalancing</li>
                <li>• Cross-chain swaps</li>
                <li>• Bridge operations</li>
                <li>• Within policy limits only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable Autopilot */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Enable Portfolio Autopilot</h3>
        <p className="text-base-content/70 mb-6">
          Delegate rebalancing rights to IgnisX autopilot agent using Lit Protocol Vincent. Your delegation is
          policy-limited, transparent, and revocable at any time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Max Slippage (%)</span>
              </label>
              <input
                type="number"
                value={formData.maxSlippage / 100}
                onChange={e => handleInputChange("maxSlippage", Number(e.target.value) * 100)}
                className="input input-bordered w-full"
                min="0.1"
                max="10"
                step="0.1"
              />
              <p className="text-xs text-base-content/50 mt-1">Maximum slippage allowed per transaction (0.1% - 10%)</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Max Rebalance Amount ($)</span>
              </label>
              <input
                type="number"
                value={formData.maxRebalanceAmount}
                onChange={e => handleInputChange("maxRebalanceAmount", e.target.value)}
                className="input input-bordered w-full"
                min="100"
                step="100"
              />
              <p className="text-xs text-base-content/50 mt-1">Maximum amount per rebalancing operation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Rebalance Threshold (%)</span>
              </label>
              <input
                type="number"
                value={formData.rebalanceThreshold / 100}
                onChange={e => handleInputChange("rebalanceThreshold", Number(e.target.value) * 100)}
                className="input input-bordered w-full"
                min="0.5"
                max="10"
                step="0.1"
              />
              <p className="text-xs text-base-content/50 mt-1">Trigger rebalancing when drift exceeds this threshold</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Cooldown Period (hours)</span>
              </label>
              <input
                type="number"
                value={formData.cooldownPeriod / 3600}
                onChange={e => handleInputChange("cooldownPeriod", Number(e.target.value) * 3600)}
                className="input input-bordered w-full"
                min="1"
                max="24"
                step="1"
              />
              <p className="text-xs text-base-content/50 mt-1">Minimum time between rebalancing operations</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleEnableAutopilot}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCreating ? (
              <>
                <span className="loading loading-spinner loading-lg mr-3"></span>
                Enabling Autopilot...
              </>
            ) : (
              <>
                <span className="mr-3 text-2xl">🤖</span>
                Enable Portfolio Autopilot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lit Protocol Information */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-indigo-200 dark:border-indigo-700/50">
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-3xl">🔒</span>
          Powered by Lit Protocol Vincent
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Secure Delegation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Policy-limited signing with cryptographic guarantees
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">⚡</span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Session-Based</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Time-limited sessions with automatic expiry</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔄</span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Revocable</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Revoke delegation instantly at any time</p>
          </div>
        </div>
      </div>
    </div>
  );
};
