const router = require('express').Router();
const Bookmark = require('../models/Bookmark');
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate('resource').sort({ createdAt: -1 });
    res.json({ bookmarks: bookmarks.filter(b => b.resource) });
  } catch { res.status(500).json({ message: 'Could not fetch bookmarks.' }); }
});
router.post('/:resourceId', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    await Bookmark.findOneAndUpdate({ user: req.user._id, resource: resource._id }, { user: req.user._id, resource: resource._id }, { upsert: true });
    res.json({ message: 'Resource bookmarked.' });
  } catch { res.status(400).json({ message: 'Could not bookmark this resource.' }); }
});
router.delete('/:resourceId', async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ user: req.user._id, resource: req.params.resourceId });
    res.json({ message: 'Bookmark removed.' });
  } catch { res.status(400).json({ message: 'Could not remove bookmark.' }); }
});
module.exports = router;
