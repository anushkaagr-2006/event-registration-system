const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateAdmin } = require('../middleware/auth');
const xl = require('excel4node');
const path = require('path');
const fs = require('fs');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    // Simple admin authentication (in production, use proper user management)
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get all registrations with statistics
router.get('/registrations', authenticateAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 });
    
    const stats = {
      total: registrations.length,
      present: registrations.filter(r => r.isPresent).length,
      absent: registrations.filter(r => !r.isPresent).length,
      attendanceRate: registrations.length > 0 
        ? ((registrations.filter(r => r.isPresent).length / registrations.length) * 100).toFixed(1)
        : 0
    };

    res.json({ registrations, stats });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching registrations' });
  }
});

// Export to Excel
router.get('/export/excel', authenticateAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 });

    // Create a new workbook
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Event Attendance');

    // Define styles
    const headerStyle = wb.createStyle({
      font: {
        color: '#FFFFFF',
        size: 12,
        bold: true
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: '#4472C4'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      }
    });

    const cellStyle = wb.createStyle({
      alignment: {
        horizontal: 'left',
        vertical: 'center'
      },
      border: {
        left: { style: 'thin', color: '#000000' },
        right: { style: 'thin', color: '#000000' },
        top: { style: 'thin', color: '#000000' },
        bottom: { style: 'thin', color: '#000000' }
      }
    });

    // Add headers
    const headers = ['S.No', 'Name', 'Email', 'Registration ID', 'Status', 'Check-in Time', 'Registration Date'];
    headers.forEach((header, index) => {
      ws.cell(1, index + 1).string(header).style(headerStyle);
    });

    // Set column widths
    ws.column(1).setWidth(8);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(20);
    ws.column(5).setWidth(12);
    ws.column(6).setWidth(20);
    ws.column(7).setWidth(20);

    // Add data
    registrations.forEach((reg, index) => {
      ws.cell(index + 2, 1).number(index + 1).style(cellStyle);
      ws.cell(index + 2, 2).string(reg.name).style(cellStyle);
      ws.cell(index + 2, 3).string(reg.email).style(cellStyle);
      ws.cell(index + 2, 4).string(reg.registrationId).style(cellStyle);
      ws.cell(index + 2, 5).string(reg.isPresent ? 'Present' : 'Absent').style(cellStyle);
      ws.cell(index + 2, 6).string(reg.checkInTime ? new Date(reg.checkInTime).toLocaleString() : 'Not Checked In').style(cellStyle);
      ws.cell(index + 2, 7).string(new Date(reg.registeredAt).toLocaleString()).style(cellStyle);
    });

    // Add summary at the bottom
    const summaryRow = registrations.length + 4;
    ws.cell(summaryRow, 1).string('Summary').style(headerStyle);
    ws.cell(summaryRow + 1, 1).string('Total Registrations:');
    ws.cell(summaryRow + 1, 2).number(registrations.length);
    ws.cell(summaryRow + 2, 1).string('Present:');
    ws.cell(summaryRow + 2, 2).number(registrations.filter(r => r.isPresent).length);
    ws.cell(summaryRow + 3, 1).string('Absent:');
    ws.cell(summaryRow + 3, 2).number(registrations.filter(r => !r.isPresent).length);

    // Generate filename with timestamp
    const filename = `attendance_${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '..', 'exports', filename);

    // Ensure exports directory exists
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // Write file and send
    wb.write(filepath, (err, stats) => {
      if (err) {
        console.error('Excel generation error:', err);
        return res.status(500).json({ error: 'Error generating Excel file' });
      }

      res.download(filepath, filename, (downloadErr) => {
        // Clean up file after download
        fs.unlinkSync(filepath);
      });
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Server error during export' });
  }
});

// Update attendance status (manual override)
router.put('/registration/:id/attendance', authenticateAdmin, async (req, res) => {
  try {
    const { isPresent } = req.body;
    
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.isPresent = isPresent;
    if (isPresent && !registration.checkInTime) {
      registration.checkInTime = new Date();
    } else if (!isPresent) {
      registration.checkInTime = null;
    }

    await registration.save();
    res.json({ message: 'Attendance updated successfully', registration });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating attendance' });
  }
});

// Delete a registration
router.delete('/registration/:id', authenticateAdmin, async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting registration' });
  }
});

module.exports = router;
