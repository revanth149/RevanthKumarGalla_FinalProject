const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradesSchema = new Schema({
    title: {type: String, required: [true, 'title is required']},
    createdBy: {type: Schema.Types.ObjectId, ref:'User'},
    category: {type: String, required: [true, 'category is required']},
    Details: {type: String, required: [true, 'details are required'],
                minLength: [10, 'the details should have atleast 10 charecters']},
    status: {type: String, required: [true, 'status is required']},
    image: {type: String, required: [true, 'Image is required']} 
},
{timestamps: true}
);

//collection name is trades in the database
module.exports = mongoose.model('Trade',tradesSchema);