import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import '../../App.css';
import '../moodsurvey.css';

const MoodSurvey = () => {
  const [dayQuality, setDayQuality] = useState('good');
  const [exerciseTime, setExerciseTime] = useState('no');
  const [mealsCount, setMealsCount] = useState('one');
  const [extraDetails, setExtraDetails] = useState('');
  const [moodScore, setMoodScore] = useState(null);
  const [suggestions, setSuggestions] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [sectionBackgroundColor, setSectionBackgroundColor] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previousSurveys, setPreviousSurveys] = useState([]);
  const [searchDate, setSearchDate] = useState('');

  const user = auth.currentUser;

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      positive: '🚶‍♂️😊',
      neutral: '🚶‍♂️😐',
      negative: '🚶‍♂️😞',
    };
    return moodEmojis[mood] || '';
  };

  const updateBackgroundColors = (mood) => {
    const moodColors = {
      positive: { main: 'rgba(119, 221, 119, 0.8)', section: 'rgba(119, 221, 119, 0.2)' },
      neutral: { main: 'rgba(192, 192, 192, 0.8)', section: 'rgba(192, 192, 192, 0.2)' },
      negative: { main: 'rgba(200, 100, 100, 0.8)', section: 'rgba(200, 100, 100, 0.2)' }
    };
    const colors = moodColors[mood] || moodColors['neutral'];
    setBackgroundColor(colors.main);
    setSectionBackgroundColor(colors.section);
  };

  const fetchMoodAnalysis = async (data) => {
    try {
      const response = await fetch('http://localhost:9000/api/survey/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error analyzing mood:', error);
    }
  };

  const handleMoodAnalysisResult = async (result) => {
    const { mood, score, suggestions } = result;
    alert(`Your mood is: ${mood}`);
    setMoodScore(score);
    setSuggestions(suggestions);
    updateBackgroundColors(mood);
    setShowSuggestions(true);

    if (user) {
      const surveyData = {
        dayQuality,
        exerciseTime,
        mealsCount,
        extraDetails,
        moodScore: score,
        suggestions,
        timestamp: new Date(),
      };

      try {
        const surveyDocRef = doc(db, "users", user.uid, "moodSurveys", `${new Date().toISOString()}`);
        await setDoc(surveyDocRef, surveyData);
        console.log("Mood survey results saved to Firestore:", surveyData);
      } catch (error) {
        console.error("Error saving mood survey results:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { description: dayQuality, extraDetails, exerciseTime, mealsCount };
    const result = await fetchMoodAnalysis(data);
    handleMoodAnalysisResult(result);
  };

  const fetchPreviousSurveys = async () => {
    if (user) {
      const surveysCollectionRef = collection(db, "users", user.uid, "moodSurveys");
      const q = query(surveysCollectionRef, where("timestamp", ">=", new Date(searchDate)));
      const querySnapshot = await getDocs(q);
      const surveys = querySnapshot.docs.map(doc => doc.data());
      setPreviousSurveys(surveys);
    }
  };

  useEffect(() => {
    if (backgroundColor) {
      document.body.style.backgroundColor = backgroundColor;
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [backgroundColor]);

  return (
    <div className="survey-page-container">
      <div className="survey-flex-container">
        <FormSection
          dayQuality={dayQuality}
          setDayQuality={setDayQuality}
          exerciseTime={exerciseTime}
          setExerciseTime={setExerciseTime}
          mealsCount={mealsCount}
          setMealsCount={setMealsCount}
          extraDetails={extraDetails}
          setExtraDetails={setExtraDetails}
          handleSubmit={handleSubmit}
        />
        
        {showSuggestions && (
          <ProgressSection
            moodScore={moodScore}
            suggestions={suggestions}
            sectionBackgroundColor={sectionBackgroundColor}
            getMoodEmoji={getMoodEmoji}
          />
        )}

        <div className="previous-surveys-section">
          <h3>Search Previous Surveys</h3>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <button onClick={fetchPreviousSurveys}>Fetch Surveys</button>
          <ul>
            {previousSurveys.map((survey, index) => (
              <li key={index}>
                <p><strong>Date:</strong> {new Date(survey.timestamp.seconds * 1000).toLocaleDateString()}</p>
                <p><strong>Mood Score:</strong> {survey.moodScore}</p>
                <p><strong>Suggestions:</strong> {survey.suggestions}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const FormSection = ({
  dayQuality, setDayQuality,
  exerciseTime, setExerciseTime,
  mealsCount, setMealsCount,
  extraDetails, setExtraDetails,
  handleSubmit,
}) => (
  <div className="form-section">
    <h1 className="form-title">Mood Survey</h1>
    <form className="form-container" onSubmit={handleSubmit}>
      <FormGroup
        label="1. How was your day?"
        value={dayQuality}
        onChange={setDayQuality}
        options={['good', 'okay', 'bad']}
      />
      <FormGroup
        label="2. Did you spend time exercising?"
        value={exerciseTime}
        onChange={setExerciseTime}
        options={['yes', 'no']}
      />
      <FormGroup
        label="3. How many meals did you eat today?"
        value={mealsCount}
        onChange={setMealsCount}
        options={['one', 'two', 'three']}
      />
      <div className="form-group">
        <label className="form-label">4. Any extra details you'd like to share?</label>
        <textarea
          className="form-control description-box"
          rows="5"
          placeholder="Enter any extra details in terms of health..."
          value={extraDetails}
          onChange={(e) => setExtraDetails(e.target.value)}
        />
      </div>
      <div class="button-container">
        <button className="submit-button" type="submit">
          Analyze Mood
        </button>
      </div>
    </form>
  </div>
);

const FormGroup = ({ label, value, onChange, options }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <select className="form-control" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

const ProgressSection = ({ moodScore, suggestions, sectionBackgroundColor, getMoodEmoji }) => (
  <div className="progress-suggestions-section" style={{ backgroundColor: sectionBackgroundColor }}>
    {moodScore !== null && (
      <div className="progress-container">
        <h3>Your Mood Score</h3>
        <CircularProgressbar
          value={Math.abs(moodScore)}
          text={`${moodScore}`}
          maxValue={10}
          minValue={-10}
          styles={buildStyles({
            pathColor: moodScore > 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)',
            textColor: 'white',
            trailColor: 'white',
          })}
        />
        <div className="mood-emoji" style={{ fontSize: '2rem', marginTop: '10px' }}>
          {getMoodEmoji(moodScore > 0 ? 'positive' : moodScore === 0 ? 'neutral' : 'negative')}
        </div>
      </div>
    )}
    <div className="suggestions-container">
      <h3>Suggestions for Tomorrow</h3>
      <p>{suggestions}</p>
    </div>
  </div>
);

export default MoodSurvey;
