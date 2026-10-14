const mongoose = require("mongoose");

const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({

  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"users",
    required: [true, "Account must be associated with a user"],
    index: true  //to make searching faster b+tree
  },

  status:{
    type: String,
    enum:{
      values: ["ACTIVE", "FROZEN", "CLOSED"],
      message: "Status must be either ACTIVE, FROZEN or CLOSED",
      default: "ACTIVE"
    },
  },

  currency:{
    type: String,
    required: [true, "Currency is required for creating an account"],
    default: "INR"
  },

}, {timestamps: true});

//lets creating another index; a compound index so we can also find based on the status also

accountSchema.index({user: 1, status: 1});

//Get the balance of the account
accountSchema.methods.getBalance = async function(){

  const balanceData = await ledgerModel.aggregate([
    {
      $match: { account: this._id }
    },
    {
      $group: {
        _id: null,
        totalDebit: { 
          $sum:{
            $cond: [
              { $eq: ["$type", "DEBIT"] },
              "$amount",
              0
            ]
          }
        },
        totalCredit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "CREDIT"] },
              "$amount",
              0
            ]
          }
        }
      }
    },
    {
      $project:{
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] }
      }
    }
  ]);

  if(balanceData.length === 0){
    return 0;
  }

  return balanceData[0].balance
}
// aggregate is used to perform complex data processing and analysis on the documents in a collection. It allows you to transform and combine data from multiple documents, perform calculations, and return aggregated results. In this case, we are using the aggregate method to calculate the balance of the account by matching the account ID in the ledger collection.


const accountModel = mongoose.model("account", accountSchema);




module.exports = accountModel;