// ottiene l'ultimo messaggio e lo salva in workflow.response

async function fetchData() {
  try {
    const response = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api.openai.com/v1/threads/${workflow.threadId}/messages`,
      headers: {
        'OpenAI-Beta': 'assistants=v2',
        Authorization: `Bearer ${workflow.openAIToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.data.data[0].run_id === workflow.currentRunId && response.data.data[0].content.length) {
      workflow.response = response.data.data[0].content[0].text.value
      return
    }
  } catch (error) {
    console.log('error fetching last message')
    console.error(JSON.stringify(error))
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 1000)
  })

  await fetchData()
}

await fetchData()
