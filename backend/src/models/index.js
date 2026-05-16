const sequelize = require('../config/database')
const User = require('./User')
const StudentInfo = require('./StudentInfo')
const LateReturnRecord = require('./LateReturnRecord')
const LeaveRecord = require('./LeaveRecord')
const SafetyExam = require('./SafetyExam')
const SafetyQuestion = require('./SafetyQuestion')
const SafetyExamRecord = require('./SafetyExamRecord')
const IncidentReport = require('./IncidentReport')
const FamilyInfo = require('./FamilyInfo')
const EmergencyContact = require('./EmergencyContact')
const ChatMessage = require('./ChatMessage')
const Announcement = require('./Announcement')
const AnnouncementRead = require('./AnnouncementRead')
const Feedback = require('./Feedback')
const Event = require('./Event')
const EventRegistration = require('./EventRegistration')

User.hasOne(StudentInfo, { foreignKey: 'user_id', as: 'studentInfo' })
StudentInfo.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

StudentInfo.hasMany(LateReturnRecord, { foreignKey: 'student_id', as: 'lateReturnRecords' })
LateReturnRecord.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })
LateReturnRecord.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' })

StudentInfo.hasMany(LeaveRecord, { foreignKey: 'student_id', as: 'leaveRecords' })
LeaveRecord.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })
LeaveRecord.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' })

SafetyExam.hasMany(SafetyQuestion, { foreignKey: 'exam_id', as: 'questions' })
SafetyQuestion.belongsTo(SafetyExam, { foreignKey: 'exam_id', as: 'exam' })

SafetyExam.hasMany(SafetyExamRecord, { foreignKey: 'exam_id', as: 'records' })
SafetyExamRecord.belongsTo(SafetyExam, { foreignKey: 'exam_id', as: 'exam' })
SafetyExamRecord.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })

StudentInfo.hasMany(FamilyInfo, { foreignKey: 'student_id', as: 'familyMembers' })
FamilyInfo.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })

StudentInfo.hasMany(EmergencyContact, { foreignKey: 'student_id', as: 'emergencyContacts' })
EmergencyContact.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })

StudentInfo.hasMany(IncidentReport, { foreignKey: 'student_id', as: 'incidentReports' })
IncidentReport.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })
IncidentReport.belongsTo(User, { foreignKey: 'handler_id', as: 'handler' })

ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' })
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' })

Announcement.belongsTo(User, { foreignKey: 'publisher_id', as: 'publisher' })
Announcement.hasMany(AnnouncementRead, { foreignKey: 'announcement_id', as: 'reads' })
AnnouncementRead.belongsTo(Announcement, { foreignKey: 'announcement_id', as: 'announcement' })
AnnouncementRead.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Feedback.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })
Feedback.belongsTo(User, { foreignKey: 'replier_id', as: 'replier' })

Event.belongsTo(User, { foreignKey: 'publisher_id', as: 'publisher' })
Event.hasMany(EventRegistration, { foreignKey: 'event_id', as: 'registrations' })
EventRegistration.belongsTo(Event, { foreignKey: 'event_id', as: 'event' })
EventRegistration.belongsTo(StudentInfo, { foreignKey: 'student_id', as: 'student' })

module.exports = {
  sequelize, User, StudentInfo,
  LateReturnRecord, LeaveRecord, SafetyExam, SafetyQuestion, SafetyExamRecord,
  IncidentReport, FamilyInfo, EmergencyContact, ChatMessage, Announcement, AnnouncementRead, Feedback, Event, EventRegistration,
}
