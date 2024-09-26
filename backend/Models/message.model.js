const { default: mongoose, Schema } = require("mongoose");

const messageSchema = new Schema({
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    receiver: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports.messageModel = mongoose.model("messages", messageSchema);
