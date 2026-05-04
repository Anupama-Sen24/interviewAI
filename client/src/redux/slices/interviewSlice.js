import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questions: JSON.parse(localStorage.getItem('questions')) || null,
  extractedData: JSON.parse(localStorage.getItem('extractedData')) || null,
  evaluation: JSON.parse(localStorage.getItem('userAnswers')) || null,
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
    }
  },
});

export const { setQuestions, setExtractedData, setEvaluation, setSetupData, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
