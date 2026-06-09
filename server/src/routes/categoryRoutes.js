import express from 'express';
 
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get all categories' });
});
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  res.json({ message: `Get category with slug: ${slug}` });
});
router.post('/', (req, res) => {
  const { name, slug } = req.body;
  res.status(201).json({ message: `Create category with name: ${name} and slug: ${slug}` });
});
router.put('/:slug', (req, res) => {
    const { slug } = req.params;
    const { name } = req.body;
    res.json({ message: `Update category with slug: ${slug} to name: ${name}` });
});
router.delete('/:slug', (req, res) => {
    const { slug } = req.params;
    res.json({ message: `Delete category with slug: ${slug}` });
});

export default router;