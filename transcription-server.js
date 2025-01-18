import express from 'express'
import cors from 'cors'
import multer from 'multer'
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const port = 3001 // Different from Vite's port

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Initialize OpenAI client
const openai = new OpenAI() // Will use OPENAI_API_KEY from .env

// Enable CORS for your Vite frontend
app.use(cors({
  origin: 'http://localhost:5173' // Your Vite frontend URL
}))

// Transcription endpoint
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    // Create a temporary file from the buffer
    const audioBuffer = req.file.buffer

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
      language: 'en'
    })

    res.json({ text: transcription.text })
  } catch (error) {
    console.error('Transcription error:', error)
    res.status(500).json({ error: 'Transcription failed' })
  }
})

app.listen(port, () => {
  console.log(`Transcription server running at http://localhost:${port}`)
}) 