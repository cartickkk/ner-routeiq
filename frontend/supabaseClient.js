import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vlkzqeqaywnwqrdvmveq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsa3pxZXFheXdud3FyZHZtdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Mjg0MzAsImV4cCI6MjEwNjEwNDQzMH0.DpPU-Ir-RXWASaqdnIpQqH70DNzA20gKHeBYOWSBCzI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);