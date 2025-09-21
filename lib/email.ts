// Email notification service
// This is a simplified version - in production, you'd use a proper email service like SendGrid, Resend, or AWS SES

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailData) {
  // In a real implementation, you would:
  // 1. Use a proper email service (SendGrid, Resend, AWS SES, etc.)
  // 2. Store email templates
  // 3. Handle email queues and retries
  // 4. Track email delivery status
  
  console.log('Email would be sent:', {
    to,
    subject,
    html,
    text
  })
  
  // For now, just log the email details
  // In production, replace this with actual email sending logic
  return { success: true, messageId: 'mock-message-id' }
}

export async function sendAbsenceNotification(studentName: string, parentEmail: string, date: string, batchName: string) {
  const subject = `Attendance Alert: ${studentName} was absent on ${date}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Attendance Alert</h2>
      <p>Dear Parent/Guardian,</p>
      <p>This is to inform you that <strong>${studentName}</strong> was marked absent on <strong>${date}</strong> for the batch <strong>${batchName}</strong>.</p>
      <p>If you have any questions or concerns, please contact the coaching center.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from the Coaching Management System.
      </p>
    </div>
  `
  
  return sendEmail({
    to: parentEmail,
    subject,
    html
  })
}

export async function sendFeeDueNotification(studentName: string, parentEmail: string, amount: number, dueDate: string, batchName: string) {
  const subject = `Fee Reminder: Payment due for ${studentName}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">Fee Reminder</h2>
      <p>Dear Parent/Guardian,</p>
      <p>This is a reminder that the fee payment for <strong>${studentName}</strong> is due.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Batch:</strong> ${batchName}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
      </div>
      <p>Please make the payment at your earliest convenience to avoid any late fees.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from the Coaching Management System.
      </p>
    </div>
  `
  
  return sendEmail({
    to: parentEmail,
    subject,
    html
  })
}

export async function sendFeeOverdueNotification(studentName: string, parentEmail: string, amount: number, dueDate: string, batchName: string) {
  const subject = `URGENT: Overdue Fee Payment for ${studentName}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Overdue Fee Payment</h2>
      <p>Dear Parent/Guardian,</p>
      <p>This is an urgent reminder that the fee payment for <strong>${studentName}</strong> is now overdue.</p>
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Batch:</strong> ${batchName}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p style="color: #dc2626; font-weight: bold;">Status: OVERDUE</p>
      </div>
      <p>Please contact the coaching center immediately to resolve this matter.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from the Coaching Management System.
      </p>
    </div>
  `
  
  return sendEmail({
    to: parentEmail,
    subject,
    html
  })
}
