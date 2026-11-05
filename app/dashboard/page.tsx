'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (data.meetings) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-indigo-400">IntellMeet Dashboard</h1>

      {/* Schedule Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-slate-200">Schedule a New Meeting</h2>
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Meeting Title</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Strategy Sync"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter brief agenda..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </form>
      </div>

      {/* Scheduled Meetings List */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-200">Your Scheduled Meetings</h2>
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <p className="text-slate-500">No meetings scheduled yet.</p>
          ) : (
            meetings.map((meeting) => (
              <Link href={`/meetings/${meeting.id}`} key={meeting.id} className="block">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-indigo-500 transition cursor-pointer shadow">
                  <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{meeting.description || 'No description'}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}