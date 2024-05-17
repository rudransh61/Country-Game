import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Client, Databases, ID ,Query } from 'appwrite'; // Import Client and Databases from 'appwrite'

function GuessCountriesGame() {
  const [countries, setCountries] = useState([]);
  const [guessedCountries, setGuessedCountries] = useState(new Set());
  const [currentGuess, setCurrentGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState();
  const [timerRunning, setTimerRunning] = useState(true);
  const [timeGiven, setTimeGiven] = useState();
  const [nickname, setNickname] = useState('');
  const [promptShown, setPromptShown] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [createentry, setentry] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const apiUrl = 'https://restcountries.com/v3.1/all';

  // Instantiate the Appwrite client
  const client = new Client();
  client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_PROJECTID); // Replace 'PROJECT_ID' with your actual project ID

  const databases = new Databases(client);

  useEffect(() => {
    if (!promptShown) {
      const userNickname = prompt("Enter your nickname:", "rick");
      if (userNickname !== null && userNickname.trim() !== '') {
        setNickname(userNickname);
      }
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

    axios.get(apiUrl)
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
      if(createentry){
        const promise = databases.createDocument(
          import.meta.env.VITE_DATABASEID, // Replace 'DATABASE_ID' with your actual database ID
          import.meta.env.VITE_COLLECTIONID, // Replace 'COLLECTION_ID' with your actual collection ID
          ID.unique(),
          {
            "name": nickname,
            "score": guessedCountries.size,
            "time": timeGiven,
            "points":guessedCountries.size/timeGiven,
          }
        );
        
        promise.then(response => {
          console.log('Document created:', response);
        }).catch(error => {
          console.error('Error creating document:', error);
        });
        setentry(false)
      }
    }
    return () => clearTimeout(timer);
  }, [timerRunning, timeLeft]);

  useEffect(() => {
    // Fetch leaderboard data
    const getLeaderboard = async () => {
      try {
        const response = await databases.listDocuments(
          import.meta.env.VITE_DATABASEID, // Replace 'DATABASE_ID' with your actual database ID
          import.meta.env.VITE_COLLECTIONID, // Replace 'COLLECTION_ID' with your actual collection ID
          [Query.orderDesc('points')],
        );
        setLeaderboard(response.documents);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    getLeaderboard();
  }, []);

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

      // Create document in Appwrite database

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
      <h1 className="text-3xl font-bold mb-4">Guess All Countries in {timeGiven} seconds - by Rudransh 😈</h1>
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

      {/* Leaderboard */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
        <ol>
          {leaderboard.map((entry, index) => (
            <li key={index} className="mb-1">{entry.name} - Score: {entry.points*100} - Time: {entry.time} </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default GuessCountriesGame;
