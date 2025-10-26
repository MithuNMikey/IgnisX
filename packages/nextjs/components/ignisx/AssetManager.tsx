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

export const AssetManager = () => {
  const { address } = useAccount();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({
    tokenAddress: "",
    chainId: 1,
    targetPercentage: 0,
  });

  // Read portfolio data from contract
  const { data: portfolioData } = useScaffoldReadContract({
    contractName: "IgnisX",
    functionName: "getUserPortfolio",
    args: [address],
  });

  useEffect(() => {
    if (portfolioData) {
      setPortfolio(portfolioData as Portfolio);
    }
  }, [portfolioData]);

  const handleAddAsset = async () => {
    if (!newAsset.tokenAddress || newAsset.targetPercentage <= 0) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // This would call the contract to add the asset
      console.log("Adding asset:", newAsset);
      alert("Asset added! (This is a demo)");
      setNewAsset({ tokenAddress: "", chainId: 1, targetPercentage: 0 });
      setIsAddingAsset(false);
    } catch (error) {
      console.error("Error adding asset:", error);
    }
  };

  const handleRemoveAsset = async (tokenAddress: string, chainId: number) => {
    try {
      // This would call the contract to remove the asset
      console.log("Removing asset:", tokenAddress, chainId);
      alert("Asset removed! (This is a demo)");
    } catch (error) {
      console.error("Error removing asset:", error);
    }
  };

  const handleUpdatePercentage = async (tokenAddress: string, chainId: number, newPercentage: number) => {
    try {
      // This would call the contract to update the percentage
      console.log("Updating percentage:", tokenAddress, chainId, newPercentage);
      alert("Percentage updated! (This is a demo)");
    } catch (error) {
      console.error("Error updating percentage:", error);
    }
  };

  if (!portfolio || !portfolio.isActive) {
    return (
      <div className="text-center py-12">
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">No Portfolio Found</h2>
          <p className="text-base-content/70 mb-6">You need to create a portfolio first before managing assets.</p>
          <button className="btn btn-primary">Create Portfolio</button>
        </div>
      </div>
    );
  }

  const totalPercentage = portfolio.assets.reduce((sum, asset) => sum + asset.targetPercentage, 0);
  const remainingPercentage = 10000 - totalPercentage;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Portfolio Assets</h3>
          <button onClick={() => setIsAddingAsset(true)} className="btn btn-primary btn-sm">
            <span className="mr-2">+</span>
            Add Asset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{portfolio.assets.length}</p>
            <p className="text-sm text-base-content/70">Total Assets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{(totalPercentage / 100).toFixed(1)}%</p>
            <p className="text-sm text-base-content/70">Allocated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{(remainingPercentage / 100).toFixed(1)}%</p>
            <p className="text-sm text-base-content/70">Remaining</p>
          </div>
        </div>
      </div>

      {/* Add Asset Form */}
      {isAddingAsset && (
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Add New Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Token Address</span>
              </label>
              <input
                type="text"
                value={newAsset.tokenAddress}
                onChange={e => setNewAsset(prev => ({ ...prev, tokenAddress: e.target.value }))}
                className="input input-bordered w-full"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Chain ID</span>
              </label>
              <select
                value={newAsset.chainId}
                onChange={e => setNewAsset(prev => ({ ...prev, chainId: Number(e.target.value) }))}
                className="select select-bordered w-full"
              >
                <option value={1}>Ethereum</option>
                <option value={137}>Polygon</option>
                <option value={42161}>Arbitrum</option>
                <option value={10}>Optimism</option>
                <option value={8453}>Base</option>
                <option value={56}>BSC</option>
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Target %</span>
              </label>
              <input
                type="number"
                value={newAsset.targetPercentage / 100}
                onChange={e => setNewAsset(prev => ({ ...prev, targetPercentage: Number(e.target.value) * 100 }))}
                className="input input-bordered w-full"
                min="0.1"
                max="100"
                step="0.1"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button onClick={handleAddAsset} className="btn btn-primary">
              Add Asset
            </button>
            <button onClick={() => setIsAddingAsset(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Assets List */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Current Assets</h3>
        <div className="space-y-4">
          {portfolio.assets.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-base-200 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{asset.tokenAddress.slice(2, 4).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium">
                    {asset.tokenAddress.slice(0, 6)}...{asset.tokenAddress.slice(-4)}
                  </p>
                  <p className="text-sm text-base-content/70">
                    Chain {asset.chainId} • {(asset.targetPercentage / 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={asset.targetPercentage / 100}
                  onChange={e =>
                    handleUpdatePercentage(asset.tokenAddress, asset.chainId, Number(e.target.value) * 100)
                  }
                  className="input input-sm input-bordered w-20"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <button
                  onClick={() => handleRemoveAsset(asset.tokenAddress, asset.chainId)}
                  className="btn btn-error btn-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Chains */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Supported Chains</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { id: 1, name: "Ethereum", icon: "⟠" },
            { id: 137, name: "Polygon", icon: "⬟" },
            { id: 42161, name: "Arbitrum", icon: "🔷" },
            { id: 10, name: "Optimism", icon: "🔴" },
            { id: 8453, name: "Base", icon: "🔵" },
            { id: 56, name: "BSC", icon: "🟡" },
          ].map(chain => (
            <div key={chain.id} className="text-center p-3 bg-base-200 rounded-xl">
              <div className="text-2xl mb-1">{chain.icon}</div>
              <p className="text-sm font-medium">{chain.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
