import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'spam'], default: 'pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
