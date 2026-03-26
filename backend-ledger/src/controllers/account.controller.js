const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");


async function createAccountController(req, res) {

    const user = req.user;
    const { name, type, description, currency } = req.body;

    // Validate required fields
    if (!name) {
        return res.status(400).json({
            message: "Account name is required"
        });
    }

    const account = await accountModel.create({
        user: user._id,
        name,
        type: type || "SAVINGS",
        description: description || "",
        currency: currency || "INR"
    })

    res.status(201).json({
        account
    })

}

async function getUserAccountsController(req, res) {

    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}

async function addFundsController(req, res) {
    const { accountId, amount } = req.body;

    if (!accountId || !amount || amount <= 0) {
        return res.status(400).json({
            message: "Account ID and valid amount are required"
        });
    }

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    });

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        });
    }

    // Create a deposit transaction (no fromAccount needed)
    const transaction = await transactionModel.create({
        toAccount: accountId,
        amount: amount,
        status: "COMPLETED",
        idempotencyKey: `add-funds-${Date.now()}-${Math.random()}`
    });

    // Create ledger entry (CREDIT)
    await ledgerModel.create({
        account: accountId,
        transaction: transaction._id,
        type: "CREDIT",
        amount: amount
    });

    res.status(200).json({
        message: "Funds added successfully",
        accountId: account._id,
        amount: amount
    });
}

async function closeAccountController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    });

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        });
    }

    if (account.status === "CLOSED") {
        return res.status(400).json({
            message: "Account is already closed"
        });
    }

    // Check if account has balance
    const balance = await account.getBalance();
    if (balance > 0) {
        return res.status(400).json({
            message: `Cannot close account with balance ${account.currency === 'INR' ? '₹' : account.currency === 'USD' ? '$' : '€'}${balance.toFixed(2)}. Please transfer funds to another account first.`
        });
    }

    // Update status to CLOSED
    account.status = "CLOSED";
    await account.save({ validateBeforeSave: false });

    res.status(200).json({
        message: "Account closed successfully",
        account
    });
}


module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    addFundsController,
    closeAccountController
}
