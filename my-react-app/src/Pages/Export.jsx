import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import "../styles/Export.css";
import Sidebar from './Sidebar';

export default  function Export ({ data })  {
  const handleExport = () => {
    const doc = new jsPDF();
    let y = 10;
    Object.entries(data).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 10, y);
      y += 10;
    });
    doc.save('exported_data.pdf');
  };

  return (
    <div className="container mt-4">
      <Sidebar/>
      <h2>Export to PDF</h2>
      <button className="btn btn-primary" onClick={handleExport}>Export Data to PDF</button>
    </div>
  );
};

// Example usage: <FileExport data={{report_date: '2023-01-01', ...}} />