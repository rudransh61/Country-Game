import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Client } from 'appwrite';
// import { account, ID } from './lib/appwrite';

function GuessCountriesGame() {
  const [countries, setCountries] = useState([]);
  const [guessedCountries, setGuessedCountries] = useState(new Set());
  const [currentGuess, setCurrentGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(); // 3 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(true);
  const [timeGiven, setTimeGiven] = useState();
  const [promptShown, setPromptShown] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const apiUrl = 'https://restcountries.com/v3.1/all';

  useEffect(() => {
    // Ask user for input for game time only when the component mounts and promptShown is false
    if (!promptShown) {
      const gameDuration = prompt("Enter the desired game time in seconds:", "180");
      if (gameDuration !== null && !isNaN(gameDuration) && parseInt(gameDuration) > 0) {
        setTimeLeft(parseInt(gameDuration));
        setTimeGiven(parseInt(gameDuration));
      } else {
        alert("Invalid input! Defaulting to 180 seconds.");
        setTimeLeft(180);
      }
      setPromptShown(true); // Set promptShown to true after showing the prompt
    }

    // Fetch countries data from API
    axios.get(apiUrl)
      .then(response => {
        setCountries(response.data);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, [promptShown]); // Run the effect only when promptShown changes

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      setGameOver(true);
      alert('Time is up!');
      const client = new Client();
      const database = client.Database(client);

      const databaseId = '664066d000373eaae143';
      const collectionId = '664066de0001362c9bd1';
      const uniqueId = client.ID.unique(); // Optional: Generate a unique ID

      const post = {
        body: 'This is the body of my new post',
      };

      database.createDocument(databaseId, collectionId, uniqueId, post);

    }
    return () => clearTimeout(timer);
  }, [timerRunning, timeLeft]);

  // Event handler for guess input
  const handleGuessChange = (event) => {
    setCurrentGuess(event.target.value);
  };

  // Event handler for submitting guess
  const handleSubmitGuess = (event) => {
    event.preventDefault();
    if (currentGuess.trim() === '' || !timerRunning || gameOver) return; // Ignore empty guesses or guesses after game over
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

  // Event handler for resigning
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
    </div>
  );
}

export default GuessCountriesGame;
