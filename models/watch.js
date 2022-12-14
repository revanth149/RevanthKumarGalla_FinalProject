const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchSchema = new Schema({
    trade: {type: Schema.Types.ObjectId,ref: 'Trade'},
    WatchedBy: {type: Schema.Types.ObjectId,ref: 'User'},
}, 
{
    timestamps: true
});

module.exports = mongoose.model('Watch', watchSchema);