const mongoose = require('mongoose');

const issueRecordSchema = new mongoose.Schema({
  membershipNumber: {
    type: String,
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  bookAuthor: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued'
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IssueRecord', issueRecordSchema);
