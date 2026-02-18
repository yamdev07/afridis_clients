import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import pdfToText from 'react-pdftotext';
import "../styles/Import.css";
import Sidebar from './Sidebar';

export default function Import ()  {
  const [extractedData, setExtractedData] = useState({
    report_date: '',
    commercial_login: '',
    full_name: '',
    line_number: '',
    phone: '',
    email: '',
    location: '',
    offer: '',
    payer_number: '',
    subscription_date: '',
    installation_date: '',
    payment_reference: '',
    notes: '',
    client_type: 'B2C',
  });
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      pdfToText(file)
        .then(text => {
          // Parse the text to extract fields assuming format like "key: value"
          const data = {
            report_date: text.match(/report_date:\s*([^\n]+)/i)?.[1]?.trim() || '',
            commercial_login: text.match(/commercial_login:\s*([^\n]+)/i)?.[1]?.trim() || '',
            full_name: text.match(/full_name:\s*([^\n]+)/i)?.[1]?.trim() || '',
            line_number: text.match(/line_number:\s*([^\n]+)/i)?.[1]?.trim() || '',
            phone: text.match(/phone:\s*([^\n]+)/i)?.[1]?.trim() || '',
            email: text.match(/email:\s*([^\n]+)/i)?.[1]?.trim() || '',
            location: text.match(/location:\s*([^\n]+)/i)?.[1]?.trim() || '',
            offer: text.match(/offer:\s*([^\n]+)/i)?.[1]?.trim() || '',
            payer_number: text.match(/payer_number:\s*([^\n]+)/i)?.[1]?.trim() || '',
            subscription_date: text.match(/subscription_date:\s*([^\n]+)/i)?.[1]?.trim() || '',
            installation_date: text.match(/installation_date:\s*([^\n]+)/i)?.[1]?.trim() || '',
            payment_reference: text.match(/payment_reference:\s*([^\n]+)/i)?.[1]?.trim() || '',
            notes: text.match(/notes:\s*([^\n]+)/i)?.[1]?.trim() || '',
            client_type: text.match(/client_type:\s*([^\n]+)/i)?.[1]?.trim() || 'B2C',
          };
          setExtractedData(data);
          setError('');
        })
        .catch(err => {
          console.error('Failed to extract text from PDF:', err);
          setError('Failed to extract text from PDF.');
        });
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  return (
    <div className="container mt-4">
      <Sidebar/>
      <h2>Import PDF File</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="form-control mb-3" />
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Extracted Data</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Report Date: {extractedData.report_date}</li>
            <li className="list-group-item">Commercial Login: {extractedData.commercial_login}</li>
            <li className="list-group-item">Full Name: {extractedData.full_name}</li>
            <li className="list-group-item">Line Number: {extractedData.line_number}</li>
            <li className="list-group-item">Phone: {extractedData.phone}</li>
            <li className="list-group-item">Email: {extractedData.email}</li>
            <li className="list-group-item">Location: {extractedData.location}</li>
            <li className="list-group-item">Offer: {extractedData.offer}</li>
            <li className="list-group-item">Payer Number: {extractedData.payer_number}</li>
            <li className="list-group-item">Subscription Date: {extractedData.subscription_date}</li>
            <li className="list-group-item">Installation Date: {extractedData.installation_date}</li>
            <li className="list-group-item">Payment Reference: {extractedData.payment_reference}</li>
            <li className="list-group-item">Notes: {extractedData.notes}</li>
            <li className="list-group-item">Client Type: {extractedData.client_type}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};