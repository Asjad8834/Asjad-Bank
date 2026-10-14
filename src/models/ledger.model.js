const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({

  account:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required: [true, "Ledger must be associated with an account"],
    index: true,
    immutable: true,
  },

  amount:{
    type: Number,
    required: [true, "Amount is required for a ledger entry"],
    immutable: true,
  },

  transaction:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"transaction",
    required:[true, "Ledger must be associated with a transaction"],
    immutable: true,
    index: true
  },

  type:{
    type: String,
    enum:{
      values:["CREDIT", "DEBIT"],
      message:"Type can either be CREDIT or DEBIT"
    },
    required:[true, "Ledger type is required"],
    immutable: true, 
  }

})


// Since the Ledger is the single source of truth we have to make it a bit differently


function preventLedgerModification(){
  throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

//Now lets prevent the ledger entriees from ever being updated or deleted

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);


const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;