import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client safely
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Hardcoded challenges reference for matching
const CHALLENGE_MAP = {
  transport: 'ch-1', // No Car Day
  waste: 'ch-2',     // Zero Plastic Week
  energy: 'ch-3',    // Energy Saver Challenge
  community: 'ch-4', // Tree Plantation Drive
  food: 'ch-5'       // Plant-Based Weekend
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entries = [], question = '', chatHistory = [] } = body;

    // Fallback if Gemini is not configured
    if (!genAI) {
      if (action === 'analyze') {
        const fallback = getLocalServerAnalysis(entries);
        return NextResponse.json(fallback);
      } else {
        const fallbackReply = getLocalServerChatReply(question, entries);
        return NextResponse.json({ reply: fallbackReply });
      }
    }

    const modelName = 'gemini-1.5-flash';

    if (action === 'analyze') {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const prompt = `
        You are an expert Sustainability Coach for EcoTrack AI. 
        Analyze these carbon footprint entries logged by the user (emissions are in kg CO2e):
        ${JSON.stringify(entries, null, 2)}

        Calculate a Sustainability Score from 0 to 100, where 100 represents a near-zero carbon footprint and 0 represents extremely high emissions. (For context, average user monthly emissions are around 300-400 kg CO2e).
        Provide 2 to 3 practical, actionable tips in the "recommendations" array.
        Match the highest emission category to one of these suggested Challenge IDs: 
        - 'ch-1' (No Car Day) if transport is highest
        - 'ch-2' (Zero Plastic Week) if waste is highest
        - 'ch-3' (Energy Saver Challenge) if energy is highest
        - 'ch-5' (Plant-Based Weekend) if food is highest
        - 'ch-4' (Tree Plantation Drive) for overall high carbon footprint

        Format your response EXACTLY as a JSON object with this schema:
        {
          "insights": "Detailed analysis summary of their footprint, noting which category is highest and why it matters.",
          "recommendations": [
            {
              "title": "Short title of recommendation",
              "impact": "High" | "Medium" | "Low",
              "description": "Explanatory text explaining why and how it reduces emissions",
              "action": "A specific, immediate, actionable instruction"
            }
          ],
          "sustainabilityScore": 85,
          "weeklyGoalRecommendation": "A single specific goal they can try to achieve this week.",
          "suggestedChallengeId": "ch-1"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } 
    
    if (action === 'chat') {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const historyPrompt = chatHistory.map((msg: any) => {
        return `${msg.sender === 'user' ? 'User' : 'Coach'}: ${msg.text}`;
      }).join('\n');

      const prompt = `
        You are an expert AI Sustainability Coach for EcoTrack AI. Your tone is positive, encouraging, and scientific.
        Help the user live a greener lifestyle by answering their questions.
        Provide concrete facts, prevent any hallucinations or fake statistics, and offer actionable green tips.

        Context of user's logged carbon entries:
        ${JSON.stringify(entries, null, 2)}

        Previous Conversation History:
        ${historyPrompt}

        New User Question: "${question}"

        Response guidelines:
        - Keep answers concise and readable with bullet points.
        - Frame advice in terms of practical steps the user can take today.
        - Limit response to a maximum of 3 short paragraphs.
        
        Write your direct reply below:
      `;

      const result = await model.generateContent(prompt);
      const replyText = result.response.text();
      return NextResponse.json({ reply: replyText });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Gemini API Route error:', error);
    // Safe final fallback on route failure
    return NextResponse.json({ 
      error: 'Failed to process AI request. Falling back to local data.',
      reply: 'I am experiencing connection issues. Please try again. In the meantime, try turning off unused electronics to save energy!',
      ...getLocalServerAnalysis([])
    }, { status: 500 });
  }
}

// Server-side fallback logic duplicates the helper so we don't crash
function getLocalServerAnalysis(entries: any[]) {
  let transport = 0, energy = 0, food = 0, waste = 0;
  entries.forEach(e => {
    if (e.category === 'transport') transport += e.co2_emission;
    else if (e.category === 'energy') energy += e.co2_emission;
    else if (e.category === 'food') food += e.co2_emission;
    else if (e.category === 'waste') waste += e.co2_emission;
  });
  const total = transport + energy + food + waste;
  let score = Math.max(30, Math.min(99, Math.round(100 - (total / 12))));
  if (entries.length === 0) score = 75;

  let suggestedChallengeId = 'ch-1';
  let weeklyGoalRecommendation = 'Aim to walk or cycle instead of driving for trips under 5km.';
  let insights = 'Welcome to EcoTrack AI! Set up your goals and track entries to see dynamic carbon insights.';

  if (total > 0) {
    const maxVal = Math.max(transport, energy, food, waste);
    if (maxVal === transport) {
      suggestedChallengeId = 'ch-1';
      weeklyGoalRecommendation = 'Try a car-free day this week by walking or taking the bus.';
      insights = `Your transportation emissions represent your largest impact at ${transport.toFixed(1)} kg CO2e. Reducing car use will yield the biggest carbon savings.`;
    } else if (maxVal === energy) {
      suggestedChallengeId = 'ch-3';
      weeklyGoalRecommendation = 'Turn off household standby electronics when not in use.';
      insights = `Your household energy emissions are your largest impact at ${energy.toFixed(1)} kg CO2e. Switching to energy-efficient appliances or reducing temperature setpoints will help.`;
    } else if (maxVal === food) {
      suggestedChallengeId = 'ch-5';
      weeklyGoalRecommendation = 'Eat completely plant-based meals for at least 2 days.';
      insights = `Your dietary habits account for the highest segment of your footprint (${food.toFixed(1)} kg CO2e). Switching away from meat-heavy meals lowers methane and land use impacts.`;
    } else {
      suggestedChallengeId = 'ch-2';
      weeklyGoalRecommendation = 'Try to eliminate plastic food wraps and bottles.';
      insights = `Your plastic and paper waste emissions are your highest impact at ${waste.toFixed(1)} kg CO2e. Focus on reusing bags and choosing unpackaged items.`;
    }
  }

  return {
    insights,
    recommendations: [
      {
        title: 'Optimize Household Heating/Cooling',
        impact: 'High',
        description: 'Adjusting climate controls by 1-2 degrees Celsius reduces household heating/cooling loads.',
        action: 'Adjust thermostat 1 degree higher in summer'
      },
      {
        title: 'Walk or Cycle for Short Trips',
        impact: 'High',
        description: 'Driving petrol or diesel cars releases significant CO2. Commuting by bus, train, or cycling cuts emissions.',
        action: 'Walk or bike for any trip under 2 kilometers'
      }
    ],
    sustainabilityScore: score,
    weeklyGoalRecommendation,
    suggestedChallengeId
  };
}

function getLocalServerChatReply(question: string, entries: any[]) {
  const q = question.toLowerCase();
  if (q.includes('transport') || q.includes('car') || q.includes('drive')) {
    return "Commuting by car has a significant carbon footprint. To reduce transport impact:\n\n* Walk or cycle for short errands.\n* Use buses or trains for daily commutes.\n* Consolidate travel times.";
  }
  if (q.includes('energy') || q.includes('electricity') || q.includes('light')) {
    return "Household energy accounts for a major chunk of emissions. Action items:\n\n* Swap default bulbs for energy-saving LEDs.\n* Unplug phone and laptop chargers when devices are full.\n* Keep cooling and heating moderate.";
  }
  if (q.includes('food') || q.includes('diet') || q.includes('meat')) {
    return "Our diet affects soil, water, and air. Beef and lamb produce nearly 30x more carbon than plant alternatives. Incorporating plant-based meals 2-3 days a week saves tons of CO2 yearly.";
  }
  return "Living a low-carbon lifestyle is all about building micro-habits. By planning your meals, choosing public transit, turning off idle electronics, and reusing containers, you make a significant difference. Let me know if you would like specific suggestions for any of these!";
}
