import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const handleDownloadPdf = (row) => {
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.width = '595px'; // A4 width in px

  const formattedDate = new Date(row.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const monthName = new Date(row.date).toLocaleString('en-IN', {
    month: 'long',
  });

  const capitalizedStatus = row.status.charAt(0).toUpperCase() + row.status.slice(1);

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(row.amount);

  const pfCut = 1000;
  const taxCut = 2500;
  const netSalary = row.amount - taxCut - pfCut;

  pdfContainer.innerHTML = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 700px; margin: auto; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="/image.png" alt="Company Logo" style="width: 120px;" />
      <h2 style="margin: 10px 0 0; color: #222;">Wepro Solutions Pvt. Ltd.</h2>
      <p style="margin: 2px 0; font-size: 12px; color: #555;">Sector 74 , Industrial Area, Mohali City(Punjab), India</p>
      <p style="margin: 2px 0 0; font-size: 12px; color: #555;">Email: hr@weproinc.com | Phone: +91 98765 43210</p>
    </div>

    <!-- Title -->
    <h1 style="text-align: center; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; margin-bottom: 30px;">Salary Slip - ${monthName}</h1>

    <!-- Introduction -->
    <p style="font-size: 14px; color: #333; margin-bottom: 25px;">
      Dear <strong>${row?.user}</strong>,<br />
      We are pleased to confirm the disbursement of your salary for the month of <strong>${monthName}</strong>. Below is the detailed salary breakdown:
    </p>

    <!-- Salary Table -->
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
      <tbody>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Employee Name</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${row?.user}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Gross Salary</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${formattedAmount}</td>
        </tr>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Tax Deduction (TDS)</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">₹${taxCut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Provident Fund (PF)</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">₹${pfCut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        </tr>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Net Salary</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right; font-weight: bold; color: #2c3e50;">
            ₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Date of Payment</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${formattedDate}</td>
        </tr>
        <tr style="background-color: #f0f4f7;">
          <td style="padding: 10px; border: 1px solid #ccc; font-weight: 400;">Payment Status</td>
          <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${capitalizedStatus}</td>
        </tr>
      </tbody>
    </table>

       <!-- Signature -->
    <div style="margin-top: 60px; text-align: right;">
      <p style="margin-bottom: 5px;">Authorized Signatory</p>
      <img src="/signature.png" alt="Signature" style="width: 120px; margin-bottom: 5px; display: block; margin-left: auto;" />
       <p style="font-size: 15px;">Nitin Goswami</p>
      <p style="font-size: 12px; margin: 0;">CEO & Founder</p>
    </div>
  </div>
`;

  document.body.appendChild(pdfContainer);

  html2canvas(pdfContainer, {
    scale: 2,
    useCORS: true,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${row?.user}_SalarySlip.pdf`);

    document.body.removeChild(pdfContainer);
  });
};
