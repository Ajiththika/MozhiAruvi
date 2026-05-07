import ResourceSection from '../models/ResourceSection.js';
import Resource from '../models/Resource.js';

export async function getSections(req, res) {
  try {
    const { level } = req.query;
    const filter = level ? { level } : {};
    const sections = await ResourceSection.find(filter).sort({ orderIndex: 1, createdAt: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createSection(req, res) {
  try {
    const section = new ResourceSection(req.body);
    await section.save();
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateSection(req, res) {
  try {
    const section = await ResourceSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function deleteSection(req, res) {
  try {
    await ResourceSection.findByIdAndDelete(req.params.id);
    await Resource.deleteMany({ sectionId: req.params.id });
    res.json({ message: 'Section and its resources deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
