const express = require('express');
const Book = require('../models/Book');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Search books by title or author
router.get('/search/query', async (req, res) => {
  try {
    const { title, author } = req.query;
    let query = {};

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };

    const books = await Book.find(query);
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add book (Admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { title, author, isbn, serialNumber, category, publication, type, totalCopies } = req.body;

    // Validation
    if (!title || !author || !serialNumber || !category) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    // Check if serial number already exists
    const existingBook = await Book.findOne({ serialNumber });
    if (existingBook) {
      return res.status(400).json({ success: false, message: 'Serial number already exists' });
    }

    const book = new Book({
      title,
      author,
      isbn,
      serialNumber,
      category,
      publication,
      type: type || 'book',
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update book (Admin only)
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { title, author, isbn, category, publication, type, totalCopies } = req.body;

    // Validation
    if (!title || !author || !category) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, category, publication, type, totalCopies, updatedAt: Date.now() },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete book (Admin only)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get available books
router.get('/available/list', async (req, res) => {
  try {
    const books = await Book.find({ availableCopies: { $gt: 0 } });
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
