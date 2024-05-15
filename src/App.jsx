import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GuessCountriesGame() {
  const [countries, setCountries] = useState([]);
  const [guessedCountries, setGuessedCountries] = useState(new Set());
  const [currentGuess, setCurrentGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState();
  const [timerRunning, setTimerRunning] = useState(true);
  const [timeGiven, setTimeGiven] = useState();
  const [gameOver, setGameOver] = useState(false);
  const [nickname, setNickName] = useState();
  const [binId, setBinId] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const apiKey = '$2a$10$3ehE2pQUumQnbWfrY66jh.6FZS/Op2.aWOdh91Dvmwy/jE3HEVCjq'; // Replace with your jsonbin.io API key
  const jsonBinUrl = 'https://api.jsonbin.io/v3/b';
  const apiaccess = '$2a$10$yud0GQw8kEjDgiI2DLiiR.UCvhoAZd8XrRyYcEIpYE5piwAWJpnp6';
  
  useEffect(() => {
    if (!initialized) {
      handleInitialSetup();
      fetchCountries();
      fetchLeaderboardData();
      setInitialized(true);
    }

    if (!timerRunning && timeLeft === 0 && binId) {
      saveGameData();
    }
  }, [timerRunning, timeLeft, binId, initialized]);

  useEffect(() => {
    if (timerRunning) {
      const interval = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft > 0) {
            return prevTimeLeft - 1;
          } else {
            setTimerRunning(false);
            clearInterval(interval);
            setGameOver(true);
            return 0;
          }
        });
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [timerRunning]);

  const handleInitialSetup = () => {
    const getname = prompt("Enter your nickname:", "rick");
    setNickName(getname);
    const gameDuration = prompt("Enter the desired game time in seconds:", "180");
    if (gameDuration !== null && !isNaN(gameDuration) && parseInt(gameDuration) > 0) {
      setTimeLeft(parseInt(gameDuration));
      setTimeGiven(parseInt(gameDuration));
    } else {
      alert("Invalid input! Defaulting to 180 seconds.");
      setTimeLeft(180);
    }
  };

  const fetchCountries = () => {
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        setCountries(response.data);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  };

  const fetchLeaderboardData = () => {
    axios.get(jsonBinUrl, {
      headers: {
        'X-Master-Key': apiKey, 
        'X-Access-Key': apiaccess,
      }
    }).then(response => {
      const leaderboardData = response.data;
      setLeaderboardData(leaderboardData);
    }).catch(error => {
      console.error('Error fetching leaderboard data:', error);
    });
  };
  

  const saveGameData = () => {
    const postData = {
      name: nickname,
      score: guessedCountries.size,
      time: timeGiven,
      points: guessedCountries.size / timeGiven,
    };

    const url = binId ? `${jsonBinUrl}/${binId}` : "https://api.jsonbin.io/v3/";
    const method = binId ? 'put' : 'post';

    axios[method](url, postData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
        'X-Bin-Private': false,
      }
    }).then(response => {
      console.log(binId ? 'Document updated:' : 'Bin created:', response.data);
      setBinId(response.data.metadata.id);
      fetchLeaderboardData();
    }).catch(error => {
      console.error(binId ? 'Error updating document:' : 'Error creating bin:', error);
    });
  };

  const handleGuessChange = (event) => {
    setCurrentGuess(event.target.value);
  };

  const handleSubmitGuess = (event) => {
    event.preventDefault();
    if (currentGuess.trim() === '' || !timerRunning || gameOver) return;
    const countryName = currentGuess.trim().toLowerCase();
    const country = countries.find(country =>
      country.name.common.toLowerCase() === countryName ||
      (country.altSpellings && country.altSpellings.some(altSpelling => altSpelling.toLowerCase() === countryName))
    );
    if (country) {
      setGuessedCountries(new Set(guessedCountries.add(country.name.common)));
    }
    setCurrentGuess('');
  };

  const handleResign = () => {
    setTimerRunning(false);
    setGameOver(true);
    alert('You resigned!');
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Guess All Countries in {timeGiven} seconds - Rudransh 😈</h1>
      <p className="text-lg mb-4">Time left: {timeLeft} seconds</p>
      <form onSubmit={handleSubmitGuess} className="mb-8">
        <label className="block mb-2">
          Guess a country:
          <input type="text" value={currentGuess} onChange={handleGuessChange} className="mt-1 p-2 border rounded w-full" disabled={!timerRunning || gameOver} />
        </label>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" disabled={!timerRunning || gameOver}>Submit Guess</button>
      </form>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Guessed Countries: {guessedCountries.size}</h2>
        <ul>
          {[...guessedCountries].map((country, index) => (
            <li key={index} className="mb-1">{country}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleResign} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" disabled={!timerRunning || gameOver}>Resign</button>

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
            {leaderboardData.map((bin, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{bin.metadata.id}</td>
                <td className="border px-4 py-2">{JSON.stringify(bin.record)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GuessCountriesGame;
