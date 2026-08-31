import InstagramReel from '../models/InstagramReel.js';

// @desc    Get all Instagram reels
// @route   GET /api/instagram
// @access  Public
export const getReels = async (req, res) => {
    try {
        const reels = await InstagramReel.find({}).sort({ createdAt: -1 });
        res.json(reels);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reels', error: error.message });
    }
};

// @desc    Add a new Instagram reel
// @route   POST /api/instagram
// @access  Private/Admin
export const addReel = async (req, res) => {
    const { link, image, title } = req.body;

    try {
        const reel = await InstagramReel.create({
            link,
            image,
            title
        });
        res.status(201).json(reel);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add reel', error: error.message });
    }
};

// @desc    Delete a reel
// @route   DELETE /api/instagram/:id
// @access  Private/Admin
export const deleteReel = async (req, res) => {
    try {
        const reel = await InstagramReel.findById(req.params.id);

        if (reel) {
            await InstagramReel.deleteOne({ _id: reel._id });
            res.json({ message: 'Reel removed' });
        } else {
            res.status(404).json({ message: 'Reel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete reel', error: error.message });
    }
};
