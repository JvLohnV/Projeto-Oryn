// supabase.js
import { createClient } from '@supabase/supabase-js'

// URL e ANON KEY do seu projeto
const SUPABASE_URL = "https://ngehsncshjivmnqwxaqu.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWhzbmNzaGppdm1ucXd4YXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM4MzUsImV4cCI6MjA3NjE2OTgzNX0.hTEIKG6-Of5cEfKg1ejohNyWpsnCziD1P72k22AYOso"

// Cria o client do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
