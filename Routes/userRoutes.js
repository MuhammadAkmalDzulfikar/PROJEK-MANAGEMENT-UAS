const express = require('express');
const router = express.Router();
const controller = require('../controllers/userControllers');
const { authenticateToken } = require('../middleware/authMiddleware'); 

// ============================
//          EVENTS
// ============================
router.get('/events', controller.getAllEvents); 
router.get('/events/:id', controller.getEventById);
router.post('/events', authenticateToken, controller.createEvent); 
router.put('/events/:id', authenticateToken, controller.updateEvent);
router.delete('/events/:id', authenticateToken, controller.deleteEvent); 

// ============================
//       PARTICIPANTS
// ============================
router.get('/participants', authenticateToken, controller.getAllParticipants);
router.get('/participants/:id', authenticateToken, controller.getParticipantById); 
router.post('/participants', controller.createParticipant); 
router.put('/participants/:id', authenticateToken, controller.updateParticipant); 
router.delete('/participants/:id', authenticateToken, controller.deleteParticipant); 

// ============================
//       REGISTRATIONS
// ============================
router.get('/registrations', authenticateToken, controller.getAllRegistrations); 
router.get('/registrations/:id', authenticateToken, controller.getRegistrationById); 
router.post('/registrations', authenticateToken, controller.createRegistration); 
router.delete('/registrations/:id', authenticateToken, controller.deleteRegistration);

// ============================
//    ADDITIONAL ENDPOINTS
// ============================
router.get('/registrations/event/:eventId', controller.getEventRegistrations); 
router.get('/registrations/participant/:participantId', controller.getParticipantRegistrations); 
router.put('/events/:id/capacity', authenticateToken, controller.updateEventCapacity); 
router.get('/registrations/date', authenticateToken, controller.getRegistrationsByDate); 
router.get('/events/upcoming', controller.getUpcomingEvents); 

// ============================
//       AUTHENTICATION
// ============================
router.post('/participants/login', controller.loginParticipant); 

module.exports = router;
