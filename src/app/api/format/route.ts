import { NextResponse } from 'next/server';

// This is a basic structure. Error handling, proper API key management,
// and potentially more robust request validation are needed for production.

export async function POST(request: Request) {
  try {
    const { content, systemPrompt, model, temperature } = await request.json();

    // Basic validation
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Retrieve API Key securely (using environment variables is recommended)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured in environment variables.');
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 });
    }

    // Prepare prompt for OpenAI
    const formattingPrompt = `
      Format the following content according to best practices. 
      Create organized sections with clear headings, bullet points, and numbered lists as appropriate.
      Return the formatted content as HTML that can be directly inserted into a document.
      Do not include any introductory text like "Here is the formatted content:". Just return the HTML.
      
      Original content:
      ${content}
    `;

    const defaultSystemPrompt = "You are a helpful assistant that formats text into clear, structured content. Create organized sections with headings, bullet points, and numbered lists as appropriate.";
    const selectedModel = model || 'gpt-3.5-turbo'; // Default model
    const selectedTemperature = temperature !== undefined ? temperature : 0.7; // Default temperature
    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    console.log(`Calling OpenAI with model: ${selectedModel}, temp: ${selectedTemperature}`);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: formattingPrompt }
        ],
        temperature: selectedTemperature,
        max_tokens: 2000 // Adjust as needed
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error?.message || 'Unknown OpenAI API error');
    }

    const data = await response.json();
    const formattedContent = data.choices[0]?.message?.content;

    if (!formattedContent) {
      throw new Error('No content received from OpenAI');
    }

    // Return the formatted content
    return NextResponse.json({ formattedContent });

  } catch (error: unknown) {
    let errorMessage = 'Failed to format content';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error formatting content:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 