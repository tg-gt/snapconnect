// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Chat assistant function called')
    
    // Validate request body
    let body;
    try {
      body = await req.json()
      console.log('Request body received:', { 
        hasQuestion: !!body.question, 
        hasUserStats: !!body.userStats, 
        hasLeaderboard: !!body.leaderboard 
      })
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const { question, userStats, leaderboard } = body
    
    // Validate required fields
    if (!question) {
      console.error('Missing question in request')
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.error('OpenAI API key not found in environment')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('Making OpenAI API call...')
    
    // OpenAI API call (server-side, secure)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an event assistant for SnapConnect Demo Event. Answer questions about quest completions, rankings, and achievements based on this data:
            User Stats: ${JSON.stringify(userStats)}
            Leaderboard: ${JSON.stringify(leaderboard)}
            
            Keep responses concise and friendly. Use emojis when appropriate. Focus on:
            - Quest progress and completions
            - Ranking and leaderboard positions
            - Achievement unlocks and requirements
            - Encouraging participation in event activities
            
            If asked about topics outside event data, politely redirect to event-related questions.`
          },
          { role: 'user', content: question }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    console.log('OpenAI response status:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', openaiResponse.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Sorry, I encountered an issue with the AI service. Please try again.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received successfully')
    
    const response = openaiData.choices[0].message.content

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Chat assistant function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Sorry, I encountered an unexpected issue. Please try again.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-assistant' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
