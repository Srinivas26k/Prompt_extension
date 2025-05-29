import { findUserByCode, logUsage, updateUserCredits } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, prompt } = req.body

  if (!code || !prompt) {
    return res.status(400).json({ error: 'Code and prompt required' })
  }

  try {
    // Find user by code
    const { user, error } = await findUserByCode(code)
    
    if (error || !user) {
      return res.status(404).json({ error: 'Invalid redemption code' })
    }

    // Check if user has credits
    if (user.credits <= 0) {
      return res.status(403).json({ error: 'No credits remaining' })
    }

    console.log('Starting prompt enhancement for user:', user.email)
    
    // Enhance prompt using OpenRouter AI
    const enhancedPrompt = await enhancePromptWithAI(prompt)
    
    console.log('Enhancement completed, logging usage...')

    // Log the usage
    await logUsage(user.id, 'enhance', prompt, enhancedPrompt)

    // Deduct credit
    await updateUserCredits(user.id, user.credits - 1)

    res.status(200).json({
      success: true,
      enhanced_prompt: enhancedPrompt,
      credits_remaining: user.credits - 1
    })

  } catch (err) {
    console.error('Enhancement error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Enhanced prompt using OpenRouter AI with timeout and better fallback
async function enhancePromptWithAI(originalPrompt) {
  console.log('Calling OpenRouter API for prompt:', originalPrompt.substring(0, 50) + '...')
  
  try {
    // Set a timeout for the API call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 10000)
    );
    
    const apiCall = fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Prompt Enhancer'
      },
      body: JSON.stringify({
        model: 'microsoft/phi-4-reasoning-plus:free',
        messages: [
          {
            role: 'system',
            content: `You are an expert prompt engineer. Transform the user's basic prompt into a highly effective, detailed prompt that will get much better results from AI models. 

Your enhanced prompt should:
1. Define a clear expert role for the AI
2. Add specific context and requirements
3. Structure the request professionally
4. Include relevant constraints or guidelines
5. Specify desired output format when applicable

Return ONLY the enhanced prompt, nothing else.`
          },
          {
            role: 'user',
            content: `Transform this basic prompt into a much better, more effective prompt: "${originalPrompt}"`
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const response = await Promise.race([apiCall, timeoutPromise]);
    
    console.log('OpenRouter response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API success, response length:', data.choices[0].message.content.length)
    return data.choices[0].message.content;

  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    console.log('Using advanced local enhancement...')
    // Use advanced local enhancement instead of basic fallback
    return getAdvancedEnhancement(originalPrompt);
  }
}

// Advanced local enhancement with sophisticated prompt engineering
function getAdvancedEnhancement(originalPrompt) {
  const context = analyzePromptContext(originalPrompt);
  const intent = detectPromptIntent(originalPrompt);
  const complexity = assessComplexity(originalPrompt);
  
  let enhancedPrompt = '';
  
  // Add role-based introduction
  enhancedPrompt += `**ROLE**: You are ${context.expertRole} with deep expertise in ${context.domain}.\n\n`;
  
  // Add context and objective
  enhancedPrompt += `**OBJECTIVE**: ${intent.description}\n\n`;
  
  // Add detailed requirements
  enhancedPrompt += `**REQUIREMENTS**:\n`;
  intent.requirements.forEach(req => enhancedPrompt += `• ${req}\n`);
  enhancedPrompt += '\n';
  
  // Add the enhanced request
  enhancedPrompt += `**TASK**: ${intent.enhancedRequest}\n\n`;
  
  // Add output specifications
  enhancedPrompt += `**OUTPUT FORMAT**:\n`;
  context.outputSpecs.forEach(spec => enhancedPrompt += `• ${spec}\n`);
  enhancedPrompt += '\n';
  
  // Add quality guidelines
  enhancedPrompt += `**QUALITY STANDARDS**:\n`;
  enhancedPrompt += `• Provide comprehensive, accurate information\n`;
  enhancedPrompt += `• Use clear, professional language\n`;
  enhancedPrompt += `• Include relevant examples or details\n`;
  enhancedPrompt += `• Ensure practical, actionable insights\n`;
  if (complexity.needsExamples) {
    enhancedPrompt += `• Include specific examples to illustrate key points\n`;
  }
  if (complexity.needsSteps) {
    enhancedPrompt += `• Break down complex processes into clear steps\n`;
  }
  
  return enhancedPrompt;
}

// Analyze the context and domain of the prompt
function analyzePromptContext(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Programming/Tech
  if (lowerPrompt.match(/\b(code|program|script|function|algorithm|debug|software|app|website|database)\b/)) {
    return {
      expertRole: 'a senior software engineer and technical architect',
      domain: 'software development, programming, and technical solutions',
      outputSpecs: [
        'Provide clean, well-commented code examples',
        'Explain the logic and approach clearly',
        'Include best practices and potential optimizations',
        'Mention relevant tools, libraries, or frameworks'
      ]
    };
  }
  
  // Writing/Content
  if (lowerPrompt.match(/\b(write|article|blog|content|essay|story|copy|marketing|email)\b/)) {
    return {
      expertRole: 'a professional content strategist and skilled writer',
      domain: 'content creation, communication, and audience engagement',
      outputSpecs: [
        'Structure content with clear headings and flow',
        'Use engaging, audience-appropriate tone',
        'Include compelling hooks and calls-to-action',
        'Optimize for readability and impact'
      ]
    };
  }
  
  // Business/Strategy
  if (lowerPrompt.match(/\b(business|strategy|plan|analysis|market|revenue|growth|management)\b/)) {
    return {
      expertRole: 'a seasoned business consultant and strategic advisor',
      domain: 'business strategy, operations, and organizational development',
      outputSpecs: [
        'Provide data-driven insights and recommendations',
        'Include actionable next steps',
        'Consider market dynamics and competitive factors',
        'Address potential risks and mitigation strategies'
      ]
    };
  }
  
  // Design/Creative
  if (lowerPrompt.match(/\b(design|ui|ux|creative|visual|graphics|layout|brand)\b/)) {
    return {
      expertRole: 'a creative design director and user experience specialist',
      domain: 'design thinking, visual communication, and user experience',
      outputSpecs: [
        'Focus on user-centered design principles',
        'Consider visual hierarchy and accessibility',
        'Provide specific design recommendations',
        'Include relevant design trends and best practices'
      ]
    };
  }
  
  // Data/Analytics
  if (lowerPrompt.match(/\b(data|analytics|statistics|analysis|research|insights|metrics)\b/)) {
    return {
      expertRole: 'a data scientist and analytics expert',
      domain: 'data analysis, statistical modeling, and business intelligence',
      outputSpecs: [
        'Use data-driven approaches and methodologies',
        'Provide statistical context and significance',
        'Include visualization recommendations',
        'Explain analytical assumptions and limitations'
      ]
    };
  }
  
  // Default/General
  return {
    expertRole: 'a knowledgeable professional consultant',
    domain: 'cross-functional expertise and problem-solving',
    outputSpecs: [
      'Provide comprehensive, well-researched information',
      'Use clear, professional communication',
      'Include practical examples and applications',
      'Ensure accuracy and relevance'
    ]
  };
}

// Detect the intent and purpose of the prompt
function detectPromptIntent(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // How-to/Tutorial intent
  if (lowerPrompt.match(/\b(how to|how do|tutorial|guide|steps|learn|teach)\b/)) {
    return {
      description: 'Provide comprehensive guidance and step-by-step instructions',
      enhancedRequest: `Create a detailed, actionable guide that addresses: "${prompt}"`,
      requirements: [
        'Break down the process into clear, sequential steps',
        'Explain the reasoning behind each step',
        'Include prerequisites and preparation needed',
        'Provide troubleshooting tips for common issues',
        'Suggest additional resources for further learning'
      ]
    };
  }
  
  // Explanation/Analysis intent
  if (lowerPrompt.match(/\b(explain|what is|why|analyze|compare|difference|understand)\b/)) {
    return {
      description: 'Provide comprehensive explanation and analytical insights',
      enhancedRequest: `Deliver a thorough, well-structured explanation of: "${prompt}"`,
      requirements: [
        'Define key concepts and terminology clearly',
        'Provide relevant background and context',
        'Use examples to illustrate complex points',
        'Address common misconceptions or confusion',
        'Connect to broader implications or applications'
      ]
    };
  }
  
  // Creation/Generation intent
  if (lowerPrompt.match(/\b(create|generate|make|build|develop|design|write)\b/)) {
    return {
      description: 'Create original, high-quality content or solutions',
      enhancedRequest: `Develop comprehensive, original material for: "${prompt}"`,
      requirements: [
        'Ensure originality and creativity in the approach',
        'Consider multiple perspectives or alternatives',
        'Include detailed specifications and requirements',
        'Provide rationale for design/creative decisions',
        'Suggest ways to iterate and improve the output'
      ]
    };
  }
  
  // Problem-solving intent
  if (lowerPrompt.match(/\b(solve|fix|troubleshoot|debug|resolve|issue|problem)\b/)) {
    return {
      description: 'Provide systematic problem-solving approach and solutions',
      enhancedRequest: `Systematically address and resolve: "${prompt}"`,
      requirements: [
        'Identify the root cause of the issue',
        'Provide multiple potential solutions',
        'Rank solutions by effectiveness and feasibility',
        'Include prevention strategies for the future',
        'Explain the logic behind recommended approaches'
      ]
    };
  }
  
  // Default intent
  return {
    description: 'Provide comprehensive, professional assistance',
    enhancedRequest: `Address comprehensively: "${prompt}"`,
    requirements: [
      'Provide thorough, accurate information',
      'Structure the response logically',
      'Include relevant examples and context',
      'Ensure practical applicability',
      'Maintain professional quality throughout'
    ]
  };
}

// Assess the complexity and special needs of the prompt
function assessComplexity(prompt) {
  const wordCount = prompt.split(' ').length;
  const hasQuestions = prompt.includes('?');
  const hasMultipleParts = prompt.includes('and') || prompt.includes('also') || prompt.includes(',');
  const lowerPrompt = prompt.toLowerCase();
  
  return {
    level: wordCount > 10 ? 'complex' : 'simple',
    needsExamples: lowerPrompt.match(/\b(example|instance|case|sample|demonstrate)\b/) || wordCount > 15,
    needsSteps: lowerPrompt.match(/\b(process|procedure|method|approach|steps|how)\b/),
    needsComparison: lowerPrompt.match(/\b(vs|versus|compare|difference|better|best)\b/),
    hasMultipleQuestions: hasQuestions && hasMultipleParts,
    isOpenEnded: !hasQuestions && wordCount < 5
  };
}

// Fallback to basic enhancement (keeping original function name for compatibility)
function getFallbackEnhancement(originalPrompt) {
  return getAdvancedEnhancement(originalPrompt);
}
