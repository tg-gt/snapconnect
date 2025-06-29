// Photo verification edge function for SnapConnect quest system
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface VerifyRequest {
  photoBase64: string
  questRequirements: string
}

interface VerifyResponse {
  verified: boolean
  confidence: number
  reason: string
}

async function verifyPhotoWithOpenAI(
  photoBase64: string,
  questRequirements: string
): Promise<VerifyResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a quest verification assistant for an event app. Analyze photos to determine if they meet quest requirements. Be reasonable but ensure the photo genuinely matches the requirements. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Quest Requirements: ${questRequirements}\n\nDoes this photo meet the quest requirements? Respond ONLY with a JSON object (no markdown, no code blocks) containing:\n- verified: boolean (true if requirements are met)\n- confidence: number (0-1, how confident you are)\n- reason: string (brief explanation)`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${photoBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    let content = data.choices[0].message.content

    // Strip markdown code blocks if present
    content = content.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '')
    
    // Also try to extract JSON from the content if it's wrapped in other text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      content = jsonMatch[0]
    }

    // Parse the JSON response from GPT-4
    try {
      const result = JSON.parse(content)
      return {
        verified: result.verified || false,
        confidence: result.confidence || 0,
        reason: result.reason || 'Unable to verify',
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      console.error('Raw content:', content)
      return {
        verified: false,
        confidence: 0,
        reason: 'Error parsing verification response',
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Check for API key
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // Parse request body
    const { photoBase64, questRequirements }: VerifyRequest = await req.json()

    if (!photoBase64 || !questRequirements) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: photoBase64 and questRequirements' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Verify the photo
    const result = await verifyPhotoWithOpenAI(photoBase64, questRequirements)

    // Log for debugging
    console.log('Verification result:', {
      requirements: questRequirements.substring(0, 50) + '...',
      verified: result.verified,
      confidence: result.confidence,
    })

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        verified: false,
        confidence: 0,
        reason: 'Verification failed',
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start`
  2. Set the secret: `supabase secrets set OPENAI_API_KEY=your-api-key`
  3. Test with:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/verify-quest-photo' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{
      "photoBase64": "YOUR_BASE64_IMAGE",
      "questRequirements": "Take a photo with the event sponsor booth"
    }'

*/
