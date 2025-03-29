// GET submissions endpoint
router.get('/', async (req, res) => {
  try {
    const { limit = 100, skip = 0, userId } = req.query;
    
    // Validate userId format
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid userId format' 
      });
    }
    
    // Build query object
    const query = userId ? { userId: userId } : {};
    
    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('problemId', 'title');
      
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});