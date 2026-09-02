// src/routes.js

const FieldController = require('./controllers/FieldController')
const UserController = require('./controllers/UserController')
const UserAuthenController = require('./controllers/UserAuthenController')
const isAuthenController = require('./controllers/isAuthenController')
const BookingController = require('./controllers/BookingController')
const EquipmentController = require('./controllers/EquipmentController')
const PaymentController = require('./controllers/PaymentController')
const AdminController = require('./controllers/AdminController')
const ReviewController = require('./controllers/ReviewController')
const fieldUpload = require('./middleware/fieldUpload')

module.exports = (app) => {

  // ===============================
  // Auth Routes
  // ===============================
  app.post('/login', UserAuthenController.login)
  app.post('/register', UserAuthenController.register)

  // ===============================
  // Users Routes (ต้อง login ก่อน)
  // ===============================
  const isAdminController = require('./controllers/isAdminController')
  // Users: listing and management restricted to admins
  app.get('/users', isAdminController, UserController.index)
  app.get('/user/:userId', isAuthenController, UserController.show)
  app.post('/user', isAdminController, UserController.create)
  app.put('/user/:userId', isAdminController, UserController.put)
  app.delete('/user/:userId', isAdminController, UserController.remove)

  // ===============================
  // Field Routes (new)
  // ===============================
  app.get('/fields', FieldController.index)
  app.post('/field', FieldController.create)
  app.put('/field/:fieldId', FieldController.put)
  app.delete('/field/:fieldId', FieldController.delete)
  app.get('/field/:fieldId', FieldController.show)
  app.get('/field/:fieldId/availability', FieldController.availability)
  app.post('/field-upload', fieldUpload.single('image'), FieldController.upload)
  app.delete('/field-upload', FieldController.deleteUpload)

  // ===============================
  // Review Routes
  // ===============================
  app.get('/reviews', ReviewController.index)
  app.post('/review', isAuthenController, ReviewController.post)

  // ===============================
  // Booking Routes
  // ===============================
  app.get('/bookings', isAuthenController, BookingController.index)
  app.post('/booking', isAuthenController, BookingController.create)
  app.get('/booking/:bookingId', isAuthenController, BookingController.show)
  app.get('/booking/:bookingId/qr', isAuthenController, BookingController.qr)
  app.post('/booking/:bookingId/checkin', isAuthenController, BookingController.checkin)
  app.post('/booking/:bookingId/confirm-payment', isAuthenController, BookingController.confirmPayment)
  app.put('/booking/:bookingId', isAuthenController, BookingController.put)
  app.delete('/booking/:bookingId', isAuthenController, BookingController.delete)

  // ===============================
  // Payment (mock)
  // ===============================
  app.post('/payment/create', PaymentController.create)
  app.get('/payment/:bookingId/status', PaymentController.status)

  // ===============================
  // Equipment / Inventory Routes
  // ===============================
  app.get('/equipment', EquipmentController.index)
  app.post('/equipment', isAuthenController, EquipmentController.create)
  app.get('/equipment/:equipmentId', EquipmentController.show)
  app.put('/equipment/:equipmentId', isAuthenController, EquipmentController.put)
  app.delete('/equipment/:equipmentId', isAuthenController, EquipmentController.delete)
  app.post('/equipment/:equipmentId/adjust-stock', isAuthenController, EquipmentController.adjustStock)

  // ===============================
  // Admin
  // ===============================
  app.get('/admin/stats', isAdminController, AdminController.stats)
  const AuditController = require('./controllers/AuditController')
  app.get('/admin/audits', isAdminController, AuditController.index)
}
