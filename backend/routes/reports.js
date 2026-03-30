const express = require('express');
const IssueRecord = require('../models/IssueRecord');
const Book = require('../models/Book');
const Membership = require('../models/Membership');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Active Issues Report
router.get('/active-issues', authenticate, async (req, res) => {
  try {
    const issues = await IssueRecord.find({ status: 'issued' });
    res.json({
      success: true,
      report: 'Active Issues',
      data: issues,
      count: issues.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Overdue Issues Report
router.get('/overdue-issues', authenticate, async (req, res) => {
  try {
    const overdueIssues = await IssueRecord.find({
      status: { $in: ['issued', 'overdue'] },
      returnDate: { $lt: new Date() }
    });
    res.json({
      success: true,
      report: 'Overdue Issues',
      data: overdueIssues,
      count: overdueIssues.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Pending Fine Report
router.get('/pending-fines', authenticate, async (req, res) => {
  try {
    const pendingFines = await IssueRecord.find({
      fineAmount: { $gt: 0 },
      finePaid: false
    });

    const totalFine = pendingFines.reduce((sum, issue) => sum + issue.fineAmount, 0);

    res.json({
      success: true,
      report: 'Pending Fines',
      data: pendingFines,
      count: pendingFines.length,
      totalFine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Book Availability Report
router.get('/book-availability', authenticate, async (req, res) => {
  try {
    const books = await Book.find();
    const report = books.map(book => ({
      title: book.title,
      author: book.author,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      issuedCopies: book.issuedCopies
    }));

    res.json({
      success: true,
      report: 'Book Availability',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Member Report
router.get('/members', authenticate, async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.json({
      success: true,
      report: 'Member Report',
      data: memberships,
      count: memberships.length,
      activeCount: memberships.filter(m => m.status === 'active').length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Issue History Report (by date range)
router.get('/issue-history', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate) {
      query.issueDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (query.issueDate) {
        query.issueDate.$lte = new Date(endDate);
      } else {
        query.issueDate = { $lte: new Date(endDate) };
      }
    }

    const issues = await IssueRecord.find(query).sort({ issueDate: -1 });

    res.json({
      success: true,
      report: 'Issue History',
      data: issues,
      count: issues.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Return History Report (by date range)
router.get('/return-history', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'returned' };

    if (startDate) {
      query.actualReturnDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (query.actualReturnDate) {
        query.actualReturnDate.$lte = new Date(endDate);
      } else {
        query.actualReturnDate = { $lte: new Date(endDate) };
      }
    }

    const returns = await IssueRecord.find(query).sort({ actualReturnDate: -1 });

    res.json({
      success: true,
      report: 'Return History',
      data: returns,
      count: returns.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Fine Collection Report
router.get('/fine-collection', authenticate, async (req, res) => {
  try {
    const allFines = await IssueRecord.find({ fineAmount: { $gt: 0 } });
    const paidFines = allFines.filter(issue => issue.finePaid);
    const pendingFines = allFines.filter(issue => !issue.finePaid);

    const totalFineAmount = allFines.reduce((sum, issue) => sum + issue.fineAmount, 0);
    const paidAmount = paidFines.reduce((sum, issue) => sum + issue.fineAmount, 0);
    const pendingAmount = pendingFines.reduce((sum, issue) => sum + issue.fineAmount, 0);

    res.json({
      success: true,
      report: 'Fine Collection',
      totalIssuesWithFine: allFines.length,
      paidCount: paidFines.length,
      pendingCount: pendingFines.length,
      totalFineAmount,
      paidAmount,
      pendingAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
