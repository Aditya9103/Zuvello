import mongoose from 'mongoose';

const instagramReelSchema = new mongoose.Schema({
    link: {
        type: String,
        required: [true, 'Instagram link is required']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80'
    },
    title: {
        type: String,
        default: 'Instagram Reel'
    }
}, {
    timestamps: true
});

const InstagramReel = mongoose.model('InstagramReel', instagramReelSchema);

export default InstagramReel;
