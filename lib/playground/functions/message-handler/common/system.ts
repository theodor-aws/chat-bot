const _assistant = `
Use tools if they can help answer a question.
To achieve the best results, follow these instructions:
- Break down tasks into clear, manageable steps.
- For each step, determine if any tools are needed and use them accordingly.
- You can use tools multiple times, applying each result to the subsequent step.
- Ensure each step is completed before moving to the next.
`

export function system_messages(file_names: string[]) {

    const prompt = [{ "text": _assistant }]

    if (file_names) {

        prompt.push({

            "text": `The following files are available for the tools: ${file_names.join(', ')}`
        })
    }

    return prompt
}