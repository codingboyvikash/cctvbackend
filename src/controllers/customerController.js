import Ticket from '../models/Ticket.js';
import generateTicketNumber from '../utils/generateTicketNumber.js';
import { sendContactEmail } from '../utils/emailService.js';

const submitTicket = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, email, serviceType, problemDescription, address } = req.body;

    let ticketNumber = generateTicketNumber();
    while (await Ticket.findOne({ ticketNumber })) {
      ticketNumber = generateTicketNumber();
    }

    const ticket = await Ticket.create({
      ticketNumber,
      customerName: fullName,
      mobileNumber,
      email,
      serviceType,
      problemDescription,
      address,
    });

    res.status(201).json({
      success: true,
      message: 'Service ticket created successfully.',
      data: {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const checkTicketStatus = async (req, res, next) => {
  try {
    const { ticketNumber, contact } = req.body;

    const ticket = await Ticket.findOne({
      ticketNumber,
      $or: [{ email: contact.toLowerCase() }, { mobileNumber: contact }],
    }).select('-__v');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const submitContactInquiry = async (req, res, next) => {
  try {
    const { name, email, mobile, message } = req.body;
    
    console.log('Contact form submission received:', { name, email, mobile, message });

    const emailResult = await sendContactEmail({ name, email, mobile, message });
    
    console.log('Email sending result:', emailResult);

    if (!emailResult.success) {
      console.error('Email failed to send:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send inquiry. Please try again later.',
        error: emailResult.error
      });
    }

    console.log('Email sent successfully');
    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent successfully.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    next(error);
  }
};

export { submitTicket, checkTicketStatus, submitContactInquiry };
