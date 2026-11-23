const router = require('express').Router();
const Resource = require('../models/Resource');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { search, language, level, type, topic } = req.query;
    const filter = {};
    if (language && language !== 'All') filter.language = language;
    if (level && level !== 'All') filter.level = level;
    if (type && type !== 'All') filter.type = type;
    if (topic) filter.topic = new RegExp(topic, 'i');
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') },
      { language: new RegExp(search, 'i') }, { topic: new RegExp(search, 'i') }, { tags: new RegExp(search, 'i') }
    ];
    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.json({ resources });
  } catch { res.status(500).json({ message: 'Could not fetch resources.' }); }
});
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json({ resource });
  } catch { res.status(400).json({ message: 'Invalid resource ID.' }); }
});
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const resource = await Resource.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ resource });
  } catch (e) { res.status(400).json({ message: e.message || 'Could not create resource.' }); }
});
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json({ resource });
  } catch (e) { res.status(400).json({ message: e.message || 'Could not update resource.' }); }
});
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    await require('../models/Bookmark').deleteMany({ resource: resource._id });
    res.json({ message: 'Resource deleted.' });
  } catch { res.status(400).json({ message: 'Could not delete resource.' }); }
});
module.exports = router;
