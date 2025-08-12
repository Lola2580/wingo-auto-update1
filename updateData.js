import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Environment variables (set these in Vercel)
const SUPABASE_URL = https://zcakpabnchbtxuxtefbe.supabase.co;
const SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjYWtwYWJuY2hidHh1eHRlZmJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5MTkzNSwiZXhwIjoyMDcwNTY3OTM1fQ.cbw6BjtPeAcfL5c8mS1l3bSV1QKHXS3ov69EJ4xG4g0;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
    const ts = Date.now();

    const response = await fetch(`${API_URL}?ts=${ts}`);
    const data = await response.json();

    if (!data.data || !data.data.list) {
      return res.status(500).json({ error: "No data from API" });
    }

    const results = data.data.list.map(r => ({
      period: r.issueNumber,
      digit: parseInt(r.number),
      bigsmall: parseInt(r.number) >= 5 ? "Big" : "Small",
      created_at: new Date().toISOString()
    }));

    for (let row of results) {
      await supabase
        .from('wingo_results')
        .upsert(row, { onConflict: ['period'] });
    }

    res.json({ success: true, inserted: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
