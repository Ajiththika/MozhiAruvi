import TutorApplication from '../models/TutorApplication.js';
import User from '../models/User.js';
import { ROLES } from '../utils/roles.js';

/**
 * Submit a new tutor application
 */
export async function submitApplication(userId, applicationData) {
  // Check if there's already a pending or approved application
  const existingApp = await TutorApplication.findOne({ 
    userId, 
    status: { $in: ['pending', 'approved'] } 
  });
  
  if (existingApp) {
    throw new Error('You already have a pending or approved tutor application.');
  }

  const application = new TutorApplication({
    userId,
    ...applicationData,
    status: 'pending'
  });

  await application.save();

  // Update user tutorStatus to pending (Keeping role as 'student' until approved)
  await User.findByIdAndUpdate(userId, {
    tutorStatus: 'pending'
  });

  return application;
}

/**
 * Get all tutor applications (Admin)
 */
export async function getAllApplications() {
  return await TutorApplication.find().populate('userId', 'name email').sort({ createdAt: -1 });
}

/**
 * Approve a tutor application
 */
export async function approveApplication(applicationId) {
  const application = await TutorApplication.findById(applicationId);
  if (!application) throw new Error('Application not found');
  
  application.status = 'approved';
  await application.save();

  // Update user to tutor
  await User.findByIdAndUpdate(application.userId, {
    role: ROLES.TUTOR,
    tutorStatus: 'approved'
  });

  return application;
}

/**
 * Reject a tutor application
 */
export async function rejectApplication(applicationId, adminNotes) {
  const application = await TutorApplication.findById(applicationId);
  if (!application) throw new Error('Application not found');

  application.status = 'rejected';
  if (adminNotes) application.adminNotes = adminNotes;
  await application.save();

  // Update user tutorStatus to rejected (Keeping role as 'student')
  await User.findByIdAndUpdate(application.userId, {
    tutorStatus: 'rejected'
  });

  return application;
}
