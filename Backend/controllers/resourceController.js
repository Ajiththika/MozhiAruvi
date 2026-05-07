import Resource from '../models/Resource.js';

export async function getResources(req, res) {
  try {
    const { level } = req.query;
    const filter = level ? { level } : {};
    const resources = await Resource.find(filter).sort({ orderIndex: 1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createResource(req, res) {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateResource(req, res) {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function deleteResource(req, res) {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
