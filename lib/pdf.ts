import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface AttendanceReportData {
  studentName: string
  studentId: string
  batchName: string
  period: string
  attendanceRecords: {
    date: string
    status: 'present' | 'absent' | 'late'
    remarks?: string
  }[]
  stats: {
    total: number
    present: number
    absent: number
    late: number
    percentage: number
  }
}

export function generateAttendanceReport(data: AttendanceReportData) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('Coaching Management System', 20, 30)
  doc.setFontSize(16)
  doc.text('Attendance Report', 20, 45)
  
  // Student Information
  doc.setFontSize(12)
  doc.text(`Student Name: ${data.studentName}`, 20, 65)
  doc.text(`Student ID: ${data.studentId}`, 20, 75)
  doc.text(`Batch: ${data.batchName}`, 20, 85)
  doc.text(`Period: ${data.period}`, 20, 95)
  
  // Statistics
  doc.setFontSize(14)
  doc.text('Attendance Summary', 20, 115)
  doc.setFontSize(12)
  doc.text(`Total Days: ${data.stats.total}`, 20, 130)
  doc.text(`Present: ${data.stats.present}`, 20, 140)
  doc.text(`Absent: ${data.stats.absent}`, 20, 150)
  doc.text(`Late: ${data.stats.late}`, 20, 160)
  doc.text(`Percentage: ${data.stats.percentage}%`, 20, 170)
  
  // Attendance Table
  doc.setFontSize(14)
  doc.text('Attendance Details', 20, 190)
  
  // Table headers
  doc.setFontSize(10)
  doc.text('Date', 20, 205)
  doc.text('Status', 80, 205)
  doc.text('Remarks', 120, 205)
  
  // Draw line under headers
  doc.line(20, 210, 190, 210)
  
  // Table data
  let yPosition = 220
  data.attendanceRecords.forEach((record, index) => {
    if (yPosition > 280) {
      doc.addPage()
      yPosition = 30
    }
    
    doc.text(record.date, 20, yPosition)
    doc.text(record.status.charAt(0).toUpperCase() + record.status.slice(1), 80, yPosition)
    doc.text(record.remarks || '-', 120, yPosition)
    
    yPosition += 10
  })
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(`Page ${i} of ${pageCount}`, 20, 290)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 120, 290)
  }
  
  return doc
}

export function downloadAttendanceReport(data: AttendanceReportData, filename?: string) {
  const doc = generateAttendanceReport(data)
  const fileName = filename || `attendance_report_${data.studentId}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export function generateFeeReceipt(data: {
  receiptNumber: string
  studentName: string
  studentId: string
  batchName: string
  amount: number
  paymentDate: string
  paymentMethod: string
}) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('Coaching Management System', 20, 30)
  doc.setFontSize(16)
  doc.text('Payment Receipt', 20, 45)
  
  // Receipt details
  doc.setFontSize(12)
  doc.text(`Receipt No: ${data.receiptNumber}`, 20, 65)
  doc.text(`Date: ${data.paymentDate}`, 20, 75)
  
  // Student information
  doc.setFontSize(14)
  doc.text('Student Information', 20, 95)
  doc.setFontSize(12)
  doc.text(`Name: ${data.studentName}`, 20, 110)
  doc.text(`Student ID: ${data.studentId}`, 20, 120)
  doc.text(`Batch: ${data.batchName}`, 20, 130)
  
  // Payment details
  doc.setFontSize(14)
  doc.text('Payment Details', 20, 150)
  doc.setFontSize(12)
  doc.text(`Amount: $${data.amount.toFixed(2)}`, 20, 165)
  doc.text(`Payment Method: ${data.paymentMethod}`, 20, 175)
  doc.text(`Payment Date: ${data.paymentDate}`, 20, 185)
  
  // Footer
  doc.setFontSize(10)
  doc.text('Thank you for your payment!', 20, 220)
  doc.text('This is a computer-generated receipt.', 20, 230)
  
  return doc
}

export function downloadFeeReceipt(data: any, filename?: string) {
  const doc = generateFeeReceipt(data)
  const fileName = filename || `receipt_${data.receiptNumber}.pdf`
  doc.save(fileName)
}

export async function generatePDFFromElement(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`)
  }
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  })
  
  const imgData = canvas.toDataURL('image/png')
  const doc = new jsPDF()
  
  const imgWidth = 210
  const pageHeight = 295
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  
  let position = 0
  
  doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    doc.addPage()
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }
  
  doc.save(filename)
}
