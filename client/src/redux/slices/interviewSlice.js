import { createSlice } from '@reduxjs/toolkit';

// ✅ Safe parser
const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined") return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const initialState = {
  questions: safeParse('questions'),
  extractedData: safeParse('extractedData'),
  evaluation: safeParse('userAnswers'),
  setupData: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
      localStorage.setItem('questions', JSON.stringify(action.payload));
    },
    setExtractedData: (state, action) => {
      state.extractedData = action.payload;
      localStorage.setItem('extractedData', JSON.stringify(action.payload));
    },
    setEvaluation: (state, action) => {
      state.evaluation = action.payload;
      localStorage.setItem('userAnswers', JSON.stringify(action.payload));
    },
    setSetupData: (state, action) => {
      state.setupData = action.payload;
    },
    resetInterview: (state) => {
      state.questions = null;
      state.setupData = null;
      state.evaluation = null;

      // optional cleanup
      localStorage.removeItem('questions');
      localStorage.removeItem('extractedData');
      localStorage.removeItem('userAnswers');
    }
  },
});

export const {
  setQuestions,
  setExtractedData,
  setEvaluation,
  setSetupData,
  resetInterview
} = interviewSlice.actions;

export default interviewSlice.reducer;