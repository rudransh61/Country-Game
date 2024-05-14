import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [bins, setBins] = useState([]);
  const apiKey = '<YOUR_API_KEY>'; // Replace with your JSONBin.io API key
  const jsonBinUrl = 'https://api.jsonbin.io/v3/b';

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = () => {
    axios.get(jsonBinUrl, {
      headers: {
        'X-Master-Key': apiKey,
      }
    })
    .then(response => {
      setBins(response.data);
    })
    .catch(error => {
      console.error('Error fetching bins:', error);
    });
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Bin ID</th>
            <th className="px-4 py-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((bin, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{bin.metadata.id}</td>
              <td className="border px-4 py-2">{JSON.stringify(bin.record)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
