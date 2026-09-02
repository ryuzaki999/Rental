const { Booking, Field, Equipment, sequelize } = require('../models')
const { Op } = require('sequelize')

module.exports = {
  async stats (req, res) {
    try {
      // bookings per day (last 30 days)
      const bookingsByDayQuery = sequelize.query(
        `SELECT date(startTime) as day, count(*) as bookings FROM Bookings WHERE startTime >= date('now','-30 day') GROUP BY date(startTime) ORDER BY day ASC`
      );
      
      // top fields by bookings
      const topFieldsQuery = sequelize.query(
        `SELECT B.fieldId, F.name, count(*) as count 
         FROM Bookings B 
         JOIN Fields F ON B.fieldId = F.id 
         GROUP BY B.fieldId, F.name 
         ORDER BY count DESC 
         LIMIT 5`
      );

      // peak hours
      const peakHoursQuery = sequelize.query(
        `SELECT strftime('%H', startTime) as hour, count(*) as count 
         FROM Bookings 
         GROUP BY hour 
         ORDER BY hour ASC`
      );

      const [
        [bookingsByDay],
        [topFields],
        [peakHours]
      ] = await Promise.all([bookingsByDayQuery, topFieldsQuery, peakHoursQuery]);

      res.send({ bookingsByDay, topFields, peakHours });

    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch stats' })
    }
  }
}
