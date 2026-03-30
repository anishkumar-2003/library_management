const express = require('express');
const IssueRecord = require('../models/IssueRecord');
const Book = require('../models/Book');
const Membership = require('../models/Membership');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Calculate fine amount (Rs. 5 per day)
function calculateFine(returnDate) {
  const today = new Date();
  const diffTime = today - new Date(returnDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * 5 : 0;
}

// Issue a book
router.post('/issue', authenticate, async (req, res) => {
  try {
    const { membershipNumber, bookId, remarks } = req.body;

    // Validation
    if (!membershipNumber || !bookId) {
      return res.status(400).json({ success: false, message: 'Membership number and book ID are required' });
    }

    // Check membership exists and is active
    const membership = await Membership.findOne({ membershipNumber });
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    if (membership.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Membership is not active' });
    }

    // Check book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    // Calculate dates
    const issueDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 15);

    // Create issue record
    const issueRecord = new IssueRecord({
      membershipNumber,
      memberName: membership.memberName,
      bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      serialNumber: book.serialNumber,
      issueDate,
      returnDate,
      remarks,
      status: 'issued'
    });

    await issueRecord.save();

    // Update book availability
    book.availableCopies--;
    book.issuedCopies++;
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      issueRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get active issues
router.get('/active', authenticate, async (req, res) => {
  try {
    const issues = await IssueRecord.find({ status: 'issued' });
    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get issues by membership number
router.get('/member/:membershipNumber', authenticate, async (req, res) => {
  try {
    const issues = await IssueRecord.find({ membershipNumber: req.params.membershipNumber });
    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get specific issue record
router.get('/:id', authenticate, async (req, res) => {
  try {
    const issue = await IssueRecord.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }
    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Return a book
router.post('/return', authenticate, async (req, res) => {
  try {
    const { issueRecordId, returnDate } = req.body;

    // Validation
    if (!issueRecordId) {
      return res.status(400).json({ success: false, message: 'Issue record ID is required' });
    }

    const issueRecord = await IssueRecord.findById(issueRecordId);
    if (!issueRecord) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }

    if (issueRecord.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Book is not issued' });
    }

    // Calculate fine
    const actualReturnDate = returnDate ? new Date(returnDate) : new Date();
    let fineAmount = 0;

    if (actualReturnDate > new Date(issueRecord.returnDate)) {
      fineAmount = calculateFine(issueRecord.returnDate);
    }

    issueRecord.actualReturnDate = actualReturnDate;
    issueRecord.fineAmount = fineAmount;
    issueRecord.status = fineAmount > 0 ? 'overdue' : 'returned';

    await issueRecord.save();

    // Update book availability
    const book = await Book.findById(issueRecord.bookId);
    if (book) {
      book.availableCopies++;
      book.issuedCopies--;
      await book.save();
    }

    res.json({
      success: true,
      message: 'Return initiated successfully',
      issueRecord,
      fineAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Pay fine
router.post('/pay-fine', authenticate, async (req, res) => {
  try {
    const { issueRecordId, fineAmount } = req.body;

    if (!issueRecordId) {
      return res.status(400).json({ success: false, message: 'Issue record ID is required' });
    }

    const issueRecord = await IssueRecord.findById(issueRecordId);
    if (!issueRecord) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }

    // Verify fine amount
    if (fineAmount < issueRecord.fineAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient payment' });
    }

    issueRecord.finePaid = true;
    issueRecord.status = 'returned';
    await issueRecord.save();

    res.json({
      success: true,
      message: 'Fine paid successfully',
      issueRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get overdue issues
router.get('/overdue/list', authenticate, async (req, res) => {
  try {
    const issues = await IssueRecord.find({
      status: { $in: ['issued', 'overdue'] },
      returnDate: { $lt: new Date() }
    });
    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
