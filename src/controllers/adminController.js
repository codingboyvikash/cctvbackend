import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Ticket from '../models/Ticket.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/emailService.js';

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: admin._id, role: admin.role });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalTickets, openTickets, inProgressTickets, closedTickets, recentTickets] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'Open' }),
      Ticket.countDocuments({ status: 'In Progress' }),
      Ticket.countDocuments({ status: 'Closed' }),
      Ticket.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        closedTickets,
        recentTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const { status, serviceType, startDate, endDate, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
    if (search) {
      filter.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

const getSingleTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { status, assignedTechnician, note } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const oldStatus = ticket.status;
    
    if (status) ticket.status = status;
    if (typeof assignedTechnician === 'string') ticket.assignedTechnician = assignedTechnician;
    if (note) {
      ticket.notes.push({
        message: note,
        addedBy: req.admin?.name || 'Admin',
      });
    }

    const updatedTicket = await ticket.save();

    // Send email notification if status changed
    if (status && oldStatus !== status) {
      const emailSubject = `Ticket #${ticket.ticketNumber} Status Updated`;
      const emailMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ticket Status Update</h2>
          <p>Dear <strong>${ticket.customerName}</strong>,</p>
          <p>Your ticket status has been updated:</p>
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p><strong>Ticket Number:</strong> #${ticket.ticketNumber}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>New Status:</strong> <span style="color: ${status === 'Closed' ? '#28a745' : status === 'In Progress' ? '#ffc107' : '#007bff'};">${status}</span></p>
            <p><strong>Service Type:</strong> ${ticket.serviceType}</p>
          </div>
          <p>We will keep you informed about any further updates.</p>
          <p>Thank you for your patience!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            IT CCTV Support Team
          </p>
        </div>
      `;
      
      try {
        await sendEmail(ticket.email, emailSubject, emailMessage);
        console.log(`Email sent to ${ticket.email} for ticket ${ticket.ticketNumber}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError.message);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export { adminLogin, getDashboardStats, getTickets, getSingleTicket, updateTicket };
