import React , {useState, useReducer, useEffect, useCallback} from "react";
import SelectField from "./components/Select.jsx";
import listOfGenreOption from "./store/genre.json";
import listOfMoodOption from "./store/mood.json";
import "./App.css"

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_GENRE':
      return { ...state, genre: action.payload, mood: "" };
    case 'SET_MOOD':
      return { ...state, mood: action.payload };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'SET_AI_RESPONSES':
      return { ...state, aiResponses: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    genre: "",
    mood: "",
    level: "",
    aiResponses: []
  });

  

  const availableMoodBasedOnGenre = listOfMoodOption[state.genre] || []

  
  const fetchRecommendations = useCallback(async () => {
    const { genre, mood, level } = state;
    if (!genre || !mood || !level) {
        alert("Please select all options first!");
        return;
    }

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
    
    const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
    dispatch({ type: 'START_LOADING' });

    try {
      const response = await fetch(URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Return the list clearly.`
                  }]
              }]
          }),
        }
      );
      
      const data = await response.json();

      if (data.error) {
         throw new Error(data.error.message);
      }

      dispatch({ type: "SET_AI_RESPONSES", payload: data?.candidates || [] });
      
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
      dispatch({ type: "SET_AI_RESPONSES", payload: [] });
    }
  }, [state.genre, state.mood, state.level]);
   useEffect(() => {
     
     if (state.genre && state.mood && state.level) {
       fetchRecommendations();
     }
   }, [state.genre, state.mood, state.level, fetchRecommendations]);


  return (
    <section>
      <h1>Book Recommender</h1>

      <SelectField
        placeholder="Please select a genre"
        id="genre"
        options={listOfGenreOption}
        value={state.genre}
        onSelect={(value) => dispatch({ type: "SET_GENRE", payload: value })}
      />

      <SelectField
        placeholder="Please select a mood"
        id="mood"
        options={availableMoodBasedOnGenre}
        value={state.mood}
        onSelect={(value) => dispatch({ type: "SET_MOOD", payload: value })}
      />

      <SelectField
        placeholder="Please select your level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={state.level}
        onSelect={(value) => dispatch({ type: "SET_LEVEL", payload: value })}
      />

      <button onClick={fetchRecommendations}>Get Recommendation</button>

      <br />
      <br />

      {state.aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend?.content?.parts?.[0]?.text}</p>
        </details>
      ))}
    </section>
  );
  }