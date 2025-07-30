const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    senderId: {
             type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
    }
},{
    versionKey: false,
    timestamps: true
})

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;