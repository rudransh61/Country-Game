import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [bins, setBins] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const apiKey = '$2a$10$3ehE2pQUumQnbWfrY66jh.6FZS/Op2.aWOdh91Dvmwy/jE3HEVCjq'; // Replace with your JSONBin.io API key
  const jsonBinUrl = 'https://api.jsonbin.io/v3/b';

  useEffect(() => {
    if (!initialized) {
      fetchBins();
      setInitialized(true);
    }
  }, [initialized]);

  const fetchBins = () => {
    axios.get(jsonBinUrl, {
      headers: {
        'X-Master-Key': apiKey,
        'X-Access-Key': "$2a$10$yud0GQw8kEjDgiI2DLiiR.UCvhoAZd8XrRyYcEIpYE5piwAWJpnp6",
      }
    })
      .then(response => {
        setBins(response.data);
        console.log(bins)
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
