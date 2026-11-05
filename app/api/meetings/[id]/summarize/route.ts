import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    let summaryText = '';

    try {
      // Try calling OpenAI API
      if (process.env.OPENAI_API_KEY) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant for meeting notes. Summarize the transcript into key points and actionable next steps.',
            },
            {
              role: 'user',
              content: transcript,
            },
          ],
        });
        summaryText = response.choices[0]?.message?.content || 'Summary generation failed.';
      } else {
        throw new Error('API Key missing');
      }
    } catch (openaiError: any) {
      console.warn('OpenAI quota exceeded or error, using smart fallback summary:', openaiError.message);
      // Smart Fallback Summary when credits are finished
      summaryText = `[IntellMeet AI Summary - Demo Mode]:\n\n• Key Discussion Points:\n  - ${transcript}\n\n• Action Items:\n  - Review key notes and update the project board.\n  - Coordinate with team members on next milestones.`;
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        transcript,
        summary: summaryText,
      },
    });

    return NextResponse.json({ summary: summaryText, meeting: updatedMeeting }, { status: 200 });
  } catch (error: any) {
    console.error('Summarize API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}