const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { extractResumeData, generateQuestions, evaluateSingleAnswerDetailed, evaluateInterview } = require('../services/aiService');
const Interview = require('../models/Interview');
const authMiddleware = require('./authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume (PDF)' });
    }

    const mode = req.body.mode || 'Technical Interview';
    const dataBuffer = req.file.buffer;
    let resumeText = '';
    try {
      const data = await pdf(dataBuffer);
      resumeText = data.text;
      console.log('✅ Extracted Resume Text (Length:', resumeText.length, ')');
    } catch (pdfError) {
      console.error('PDF parse error:', pdfError);
      resumeText = "Generic Software Engineer Resume";
    }

    try {
      // Step 1: Extract structured data
      const extractedData = await extractResumeData(resumeText);
      console.log('✅ Extracted Data:', extractedData);

      // Step 2: Generate questions based on extracted data & mode
      const questions = await generateQuestions(extractedData, resumeText, mode);
      console.log('✅ Generated Questions:', questions.length, 'Mode:', mode);

      res.json({ 
        success: true, 
        questions,
        extractedData,
        resumeText
      });
    } catch (aiError) {
      console.error('AI Service Error:', aiError);
      res.status(500).json({ error: aiError.message || 'Failed to analyze resume' });
    }
  } catch (error) {
    console.error('Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

router.post('/generate-questions', async (req, res) => {
  try {
    const { extractedData, resumeText, mode } = req.body;
    const questions = await generateQuestions(extractedData || {}, resumeText || '', mode || 'Technical Interview');
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Generate Questions Route Error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

router.post('/evaluate-single', async (req, res) => {
  try {
    const { question, answer, code } = req.body;
    const evaluation = await evaluateSingleAnswerDetailed(question, answer, code);
    res.json({ success: true, evaluation });
  } catch (error) {
    console.error('Single Eval Route Error:', error);
    res.status(500).json({ error: 'Failed to evaluate single answer' });
  }
});

router.post('/evaluate-answers', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const { uid, name, email } = req.user;
    
    const evaluation = await evaluateInterview(answers);

    // Save to MongoDB
    const newInterview = new Interview({
      userId: uid,
      userName: name || 'Candidate',
      userEmail: email,
      answers,
      questions: answers.map(a => a.question),
      evaluation,
      date: new Date()
    });
    await newInterview.save();

    res.json({ success: true, evaluation });
  } catch (error) {
    console.error('Eval Route Error:', error);
    res.status(500).json({ error: 'Failed to evaluate interview' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await Interview.find({ userId: req.user.uid }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    if (interview.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
});

module.exports = router;



