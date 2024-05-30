import Video from '../../models/Video.js';
import User from '../../models/User.js';
import Analytics from '../../models/analytics.js';


export const logViewById = async (req, res) => {
    try {
        const videoId = req.params.videoId;

        // Increment the views for the video
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

        // Update the analytics data
        const today = new Date().setHours(0, 0, 0, 0); // date for today only
        const analytics = await Analytics.findOneAndUpdate(
            { date: today },
            { $inc: { views: 1 } },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log view' });
    }
}

export const logWatchTimeById = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const { watchTime } = req.body; // watchTime in seconds

        // Increment the watch time for the video
        await Video.findByIdAndUpdate(videoId, { $inc: { watchTime: watchTime } });

        // Update the analytics data
        const today = new Date().setHours(0, 0, 0, 0); // Ensure the date is for today only
        const analytics = await Analytics.findOneAndUpdate(
            { date: today },
            { $inc: { watchTime: watchTime } },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log watch time' });
    }
}

export const getOverviewData = async (req, res) => {
    try {
        const totalViews = await Analytics.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);
        const totalWatchTime = await Analytics.aggregate([
            { $group: { _id: null, total: { $sum: "$watchTime" } } }
        ]);
        const totalSubscribers = await User.countDocuments({});
        const totalVideos = await Video.countDocuments({});

        res.json({
            views: totalViews[0]?.total || 0,
            watchTime: totalWatchTime[0]?.total || 0,
            subscribers: totalSubscribers,
            totalVideos: totalVideos
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch overview data' });
    }
}

export const getPerformanceData = async (req, res) => {
    try {
        const performanceData = await Analytics.find({}).sort({ date: 1 });

        const labels = performanceData.map(data => data.date.toDateString());
        const viewsData = performanceData.map(data => data.views);
        const watchTimeData = performanceData.map(data => data.watchTime);

        res.json({
            labels,
            datasets: {
                views: viewsData,
                watchTime: watchTimeData
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch performance data' });
    }
}

export const getDemographicData = async (req, res) => {
    try {
        const totalVideos = await Video.countDocuments({});
        const totalViews = await Analytics.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);
        const totalSubscribers = await User.countDocuments({});

        res.json({
            labels: ['Total Videos', 'Views', 'Subscribers'],
            datasets: [
                totalVideos,
                totalViews[0]?.total || 0,
                totalSubscribers
            ]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch demographics data' });
    }
}