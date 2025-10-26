import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys IgnisX contracts
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployIgnisX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying IgnisX contracts...");

  // Deploy PortfolioManager
  const portfolioManager = await deploy("PortfolioManager", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy CrossChainRebalancer
  const rebalancer = await deploy("CrossChainRebalancer", {
    from: deployer,
    args: [portfolioManager.address],
    log: true,
    autoMine: true,
  });

  // Deploy LitProtocolDelegate
  const litDelegate = await deploy("LitProtocolDelegate", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy main IgnisX contract
  const ignisX = await deploy("IgnisX", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ IgnisX contracts deployed successfully!");
  console.log("📊 PortfolioManager:", portfolioManager.address);
  console.log("🔄 CrossChainRebalancer:", rebalancer.address);
  console.log("🔐 LitProtocolDelegate:", litDelegate.address);
  console.log("🎯 IgnisX:", ignisX.address);

  // Get the deployed contracts to verify deployment
  const ignisXContract = await hre.ethers.getContract<Contract>("IgnisX", deployer);
  const portfolioManagerContract = await hre.ethers.getContract<Contract>("PortfolioManager", deployer);
  const rebalancerContract = await hre.ethers.getContract<Contract>("CrossChainRebalancer", deployer);
  const litDelegateContract = await hre.ethers.getContract<Contract>("LitProtocolDelegate", deployer);

  console.log("🔍 Verifying contract addresses...");
  console.log("IgnisX PortfolioManager:", await ignisXContract.portfolioManager());
  console.log("IgnisX Rebalancer:", await ignisXContract.rebalancer());
  console.log("IgnisX LitDelegate:", await ignisXContract.litDelegate());
};

export default deployIgnisX;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags IgnisX
deployIgnisX.tags = ["IgnisX"];
