import mongoose from 'mongoose';

const bulkMailSchema = new mongoose.Schema({
    religion: {
        type: String,
        required: true,
        trim: true
    },
    festivalName: {
        type: String,
        required: true,
        trim: true
    },
    customMessage: {
        type: String,
        required: true,
        trim: true
    },
    yourName: {
        type: String,
        required: true,
        trim: true
    },
    uploadedPhoto: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
        }
    },
    recipients: [{
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (email) {
                    return email && email.trim() !== '';
                },
                message: 'Email is required'
            }
        },
        name: {
            type: String,
            trim: true,
            default: 'Valued Member'
        },
        religion: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending'
        },
        sentAt: Date,
        error: String
    }],
    sendToAll: {
        type: Boolean,
        default: false
    },
    totalRecipients: {
        type: Number,
        default: 0
    },
    sentCount: {
        type: Number,
        default: 0
    },
    failedCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sending', 'completed', 'failed'],
        default: 'draft'
    },
    scheduledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better performance
bulkMailSchema.index({ status: 1, scheduledAt: 1 });
bulkMailSchema.index({ 'recipients.email': 1 });

const BulkMail = mongoose.model('BulkMail', bulkMailSchema);
export default BulkMail;