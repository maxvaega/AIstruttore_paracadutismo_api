//Send user message to Open AI

let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.openai.com/v1/threads/${workflow.threadId}/messages`,
    headers: {
      'OpenAI-Beta': 'assistants=v2',
      Authorization: `Bearer ${workflow.openAIToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      role: 'user',
      content: event.preview
    }
  }
  
  await axios.request(config)
  