/* src/utils/exportUtils.js */

/**
 * Escapes a cell value for CSV formatting.
 */
const escapeCSVCell = (val) => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
};

/**
 * Exports data to CSV and triggers a browser download.
 * @param {Array<Object>} data 
 * @param {Array<{key: string, label: string}>} headers 
 * @param {string} filename 
 */
export const exportToCSV = (data, headers, filename = 'export.csv') => {
  const headerRow = headers.map(h => escapeCSVCell(h.label)).join(',');
  const rows = data.map(item => {
    return headers.map(h => {
      const val = h.key.split('.').reduce((obj, key) => (obj ? obj[key] : ''), item);
      return escapeCSVCell(val);
    }).join(',');
  });

  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports data to Excel format (HTML table based XLS compatibility) and triggers download.
 * @param {Array<Object>} data 
 * @param {Array<{key: string, label: string}>} headers 
 * @param {string} filename 
 */
export const exportToExcel = (data, headers, filename = 'export.xls') => {
  const tableHeaders = headers.map(h => `<th style="background-color: #8b5cf6; color: white; padding: 8px; border: 1px solid #ddd; text-align: left;">${h.label}</th>`).join('');
  const tableRows = data.map(item => {
    const cells = headers.map(h => {
      const val = h.key.split('.').reduce((obj, key) => (obj ? obj[key] : ''), item);
      return `<td style="padding: 8px; border: 1px solid #ddd;">${val === null || val === undefined ? '' : val}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Sheet1</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta charset="utf-8">
    </head>
    <body>
      <table style="border-collapse: collapse; font-family: sans-serif; width: 100%;">
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Renders data to a clean printable layout in a new window and triggers window.print().
 * @param {Array<Object>} data 
 * @param {Array<{key: string, label: string}>} headers 
 * @param {string} title 
 */
export const exportToPDF = (data, headers, title = 'Data Export') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocker is preventing export. Please allow pop-ups for this site.');
    return;
  }

  const tableHeaders = headers.map(h => `<th>${h.label}</th>`).join('');
  const tableRows = data.map(item => {
    const cells = headers.map(h => {
      const val = h.key.split('.').reduce((obj, key) => (obj ? obj[key] : ''), item);
      return `<td>${val === null || val === undefined ? '' : val}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #333;
            padding: 40px;
            background: #fff;
          }
          h1 {
            font-size: 24px;
            color: #8b5cf6;
            margin-bottom: 5px;
          }
          .timestamp {
            font-size: 12px;
            color: #666;
            margin-bottom: 30px;
            border-bottom: 2px solid #8b5cf6;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f3f4f6;
            color: #374151;
            font-weight: 600;
            text-align: left;
            padding: 12px 10px;
            border-bottom: 2px solid #e5e7eb;
            font-size: 13px;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div>
          <h1>${title}</h1>
          <div class="timestamp">Generated on ${new Date().toLocaleString()} | Intellitots ERP System</div>
        </div>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};
