import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Leaderboard from './Leaderboard';

function GuessCountriesGame() {
  const [countries, setCountries] = useState([]);
  const [guessedCountries, setGuessedCountries] = useState(new Set());
  const [currentGuess, setCurrentGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(); // 3 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(true);
  const [timeGiven, setTimeGiven] = useState();
  const [promptShown, setPromptShown] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [nickname, setNickName] = useState();
  const [binId, setBinId] = useState(null); // To store the bin id returned by jsonbin.io
  const [leaderboardData, setLeaderboardData] = useState([]);
  const apiKey = '$2a$10$3ehE2pQUumQnbWfrY66jh.6FZS/Op2.aWOdh91Dvmwy/jE3HEVCjq'; // Replace with your jsonbin.io API key
  const jsonBinUrl = 'https://api.jsonbin.io/v3/b';

  useEffect(() => {
    if (!promptShown) {
      const getname = prompt("Enter your nickname:", "rick")
      setNickName(getname)
      const gameDuration = prompt("Enter the desired game time in seconds:", "180");
      if (gameDuration !== null && !isNaN(gameDuration) && parseInt(gameDuration) > 0) {
        setTimeLeft(parseInt(gameDuration));
        setTimeGiven(parseInt(gameDuration));
      } else {
        alert("Invalid input! Defaulting to 180 seconds.");
        setTimeLeft(180);
      }
      setPromptShown(true);
    }

    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        setCountries(response.data);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, [promptShown]);

  useEffect(() => {
    let timer;
    if (timerRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      setGameOver(true);
      alert('Time is up!');
      if (binId) {
        // Save data to jsonbin.io
        axios.post(`${jsonBinUrl}/${binId}`, {
          name: nickname,
          score: guessedCountries.size,
          time: timeGiven,
          points: guessedCountries.size / timeGiven,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': apiKey,
          }
        }).then(response => {
          console.log('Document updated:', response.data);
          fetchLeaderboardData();
        }).catch(error => {
          console.error('Error updating document:', error);
        });
      } else {
        // Create a new bin on jsonbin.io
        axios.post(jsonBinUrl, {
          name: nickname,
          score: guessedCountries.size,
          time: timeGiven,
          points: guessedCountries.size / timeGiven,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': apiKey,
          }
        }).then(response => {
          console.log('Bin created:', response.data);
          setBinId(response.data.metadata.id);
          fetchLeaderboardData();
        }).catch(error => {
          console.error('Error creating bin:', error);
        });
      }
    }
    return () => clearTimeout(timer);
  }, [timerRunning, timeLeft, binId]);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = () => {
    axios.get(jsonBinUrl, {
      headers: {
        'X-Master-Key': apiKey,
      }
    }).then(response => {
      const leaderboardData = response.data.records.filter(record => record.name && record.score);
      setLeaderboardData(leaderboardData);
    }).catch(error => {
      console.error('Error fetching leaderboard data:', error);
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

     {/* <Leaderboard/> */}
    </div>
  );
}

export default GuessCountriesGame;
