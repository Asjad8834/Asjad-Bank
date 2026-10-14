const transactionModel = require("../models/transaction.model");

const ledgerModel = require("../models/ledger.model");

const accountModel = require("../models/account.model");

const mongoose = require("mongoose");

const emailService = require("../services/email.service");


/**
 * - Create a new transaction
 * --The 10-Step TRANSFER FLOW:
    * 1. Validate request
    * 2. Validate idempotency Key
    * 3. Check account status
    * 4. Derive sender balance from ledger
    * 5. Create transaction(Pending)
    * 6. Create DEBIT ledger entry
    * 7. Create CREDIT ledger entry
    * 8. Mark tranction COMPLETED
    * 9. Commit MongoDB session
    * 10. Send email notification 
 */

async function createTransaction(req, res){

  /**
   * 1. Validate Request
   */

  const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

  if(!fromAccount || !toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message:"All things are required to proceess Transaction",
    })
  }

  //Now we will check if the FROM and To accounts even exists

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  })

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })

  if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
      message:"FROM or TO account not found",
    })
  }

  /**
   * 2. Validate Idempotency Key
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
  })

  if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === "COMPLETED"){
      return res.status(200).json({
        message:"Transaction already completed",
        transaction: isTransactionAlreadyExists
      })
    }

    if(isTransactionAlreadyExists.status === "PENDING"){
      return res.status(200).json({
        message:"Transaction is still pending",
      })
    }

    if(isTransactionAlreadyExists.status === "FAILED"){
      return res.status(500).json({
        message: "Transaction failed, please Try Again"
      })
    }

    if(isTransactionAlreadyExists.status === "REVERSED"){
      return res.status(200).json({
        message: "Transaction reversed, please Try Again"
      })
    }

  }

  /**
   * 3. Check Account Status
   */

  if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({
      message:"Transaction cannot be completedn INACTIVE Accounts"
    })
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance();

  if(balance < amount){
    return res.status(400).json({
      message:`Insufficient Balance, Current Balance is ${balance}, Transaction Amount is ${amount}`
    })
  }

  /**
   * 5. Create Transaction (Pending)
   */

  //we are using startSession to create a transaction in MongoDB, so that if any of the steps fail, we can rollback the entire 
  //transaction and maintain data integrity.
  
  //Either all the steps will be completed or none of them will be completed. This is called ACID (Atomicity, Consistency, Isolation, Durability) properties of a transaction.

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  }], { session });
  

  const debitLedgerEntry = await ledgerModel.create([{
    account: fromAccount,
    amount: amount,
    type: "DEBIT",
    transaction: transaction._id,
  }], { session });

  const creditLedgerEntry = await ledgerModel.create([{
    account: toAccount,
    amount: amount,
    type: "CREDIT",
    transaction: transaction._id,
  }], { session });

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();


  /**
   * 10. Send Email Notification
   */

  await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

  //we do req.user.email and req.user.name because we have already authenticated the user and added the user object to the request object in the auth middleware.

  res.status(201).json({
    message:"Transaction Completed Successfully",
    transaction: transaction,
  })


}


async function createInitialFundsTransaction(req, res){

  const {toAccount, amount, idempotencyKey} = req.body;

  if(!toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message:"All things are required to proceess Transaction",
    })
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })
  
  if(!toUserAccount){
    return res.status(400).json({
      message:"TO account not found",
    })
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  })

  if(!fromUserAccount){
    return res.status(400).json({
      message:"System User Account not found",
    })
  }

  //Now we will create a transaction from the system user account to the user account
  
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount: toUserAccount._id,
    amount,
    idempotencyKey,
    status: "PENDING",
  });
  //we are not saving the transaction yet, we will save it after we create the ledger entries that why we do not use transactionModel.create() because that will save the transaction to the database immediately, we want to save it after we create the ledger entries.

  const debitLedgerEntry = await ledgerModel.create([{
    account: fromUserAccount._id,
    amount: amount,
    type: "DEBIT",
    transaction: transaction._id,
  }], { session });

  const creditLedgerEntry = await ledgerModel.create([{
    account: toUserAccount._id,
    amount: amount,
    type: "CREDIT",
    transaction: transaction._id,
  }], { session });

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  await session.endSession();

  return res.status(201).json({
    message:"Initial Funds Transaction Completed Successfully",
    transaction: transaction,
  })

}


module.exports = {createTransaction, createInitialFundsTransaction};