export const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DeFi Lending Protocol
 * @dev Advanced DeFi contract with lending, borrowing, and governance
 */

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
}

library FixedPointMath {
    uint256 constant PRECISION = 1e18;
    
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        uint256 prod0;
        uint256 prod1;
        assembly {
            let mm := mulmod(x, y, not(0))
            prod0 := mul(x, y)
            prod1 := sub(sub(mm, prod0), lt(mm, prod0))
        }
        
        require(denominator > prod1, "Math: overflow");
        
        if (prod1 == 0) {
            assembly {
                result := div(prod0, denominator)
            }
            return result;
        }
        
        assembly {
            result := div(
                add(prod0, div(mul(prod1, not(0)), denominator)),
                denominator
            )
        }
    }
}

contract LendingProtocol is AccessControl, ReentrancyGuard, Pausable {
    using FixedPointMath for uint256;
    
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    struct Market {
        address token;
        uint256 totalSupply;
        uint256 totalBorrow;
        uint256 borrowRate;
        uint256 supplyRate;
        uint256 collateralFactor;
        uint256 reserveFactor;
        uint256 lastAccrualBlock;
        bool isActive;
    }
    
    struct UserPosition {
        uint256 supplied;
        uint256 borrowed;
        uint256 interestIndex;
        uint256 lastUpdateBlock;
    }
    
    // State variables
    mapping(address => Market) public markets;
    mapping(address => mapping(address => UserPosition)) public positions;
    mapping(address => address[]) public userMarkets;
    
    IPriceOracle public priceOracle;
    uint256 public constant CLOSE_FACTOR = 0.5e18;
    uint256 public constant LIQUIDATION_INCENTIVE = 1.08e18;
    uint256 public constant UTILIZATION_OPTIMAL = 0.8e18;
    
    // Events
    event MarketCreated(address indexed token, uint256 collateralFactor);
    event Supplied(address indexed user, address indexed token, uint256 amount);
    event Borrowed(address indexed user, address indexed token, uint256 amount);
    event Repaid(address indexed user, address indexed token, uint256 amount);
    event Liquidated(
        address indexed liquidator,
        address indexed borrower,
        address indexed collateralToken,
        uint256 amount
    );
    event RatesUpdated(address indexed token, uint256 borrowRate, uint256 supplyRate);
    
    // Modifiers
    modifier marketExists(address token) {
        require(markets[token].isActive, "Market does not exist");
        _;
    }
    
    modifier onlyGovernance() {
        require(hasRole(GOVERNANCE_ROLE, msg.sender), "Not authorized");
        _;
    }
    
    constructor(address _priceOracle) {
        priceOracle = IPriceOracle(_priceOracle);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new lending market
     */
    function createMarket(
        address token,
        uint256 collateralFactor
    ) external onlyGovernance {
        require(!markets[token].isActive, "Market already exists");
        require(collateralFactor <= 0.9e18, "Collateral factor too high");
        
        markets[token] = Market({
            token: token,
            totalSupply: 0,
            totalBorrow: 0,
            borrowRate: 0,
            supplyRate: 0,
            collateralFactor: collateralFactor,
            reserveFactor: 0.1e18,
            lastAccrualBlock: block.number,
            isActive: true
        });
        
        emit MarketCreated(token, collateralFactor);
    }
    
    /**
     * @dev Supply tokens to the market
     */
    function supply(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused marketExists(token) {
        require(amount > 0, "Amount must be positive");
        
        _accrueInterest(token);
        
        Market storage market = markets[token];
        UserPosition storage position = positions[token][msg.sender];
        
        // Transfer tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Update position
        if (position.supplied == 0) {
            userMarkets[msg.sender].push(token);
        }
        
        position.supplied += amount;
        market.totalSupply += amount;
        position.lastUpdateBlock = block.number;
        
        _updateRates(token);
        
        emit Supplied(msg.sender, token, amount);
    }
    
    /**
     * @dev Borrow tokens from the market
     */
    function borrow(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused marketExists(token) {
        require(amount > 0, "Amount must be positive");
        
        _accrueInterest(token);
        
        Market storage market = markets[token];
        UserPosition storage position = positions[token][msg.sender];
        
        // Check liquidity
        require(
            _getAccountLiquidity(msg.sender) >= _getTokenValue(token, amount),
            "Insufficient collateral"
        );
        
        require(
            market.totalSupply >= market.totalBorrow + amount,
            "Insufficient liquidity"
        );
        
        // Update position
        position.borrowed += amount;
        market.totalBorrow += amount;
        position.lastUpdateBlock = block.number;
        
        // Transfer tokens
        IERC20(token).transfer(msg.sender, amount);
        
        _updateRates(token);
        
        emit Borrowed(msg.sender, token, amount);
    }
    
    /**
     * @dev Repay borrowed tokens
     */
    function repay(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused marketExists(token) {
        _accrueInterest(token);
        
        Market storage market = markets[token];
        UserPosition storage position = positions[token][msg.sender];
        
        uint256 repayAmount = amount > position.borrowed ? position.borrowed : amount;
        require(repayAmount > 0, "Nothing to repay");
        
        // Transfer tokens
        IERC20(token).transferFrom(msg.sender, address(this), repayAmount);
        
        // Update position
        position.borrowed -= repayAmount;
        market.totalBorrow -= repayAmount;
        position.lastUpdateBlock = block.number;
        
        _updateRates(token);
        
        emit Repaid(msg.sender, token, repayAmount);
    }
    
    /**
     * @dev Liquidate an undercollateralized position
     */
    function liquidate(
        address borrower,
        address borrowToken,
        address collateralToken,
        uint256 repayAmount
    ) external nonReentrant whenNotPaused {
        require(_getAccountLiquidity(borrower) < 0, "Position is healthy");
        
        _accrueInterest(borrowToken);
        _accrueInterest(collateralToken);
        
        UserPosition storage borrowPosition = positions[borrowToken][borrower];
        UserPosition storage collateralPosition = positions[collateralToken][borrower];
        
        // Calculate amounts
        uint256 maxClose = borrowPosition.borrowed.mulDiv(CLOSE_FACTOR, 1e18);
        require(repayAmount <= maxClose, "Repay too much");
        
        uint256 borrowValue = _getTokenValue(borrowToken, repayAmount);
        uint256 collateralValue = borrowValue.mulDiv(LIQUIDATION_INCENTIVE, 1e18);
        uint256 collateralAmount = collateralValue.mulDiv(
            1e18,
            priceOracle.getPrice(collateralToken)
        );
        
        require(
            collateralPosition.supplied >= collateralAmount,
            "Insufficient collateral"
        );
        
        // Transfer repayment
        IERC20(borrowToken).transferFrom(msg.sender, address(this), repayAmount);
        
        // Update positions
        borrowPosition.borrowed -= repayAmount;
        markets[borrowToken].totalBorrow -= repayAmount;
        
        collateralPosition.supplied -= collateralAmount;
        markets[collateralToken].totalSupply -= collateralAmount;
        
        // Transfer collateral to liquidator
        IERC20(collateralToken).transfer(msg.sender, collateralAmount);
        
        emit Liquidated(msg.sender, borrower, collateralToken, collateralAmount);
    }
    
    /**
     * @dev Accrue interest for a market
     */
    function _accrueInterest(address token) internal {
        Market storage market = markets[token];
        
        uint256 blockDelta = block.number - market.lastAccrualBlock;
        if (blockDelta == 0) return;
        
        uint256 borrowAccrued = market.totalBorrow.mulDiv(
            market.borrowRate * blockDelta,
            1e18
        );
        
        market.totalBorrow += borrowAccrued;
        market.lastAccrualBlock = block.number;
    }
    
    /**
     * @dev Update interest rates based on utilization
     */
    function _updateRates(address token) internal {
        Market storage market = markets[token];
        
        if (market.totalSupply == 0) {
            market.borrowRate = 0;
            market.supplyRate = 0;
            return;
        }
        
        uint256 utilization = market.totalBorrow.mulDiv(1e18, market.totalSupply);
        
        // Interest rate model
        uint256 borrowRate;
        if (utilization <= UTILIZATION_OPTIMAL) {
            borrowRate = utilization.mulDiv(0.05e18, UTILIZATION_OPTIMAL);
        } else {
            uint256 excess = utilization - UTILIZATION_OPTIMAL;
            uint256 excessRate = excess.mulDiv(0.60e18, 1e18 - UTILIZATION_OPTIMAL);
            borrowRate = 0.05e18 + excessRate;
        }
        
        uint256 supplyRate = borrowRate
            .mulDiv(utilization, 1e18)
            .mulDiv(1e18 - market.reserveFactor, 1e18);
        
        market.borrowRate = borrowRate;
        market.supplyRate = supplyRate;
        
        emit RatesUpdated(token, borrowRate, supplyRate);
    }
    
    /**
     * @dev Calculate account liquidity
     */
    function _getAccountLiquidity(address account) internal view returns (int256) {
        int256 totalCollateral = 0;
        int256 totalBorrow = 0;
        
        address[] memory userTokens = userMarkets[account];
        for (uint256 i = 0; i < userTokens.length; i++) {
            address token = userTokens[i];
            Market storage market = markets[token];
            UserPosition storage position = positions[token][account];
            
            uint256 collateralValue = _getTokenValue(token, position.supplied)
                .mulDiv(market.collateralFactor, 1e18);
            uint256 borrowValue = _getTokenValue(token, position.borrowed);
            
            totalCollateral += int256(collateralValue);
            totalBorrow += int256(borrowValue);
        }
        
        return totalCollateral - totalBorrow;
    }
    
    /**
     * @dev Get USD value of tokens
     */
    function _getTokenValue(address token, uint256 amount) internal view returns (uint256) {
        return amount.mulDiv(priceOracle.getPrice(token), 1e18);
    }
    
    /**
     * @dev Pause/unpause the protocol
     */
    function pause() external onlyGovernance {
        _pause();
    }
    
    function unpause() external onlyGovernance {
        _unpause();
    }
}
`;
