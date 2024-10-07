//Create a run
const creationResponse = await axios.request({
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.openai.com/v1/threads/${workflow.threadId}/runs`,
    headers: {
      'OpenAI-Beta': 'assistants=v2',
      Authorization: `Bearer ${workflow.openAIToken}`,
      'Content-Type': 'application/json'
    }, 
    data: JSON.stringify({
      assistant_id: workflow.assistantId,
    "additional_instructions":"l'utente si chiama: <test> ",
    "tool_choice":{
      "type":"file_search"
    }
    })
  }) //Max: aggiunto file search per obbligare l'assistente a usarlo
  
  const runId = creationResponse.data.id
  workflow.currentRunId = runId
  
  const handleFunctionCall = async (toolCalls) => {
    eval(`${workflow.functions}`)
  
    const payload: { tool_outputs: any[] } = {
      tool_outputs: []
    }
  
    for (const item of toolCalls) {
      if (item.type === 'function') {
        const functionToCall = eval(`${item.function.name}`)
        const args = item.function.arguments
        const output =
          functionToCall.constructor.name === 'AsyncFunction' ? await functionToCall(args) : functionToCall(args)
  
        payload.tool_outputs.push({
          tool_call_id: item.id,
          output
        })
      } else {
        console.log(`Tool is not supported`)
      }
    }
  
    const url = `https://api.openai.com/v1/threads/${workflow.threadId}/runs/${runId}/submit_tool_outputs`
  
    const headers = {
      Authorization: `Bearer ${workflow.openAIToken}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    }
  
    await axios.post(url, payload, { headers })
  }
  
  //Check the run for completion and call fucntion if appropriate
  const waitTillRunComplete = async () => {
    const statusResponse = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api.openai.com/v1/threads/${workflow.threadId}/runs/${runId}`,
      headers: {
        'OpenAI-Beta': 'assistants=v2',
        Authorization: `Bearer ${workflow.openAIToken}`,
        'Content-Type': 'application/json'
      }
    })
  
    if (statusResponse.data.status === 'requires_action') {
      await handleFunctionCall(statusResponse.data?.required_action?.submit_tool_outputs.tool_calls)
    }
  
    if (!['queued', 'in_progress'].includes(statusResponse.data.status)) {
      return
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
    await waitTillRunComplete()
  }
  
  await waitTillRunComplete()
  