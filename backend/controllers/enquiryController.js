import Enquiry from '../models/Enquiry.js';

export const getEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteEnquiry = async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Enquiry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.create(req.body);
        res.status(201).json({ success: true, data: enquiry });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
