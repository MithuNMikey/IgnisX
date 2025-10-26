import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("IgnisX Smart Contracts", function () {
  let portfolioManager: Contract;
  let rebalancer: Contract;
  let litDelegate: Contract;
  let ignisX: Contract;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let autopilotAgent: Signer;

  beforeEach(async function () {
    [owner, user1, user2, autopilotAgent] = await ethers.getSigners();

    // Deploy PortfolioManager
    const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
    portfolioManager = await PortfolioManager.deploy();
    await portfolioManager.waitForDeployment();

    // Deploy CrossChainRebalancer
    const CrossChainRebalancer = await ethers.getContractFactory("CrossChainRebalancer");
    rebalancer = await CrossChainRebalancer.deploy(await portfolioManager.getAddress());
    await rebalancer.waitForDeployment();

    // Deploy LitProtocolDelegate
    const LitProtocolDelegate = await ethers.getContractFactory("LitProtocolDelegate");
    litDelegate = await LitProtocolDelegate.deploy();
    await litDelegate.waitForDeployment();

    // Deploy IgnisX
    const IgnisX = await ethers.getContractFactory("IgnisX");
    ignisX = await IgnisX.deploy();
    await ignisX.waitForDeployment();
  });

  describe("PortfolioManager", function () {
    it("Should create a portfolio successfully", async function () {
      const user1Address = await user1.getAddress();
      const assets = [
        {
          tokenAddress: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          chainId: 1,
          targetPercentage: 5000, // 50%
          isActive: true
        },
        {
          tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          chainId: 1,
          targetPercentage: 5000, // 50%
          isActive: true
        }
      ];

      await portfolioManager.connect(user1).createPortfolio(user1Address, assets);

      const portfolio = await portfolioManager.getPortfolio(user1Address);
      expect(portfolio.isActive).to.be.true;
      expect(portfolio.assets.length).to.equal(2);
      expect(portfolio.assets[0].targetPercentage).to.equal(5000);
      expect(portfolio.assets[1].targetPercentage).to.equal(5000);
    });

    it("Should reject portfolio with invalid percentages", async function () {
      const user1Address = await user1.getAddress();
      const assets = [
        {
          tokenAddress: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          chainId: 1,
          targetPercentage: 5000, // 50%
          isActive: true
        },
        {
          tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          chainId: 1,
          targetPercentage: 6000, // 60% - total exceeds 100%
          isActive: true
        }
      ];

      await expect(
        portfolioManager.connect(user1).createPortfolio(user1Address, assets)
      ).to.be.revertedWith("Total percentage must equal 100%");
    });

    it("Should set delegation policy successfully", async function () {
      const user1Address = await user1.getAddress();
      const autopilotAddress = await autopilotAgent.getAddress();

      // First create a portfolio
      const assets = [
        {
          tokenAddress: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          chainId: 1,
          targetPercentage: 10000, // 100%
          isActive: true
        }
      ];
      await portfolioManager.connect(user1).createPortfolio(user1Address, assets);

      // Set delegation policy
      await portfolioManager.connect(user1).setDelegationPolicy(
        user1Address,
        autopilotAddress,
        50, // 0.5% max slippage
        ethers.parseEther("1000"), // $1000 max rebalance
        100, // 1% rebalance threshold
        3600 // 1 hour cooldown
      );

      const policy = await portfolioManager.getDelegationPolicy(user1Address);
      expect(policy.delegate).to.equal(autopilotAddress);
      expect(policy.maxSlippage).to.equal(50);
      expect(policy.isActive).to.be.true;
    });

    it("Should revoke delegation successfully", async function () {
      const user1Address = await user1.getAddress();
      const autopilotAddress = await autopilotAgent.getAddress();

      // Create portfolio and set delegation
      const assets = [
        {
          tokenAddress: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          chainId: 1,
          targetPercentage: 10000,
          isActive: true
        }
      ];
      await portfolioManager.connect(user1).createPortfolio(user1Address, assets);
      await portfolioManager.connect(user1).setDelegationPolicy(
        user1Address,
        autopilotAddress,
        50,
        ethers.parseEther("1000"),
        100,
        3600
      );

      // Revoke delegation
      await portfolioManager.connect(user1).revokeDelegation(user1Address);

      const policy = await portfolioManager.getDelegationPolicy(user1Address);
      expect(policy.isActive).to.be.false;
    });

    it("Should check rebalancing needs correctly", async function () {
      const user1Address = await user1.getAddress();
      const autopilotAddress = await autopilotAgent.getAddress();

      // Create portfolio
      const assets = [
        {
          tokenAddress: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          chainId: 1,
          targetPercentage: 5000, // 50%
          isActive: true
        },
        {
          tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          chainId: 1,
          targetPercentage: 5000, // 50%
          isActive: true
        }
      ];
      await portfolioManager.connect(user1).createPortfolio(user1Address, assets);

      // Set delegation policy
      await portfolioManager.connect(user1).setDelegationPolicy(
        user1Address,
        autopilotAddress,
        50,
        ethers.parseEther("1000"),
        100, // 1% threshold
        3600
      );

      // Test with current allocations that exceed threshold
      const currentAllocations = [6000, 4000]; // 60% and 40% - drift of 10%
      const needsRebalancing = await portfolioManager.needsRebalancing(user1Address, currentAllocations);
      expect(needsRebalancing).to.be.true;

      // Test with current allocations within threshold
      const currentAllocations2 = [5100, 4900]; // 51% and 49% - drift of 1%
      const needsRebalancing2 = await portfolioManager.needsRebalancing(user1Address, currentAllocations2);
      expect(needsRebalancing2).to.be.false;
    });
  });

  describe("CrossChainRebalancer", function () {
    beforeEach(async function () {
      // Authorize autopilot agent
      await rebalancer.connect(owner).setAuthorizedAgent(await autopilotAgent.getAddress(), true);
    });

    it("Should create rebalancing action successfully", async function () {
      const user1Address = await user1.getAddress();
      const swaps = [
        {
          tokenIn: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          tokenOut: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          amountIn: ethers.parseEther("100"),
          minAmountOut: ethers.parseEther("99"),
          chainId: 1,
          routeId: ethers.keccak256(ethers.toUtf8Bytes("route1"))
        }
      ];
      const bridges: any[] = [];
      const totalValue = ethers.parseEther("1000");

      const tx = await rebalancer.connect(autopilotAgent).createRebalanceAction(
        user1Address,
        swaps,
        bridges,
        totalValue
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = rebalancer.interface.parseLog(log);
          return parsed.name === "RebalanceActionCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should execute swap successfully", async function () {
      const user1Address = await user1.getAddress();
      const swaps = [
        {
          tokenIn: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          tokenOut: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          amountIn: ethers.parseEther("100"),
          minAmountOut: ethers.parseEther("99"),
          chainId: 1,
          routeId: ethers.keccak256(ethers.toUtf8Bytes("route1"))
        }
      ];
      const bridges: any[] = [];
      const totalValue = ethers.parseEther("1000");

      // Create rebalancing action
      const tx1 = await rebalancer.connect(autopilotAgent).createRebalanceAction(
        user1Address,
        swaps,
        bridges,
        totalValue
      );
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(log => {
        try {
          const parsed = rebalancer.interface.parseLog(log);
          return parsed.name === "RebalanceActionCreated";
        } catch {
          return false;
        }
      });
      const actionId = event1.args.actionId;

      // Execute swap
      const actualAmountOut = ethers.parseEther("99.5");
      const tx2 = await rebalancer.connect(autopilotAgent).executeSwap(
        actionId,
        0,
        actualAmountOut
      );

      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(log => {
        try {
          const parsed = rebalancer.interface.parseLog(log);
          return parsed.name === "SwapExecuted";
        } catch {
          return false;
        }
      });

      expect(event2).to.not.be.undefined;
      expect(event2.args.amountOut).to.equal(actualAmountOut);
    });

    it("Should reject unauthorized agent", async function () {
      const user1Address = await user1.getAddress();
      const swaps = [
        {
          tokenIn: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          tokenOut: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          amountIn: ethers.parseEther("100"),
          minAmountOut: ethers.parseEther("99"),
          chainId: 1,
          routeId: ethers.keccak256(ethers.toUtf8Bytes("route1"))
        }
      ];
      const bridges: any[] = [];
      const totalValue = ethers.parseEther("1000");

      await expect(
        rebalancer.connect(user1).createRebalanceAction(
          user1Address,
          swaps,
          bridges,
          totalValue
        )
      ).to.be.revertedWith("Not authorized agent");
    });
  });

  describe("LitProtocolDelegate", function () {
    it("Should create delegation session successfully", async function () {
      const user1Address = await user1.getAddress();
      const autopilotAddress = await autopilotAgent.getAddress();
      const expiry = Math.floor(Date.now() / 1000) + 86400; // 24 hours
      const policyHash = ethers.keccak256(ethers.toUtf8Bytes("policy123"));
      const maxOperations = 100;

      const tx = await litDelegate.connect(user1).createDelegationSession(
        user1Address,
        autopilotAddress,
        expiry,
        policyHash,
        maxOperations
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = litDelegate.interface.parseLog(log);
          return parsed.name === "DelegationSessionCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      expect(event.args.user).to.equal(user1Address);
      expect(event.args.delegate).to.equal(autopilotAddress);
    });

    it("Should revoke delegation session successfully", async function () {
      const user1Address = await user1.getAddress();
      const autopilotAddress = await autopilotAgent.getAddress();
      const expiry = Math.floor(Date.now() / 1000) + 86400;
      const policyHash = ethers.keccak256(ethers.toUtf8Bytes("policy123"));
      const maxOperations = 100;

      // Create session
      const tx1 = await litDelegate.connect(user1).createDelegationSession(
        user1Address,
        autopilotAddress,
        expiry,
        policyHash,
        maxOperations
      );
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(log => {
        try {
          const parsed = litDelegate.interface.parseLog(log);
          return parsed.name === "DelegationSessionCreated";
        } catch {
          return false;
        }
      });
      const sessionId = event1.args.sessionId;

      // Revoke session
      const tx2 = await litDelegate.connect(user1).revokeDelegationSession(sessionId);
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(log => {
        try {
          const parsed = litDelegate.interface.parseLog(log);
          return parsed.name === "DelegationSessionRevoked";
        } catch {
          return false;
        }
      });

      expect(event2).to.not.be.undefined;
      expect(event2.args.sessionId).to.equal(sessionId);

      // Check session is no longer valid
      const isValid = await litDelegate.isSessionValid(sessionId);
      expect(isValid).to.be.false;
    });

    it("Should verify signed operation successfully", async function () {
      const user1Address = await user1.getAddress();
      const autopilotAddress = await autopilotAgent.getAddress();
      const expiry = Math.floor(Date.now() / 1000) + 86400;
      const policyHash = ethers.keccak256(ethers.toUtf8Bytes("policy123"));
      const maxOperations = 100;

      // Create session
      const tx1 = await litDelegate.connect(user1).createDelegationSession(
        user1Address,
        autopilotAddress,
        expiry,
        policyHash,
        maxOperations
      );
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(log => {
        try {
          const parsed = litDelegate.interface.parseLog(log);
          return parsed.name === "DelegationSessionCreated";
        } catch {
          return false;
        }
      });
      const sessionId = event1.args.sessionId;

      // Create mock signed operation
      const operation = {
        user: user1Address,
        delegate: autopilotAddress,
        nonce: 0,
        operationType: 1, // Swap
        data: ethers.toUtf8Bytes("swap_data"),
        timestamp: Math.floor(Date.now() / 1000),
        signature: ethers.keccak256(ethers.toUtf8Bytes("signature"))
      };

      // Verify operation
      const tx2 = await litDelegate.connect(autopilotAgent).verifySignedOperation(sessionId, operation);
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(log => {
        try {
          const parsed = litDelegate.interface.parseLog(log);
          return parsed.name === "SignatureVerified";
        } catch {
          return false;
        }
      });

      expect(event2).to.not.be.undefined;
    });
  });

  describe("IgnisX Integration", function () {
    it("Should enable autopilot successfully", async function () {
      const user1Address = await user1.getAddress();
      const maxSlippage = 50; // 0.5%
      const maxRebalanceAmount = ethers.parseEther("1000");
      const rebalanceThreshold = 100; // 1%
      const cooldownPeriod = 3600; // 1 hour
      const sessionExpiry = Math.floor(Date.now() / 1000) + 86400; // 24 hours
      const maxOperations = 100;

      const tx = await ignisX.connect(user1).enableAutopilot(
        user1Address,
        maxSlippage,
        maxRebalanceAmount,
        rebalanceThreshold,
        cooldownPeriod,
        sessionExpiry,
        maxOperations
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = ignisX.interface.parseLog(log);
          return parsed.name === "AutopilotEnabled";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      expect(event.args.user).to.equal(user1Address);
    });

    it("Should disable autopilot successfully", async function () {
      const user1Address = await user1.getAddress();

      // First enable autopilot
      await ignisX.connect(user1).enableAutopilot(
        user1Address,
        50,
        ethers.parseEther("1000"),
        100,
        3600,
        Math.floor(Date.now() / 1000) + 86400,
        100
      );

      // Then disable it
      const tx = await ignisX.connect(user1).disableAutopilot(user1Address);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = ignisX.interface.parseLog(log);
          return parsed.name === "AutopilotDisabled";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      expect(event.args.user).to.equal(user1Address);
    });

    it("Should update token price successfully", async function () {
      const chainId = 1;
      const tokenAddress = "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C";
      const price = ethers.parseEther("1.0"); // $1.00

      const tx = await ignisX.connect(owner).updateTokenPrice(chainId, tokenAddress, price);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = ignisX.interface.parseLog(log);
          return parsed.name === "TokenPriceUpdated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      expect(event.args.price).to.equal(price);
    });
  });
});
