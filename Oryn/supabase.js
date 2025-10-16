// supabase.js
import { createClient } from '@supabase/supabase-js'

// URL e ANON KEY do seu projeto
const SUPABASE_URL = "https://oxlhrwkbsxepurfzvcdw.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGhyd2tic3hlcHVyZnp2Y2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDk4NjcsImV4cCI6MjA3NDM4NTg2N30.wzXQ3oAvmp0kGsTzxE86gJoD8GlEPZtWHeWhWFX3VOo"

// Cria o client do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
