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
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; border: 1px solid #ccc; width: 100%; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="/logo1.png" alt="Company Logo" style="width: 100px;" />
    </div>

    <h1 style="margin-bottom: 10px; font-weight: bold; color: #333;">Salary Slip</h1>

    <p style="font-size: 14px; line-height: 1.5; color: #555; margin-bottom: 30px;">
      Dear <strong>${row.user.name}</strong>,<br />
      We are pleased to confirm the processing of your salary for the month of <strong>${monthName}</strong>. Below is the detailed breakdown:
    </p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
      <tbody>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: left;">Name</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${row.user.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: left;">Gross Salary</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formattedAmount}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: left;">Tax Deduction (TDS)</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${taxCut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: left;">Provident Fund (PF)</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${pfCut.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: left;">Net Salary</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
            ₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: left;">Date</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formattedDate}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: left;">Status</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${capitalizedStatus}</td>
        </tr>
      </tbody>
    </table>

    <p style=" margin-top: 60px;">CEO/Founder Signature</p>
    <div style="margin-left: 200px; margin-top: 5px; text-align: center;">
      <img src="/signature.png" alt="Signature" style="width: 120px;" />
      </div>
  </div>
`;

  document.body.appendChild(pdfContainer);

  html2canvas(pdfContainer, { scale: 2, useCORS: true }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${row.user.name}_SalarySlip.pdf`);
    document.body.removeChild(pdfContainer);
  });
};
