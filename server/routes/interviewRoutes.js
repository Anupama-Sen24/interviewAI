const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { extractResumeData, generateQuestions, evaluateInterview } = require('../services/aiService');
const Interview = require('../models/Interview');
const authMiddleware = require('./authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume (PDF)' });
    }

    const dataBuffer = req.file.buffer;
    let resumeText = '';
    try {
      const data = await pdf(dataBuffer);
      resumeText = data.text;
      console.log('✅ Extracted Resume Text (Length:', resumeText.length, ')');
      console.log('📄 Text Preview:', resumeText.substring(0, 200).replace(/\n/g, ' '));

    } catch (pdfError) {
      console.error('PDF parse error:', pdfError);
      resumeText = "Generic Software Engineer Resume";
    }

    try {
      // Step 1: Extract structured data
      const extractedData = await extractResumeData(resumeText);
      console.log('✅ Extracted Data:', extractedData);

      // Step 2: Generate questions based on extracted data
      const questions = await generateQuestions(extractedData, resumeText);
      console.log('✅ Generated Questions:', questions.length);

      res.json({ 
        success: true, 
        questions,
        extractedData
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



