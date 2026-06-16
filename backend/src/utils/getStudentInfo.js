const sequelize = require('../config/database')
const { StudentInfo } = require('../models')

/**
 * Get student info for the current user, with caching.
 * Checks req.studentInfo (set by auth middleware) first,
 * then in-memory cache, then falls back to database.
 * Returns a plain object with at least { id }.
 */
async function getCachedStudentInfo(req) {
  // Priority 1: req.studentInfo from auth middleware
  if (req.studentInfo) return req.studentInfo

  const userId = req.user.id
  const cacheKey = `student_info_${userId}`

  // Priority 2: in-memory cache (60s TTL)
  let cached = sequelize.cacheGet(cacheKey)
  if (cached) {
    req.studentInfo = cached
    return cached
  }

  // Priority 3: database lookup
  const student = await StudentInfo.findOne({ where: { user_id: userId }, raw: true })
  if (student) {
    sequelize.cacheSet(cacheKey, student)
    req.studentInfo = student
  }

  return student
}

module.exports = { getCachedStudentInfo }
