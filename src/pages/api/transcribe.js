import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Initialize OpenAI client
const openai = new OpenAI()  // It will automatically use OPENAI_API_KEY from environment

export const config = {
  api: {
    bodyParser: false // Disable body parsing, we'll handle raw audio data
  }
}

export async function POST(req) {
  try {
    // Get the form data
    const formData = await req.formData()
    const audioFile = formData.get('audio')

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert the audio file to a Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
      language: 'en'
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
} 