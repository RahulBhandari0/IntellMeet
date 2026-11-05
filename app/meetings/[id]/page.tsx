'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  transcript: string | null;
  summary: string | null;
}

export default function MeetingPage() {
  const params = useParams();
  const meetingId = params?.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcriptInput, setTranscriptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  const fetchMeeting = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings`);
      const data = await res.json();
      const found = data.meetings?.find((m: Meeting) => m.id === meetingId);
      if (found) {
        setMeeting(found);
        setTranscriptInput(found.transcript || '');
      }
    } catch (err) {
      console.error('Error fetching meeting detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcriptInput.trim()) return alert('Pehle koi transcript text likho ya paste karo!');
    setSummarizing(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setMeeting((prev) => prev ? { ...prev, summary: data.summary, transcript: transcriptInput } : null);
      } else {
        alert(data.error || 'Summarization fail ho gaya');
      }
    } catch (err) {
      console.error('Summarize API Error:', err);
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading meeting details...</div>;
  if (!meeting) return <div className="p-8 text-white">Meeting nahi mili.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-400 mb-2">{meeting.title}</h1>
      <p className="text-slate-400 mb-6">{meeting.description || 'No description'}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Transcript Input */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <h2 className="text-lg font-semibold mb-3 text-slate-200">Meeting Transcript</h2>
          <textarea
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded p-3 text-sm focus:outline-none focus:border-indigo-500 mb-3 text-white"
            placeholder="Paste meeting notes or speech text here..."
            value={transcriptInput}
            onChange={(e) => setTranscriptInput(e.target.value)}
          />
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded transition"
          >
            {summarizing ? 'Generating AI Summary...' : 'Generate AI Summary'}
          </button>
        </div>

        {/* Right Column: AI Output */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <h2 className="text-lg font-semibold mb-3 text-slate-200">AI Summary & Action Items</h2>
          {meeting.summary ? (
            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-sm whitespace-pre-wrap text-slate-300 h-60 overflow-y-auto">
              {meeting.summary}
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded p-4 text-center">
              Abhi tak koi summary generate nahi hui hai. Transcript daal kar summary generate karo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}