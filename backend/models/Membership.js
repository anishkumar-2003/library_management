const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  membershipNumber: {
    type: String,
    unique: true,
    required: true
  },
  memberName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  membershipType: {
    type: String,
    enum: ['6months', '1year', '2years'],
    default: '6months'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  renewalHistory: [{
    renewalDate: Date,
    membershipType: String,
    newEndDate: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Membership', membershipSchema);
