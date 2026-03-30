const express = require('express');
const Membership = require('../models/Membership');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate membership number
function generateMembershipNumber() {
  return 'MEM' + Date.now().toString().slice(-8);
}

// Calculate end date based on membership type
function calculateEndDate(startDate, membershipType) {
  const start = new Date(startDate);
  if (membershipType === '6months') {
    start.setMonth(start.getMonth() + 6);
  } else if (membershipType === '1year') {
    start.setFullYear(start.getFullYear() + 1);
  } else if (membershipType === '2years') {
    start.setFullYear(start.getFullYear() + 2);
  }
  return start;
}

// Get all memberships
router.get('/', async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.json({ success: true, memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get membership by ID
router.get('/:id', async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    res.json({ success: true, membership });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get membership by membership number
router.get('/number/:membershipNumber', async (req, res) => {
  try {
    const membership = await Membership.findOne({ membershipNumber: req.params.membershipNumber });
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    res.json({ success: true, membership });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add new membership (Admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { memberName, email, phone, address, membershipType } = req.body;

    // Validation
    if (!memberName || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const membershipNumber = generateMembershipNumber();
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, membershipType || '6months');

    const membership = new Membership({
      membershipNumber,
      memberName,
      email,
      phone,
      address,
      membershipType: membershipType || '6months',
      startDate,
      endDate,
      status: 'active'
    });

    await membership.save();

    res.status(201).json({
      success: true,
      message: 'Membership added successfully',
      membership
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update membership (Admin only)
router.put('/:membershipNumber', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { membershipType, action } = req.body;

    const membership = await Membership.findOne({ membershipNumber: req.params.membershipNumber });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    if (action === 'extend') {
      const newEndDate = calculateEndDate(membership.endDate, membershipType || '6months');
      membership.renewalHistory.push({
        renewalDate: new Date(),
        membershipType: membershipType || '6months',
        newEndDate
      });
      membership.endDate = newEndDate;
      membership.membershipType = membershipType || '6months';
    } else if (action === 'cancel') {
      membership.status = 'cancelled';
    }

    membership.updatedAt = new Date();
    await membership.save();

    res.json({
      success: true,
      message: 'Membership updated successfully',
      membership
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get active memberships
router.get('/status/active', async (req, res) => {
  try {
    const memberships = await Membership.find({ status: 'active' });
    res.json({ success: true, memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
