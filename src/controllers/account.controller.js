const accountModel = require("../models/account.model");


async function createAccountController(req, res){

  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  })

  res.status(201).json({
    message:"Account created successfully",
    account: account,
  })

}


async function getUserAccounts(req, res){

  const accounts = await accountModel.find({
    user: req.user._id
  });

  res.status(200).json({
    message:"Accounts fetched Succesfully",
    accounts: accounts
  })

}


async function getAccountBalanceController(req, res){

  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id
  })

  if(!account){
    return res.status(401).json({
      message:"Account not found"
    })
  }

  const balance = await account.getBalance();
  //we made the get balance function in teh account model

  return res.status(200).json({
    message:"Balance fetched Succesfully",
    data:{
      accountId: account._id,
      balance: balance
    }
  })

}



module.exports = { createAccountController, getUserAccounts, getAccountBalanceController };