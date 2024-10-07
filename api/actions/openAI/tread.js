//Create or fetch the thread id from the table
const threadIds = await ThreadsTable.findRecords({ filter: { conversationId: event.conversationId }, limit: 1 })
workflow.threadId = threadIds[0]?.threadId

if (!workflow.threadId) {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.openai.com/v1/threads',
    headers: {
      'OpenAI-Beta': 'assistants=v2',
      Authorization: 'Bearer ' + workflow.openAIToken,
      'Content-Type': 'application/json'
    }
  }

  const response = await axios.request(config)

  workflow.threadId = response.data.id
  await ThreadsTable.createRecord({
    threadId: workflow.threadId,
    conversationId: event.conversationId
  })
}
