const express = require('express')
const router = express.Router()
const c = require('../controllers/eventController')
const { authMiddleware, eventPublisherMiddleware } = require('../middlewares/auth')

router.get('/', authMiddleware, c.getEvents)
router.get('/my-registrations', authMiddleware, c.getMyRegistrations)
router.get('/:id', authMiddleware, c.getEvent)
router.post('/:id/register', authMiddleware, c.register)
router.put('/:id/cancel', authMiddleware, c.cancelRegistration)

router.post('/', authMiddleware, eventPublisherMiddleware, c.createEvent)
router.put('/:id', authMiddleware, eventPublisherMiddleware, c.updateEvent)
router.delete('/:id', authMiddleware, eventPublisherMiddleware, c.cancelEvent)
router.get('/:id/registrations', authMiddleware, eventPublisherMiddleware, c.getEventRegistrations)

module.exports = router
