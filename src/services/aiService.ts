import { FootprintEntry } from '../types';

export interface CoachResponse {
  insights: string;
  recommendations: Array<{
    title: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
    action: string;
  }>;
  sustainabilityScore: number; // 0 to 100
  weeklyGoalRecommendation: string;
  suggestedChallengeId?: string; // matches seeded challenges like 'ch-1' etc.
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const aiService = {
  async getFootprintAnalysis(entries: FootprintEntry[]): Promise<CoachResponse> {
    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'analyze', entries })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve AI analysis');
      }

      return await response.json();
    } catch (err) {
      console.warn('AI Coach server error, using local analysis fallback:', err);
      return this.getLocalFallbackAnalysis(entries);
    }
  },

  async askCoach(question: string, chatHistory: ChatMessage[], entries: FootprintEntry[]): Promise<string> {
    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'chat', question, chatHistory, entries })
      });

      if (!response.ok) {
        throw new Error('Failed to ask AI Coach');
      }

      const data = await response.json();
      return data.reply;
    } catch (err) {
      console.warn('AI Coach server error, using local chat fallback:', err);
      return this.getLocalFallbackChatReply(question, entries);
    }
  },

  // Locally generated fallback analytics when API key is missing or backend is down
  getLocalFallbackAnalysis(entries: FootprintEntry[]): CoachResponse {
    let transportEmissions = 0;
    let energyEmissions = 0;
    let foodEmissions = 0;
    let wasteEmissions = 0;
    
    entries.forEach(e => {
      if (e.category === 'transport') transportEmissions += e.co2_emission;
      else if (e.category === 'energy') energyEmissions += e.co2_emission;
      else if (e.category === 'food') foodEmissions += e.co2_emission;
      else if (e.category === 'waste') wasteEmissions += e.co2_emission;
    });

    const totalEmissions = transportEmissions + energyEmissions + foodEmissions + wasteEmissions;
    
    // Compute a mock sustainability score: 100 is best, lower for higher footprint
    // Let's assume average monthly footprint is ~400 kg. If they are below that, they score higher.
    let score = Math.max(20, Math.min(98, Math.round(100 - (totalEmissions / 15))));
    if (entries.length === 0) score = 75; // Default score

    let insights = '';
    const recommendations: CoachResponse['recommendations'] = [];
    let suggestedChallengeId = 'ch-1';
    let weeklyGoalRecommendation = '';

    // Generate dynamic suggestions based on highest category
    const categories = [
      { name: 'Transportation', value: transportEmissions, code: 'transport' },
      { name: 'Home Energy', value: energyEmissions, code: 'energy' },
      { name: 'Dietary', value: foodEmissions, code: 'food' },
      { name: 'Waste Production', value: wasteEmissions, code: 'waste' }
    ];
    categories.sort((a, b) => b.value - a.value);
    const highest = categories[0];

    if (totalEmissions === 0) {
      insights = "Welcome to your AI Sustainability dashboard! To unlock your fully personalized profile analysis, begin logging carbon footprint entries in the calculator.";
      recommendations.push({
        title: 'Log your first entry',
        impact: 'Medium',
        description: 'Record transportation, food, or energy habits to begin calculation.',
        action: 'Go to Carbon Calculator'
      });
      weeklyGoalRecommendation = 'Aim to log at least 3 calculator entries this week.';
    } else {
      insights = `Your total carbon emission logged is ${totalEmissions.toFixed(1)} kg CO2e. Your highest emission source comes from ${highest.name} which accounts for ${((highest.value / (totalEmissions || 1)) * 100).toFixed(0)}% of your footprint.`;
      
      if (highest.code === 'transport') {
        recommendations.push({
          title: 'Switch to public transport or cycle',
          impact: 'High',
          description: 'Driving petrol or diesel cars releases significant CO2. Commuting by bus, train, or cycling cuts emissions by up to 80%.',
          action: 'Try walking or bus routes for commutes less than 10km'
        });
        recommendations.push({
          title: 'Consolidate travel trips',
          impact: 'Medium',
          description: 'Fewer cold starts and combined errands reduce fuel consumption.',
          action: 'Combine weekly grocery shopping with other errands'
        });
        suggestedChallengeId = 'ch-1'; // No Car Day
        weeklyGoalRecommendation = 'Aim to replace 2 car rides this week with biking or walking.';
      } else if (highest.code === 'energy') {
        recommendations.push({
          title: 'Unplug phantom devices',
          impact: 'Medium',
          description: 'Electronics consume electricity even when idle. Unplugging chargers and power strips can save up to 10% on energy bills.',
          action: 'Unplug laptop and phone chargers when not in active use'
        });
        recommendations.push({
          title: 'Optimize thermostat levels',
          impact: 'High',
          description: 'Adjusting climate controls by 1-2 degrees Celsius reduces household heating/cooling loads dramatically.',
          action: 'Set air conditioner 1 degree higher in summer'
        });
        suggestedChallengeId = 'ch-3'; // Energy Saver Challenge
        weeklyGoalRecommendation = 'Reduce household power usage by turning off lights in empty rooms.';
      } else if (highest.code === 'food') {
        recommendations.push({
          title: 'Incorporate plant-based days',
          impact: 'High',
          description: 'Red meat and poultry require massive land, water, and feed resources. Eating plant-based meals cuts food-related greenhouse gases in half.',
          action: 'Choose a vegetarian recipe for lunch and dinner'
        });
        recommendations.push({
          title: 'Reduce food waste',
          impact: 'Medium',
          description: 'Discarded food decomposes in landfills to release methane. Planning meals prevents excess purchasing.',
          action: 'Create a weekly meal plan before visiting the grocery store'
        });
        suggestedChallengeId = 'ch-5'; // Plant-Based Weekend
        weeklyGoalRecommendation = 'Go completely vegetarian for 2 days this week.';
      } else {
        recommendations.push({
          title: 'Embrace composting',
          impact: 'Medium',
          description: 'Diverting food waste and organic materials to home compost reduces methane emissions from landfills and yields organic soil nutrients.',
          action: 'Start a small organic compost bin for vegetable peels'
        });
        recommendations.push({
          title: 'Purchase items with minimal packaging',
          impact: 'High',
          description: 'Single-use plastic wrap is highly carbon-intensive to manufacture and hard to recycle.',
          action: 'Bring reusable bags and buy loose vegetables instead of pre-packaged options'
        });
        suggestedChallengeId = 'ch-2'; // Zero Plastic Week
        weeklyGoalRecommendation = 'Eliminate single-use plastic bottles from your daily routine.';
      }
    }

    return {
      insights,
      recommendations,
      sustainabilityScore: score,
      weeklyGoalRecommendation,
      suggestedChallengeId
    };
  },

  getLocalFallbackChatReply(question: string, entries: FootprintEntry[]): string {
    const q = question.toLowerCase();
    
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return "Hello! I am your EcoTrack AI Sustainability Coach. I can help analyze your carbon footprint, suggest ways to save energy, advise on green living, or guide you through environmental challenges. What aspect of sustainability would you like to discuss today?";
    }
    
    if (q.includes('transport') || q.includes('car') || q.includes('drive') || q.includes('flight')) {
      return "Transportation is one of the largest contributors to personal carbon footprints. To reduce it:\n\n1. **Active Commuting**: Walk or cycle for short distances under 5km.\n2. **Public Transit**: Trains and buses have much lower per-passenger emissions.\n3. **Drive Smart**: Keep tires inflated and drive smoothly to conserve fuel.\n4. **Fly Less**: Consider virtual meetings or high-speed rail instead of short-haul flights, which emit the highest amount of CO2 per kilometer.";
    }

    if (q.includes('energy') || q.includes('electricity') || q.includes('power') || q.includes('lpg') || q.includes('gas')) {
      return "Household energy consumption has a large carbon footprint. Try these steps:\n\n1. **Unplug Standby Devices**: Many appliances draw 'vampire' power when plugged in but turned off.\n2. **LED Lighting**: Swap all bulbs for LEDs, which use up to 80% less energy.\n3. **Thermostat settings**: Keep heating and cooling moderate. 18-20°C in winter and 24-26°C in summer are optimal.\n4. **Solar energy**: Invest in solar panels if feasible in your region.";
    }

    if (q.includes('food') || q.includes('meat') || q.includes('vegetarian') || q.includes('diet')) {
      return "Your diet plays a massive role in environmental footprint. Beef and lamb generate over 10x the greenhouse gas emissions of chicken, and nearly 30x that of beans and lentils. By incorporating just 2-3 plant-based days a week, you can reduce your food carbon emissions by up to 35%. Also, planning meals avoids food waste, which otherwise releases methane in landfills.";
    }

    if (q.includes('plastic') || q.includes('waste') || q.includes('recycle') || q.includes('paper')) {
      return "To tackle waste, remember the hierarchy: **Reduce, Reuse, Recycle**:\n\n1. **Reduce**: Buy products with less packaging, choose bulk items.\n2. **Reuse**: Carry reusable water bottles, shopping bags, and containers.\n3. **Recycle**: Clean and sort plastics, metals, and glass correctly.\n4. **Compost**: Compost organic waste so it breaks down aerobically rather than producing harmful methane in municipal dumps.";
    }

    if (q.includes('challenge') || q.includes('points') || q.includes('points') || q.includes('green points')) {
      return "EcoTrack AI awards Green Points for completing weekly Challenges (like 'No Car Day' or 'Zero Plastic Week') and recording logs. Earning points unlocks new badges, moving you from an Eco Beginner to a Sustainability Master! Check out the 'Challenges' tab to get started.";
    }

    return "That's an interesting question! A sustainable lifestyle is built on micro-habits. By optimizing your daily diet (eating more local, plant-based foods), choosing active transport, reducing household electricity draw, and minimizing single-use packaging waste, you can help cut global greenhouse emissions. Let me know if you want detailed steps for any of these areas!";
  }
};
