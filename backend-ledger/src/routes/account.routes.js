const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")


const router = express.Router()



/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)


/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController)


/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)


/**
 * - POST /api/accounts/add-funds
 * - Add funds to an account (for testing purposes)
 * - Protected Route
 */
router.post("/add-funds", authMiddleware.authMiddleware, accountController.addFundsController)


/**
 * - PATCH /api/accounts/:accountId/close
 * - Close an account (change status to CLOSED)
 * - Protected Route
 */
router.patch("/:accountId/close", authMiddleware.authMiddleware, accountController.closeAccountController)


module.exports = router
