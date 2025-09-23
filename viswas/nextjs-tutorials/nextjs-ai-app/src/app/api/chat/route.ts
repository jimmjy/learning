import { UIMessage, streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-4.1-nano"),

      // This is a system prompt example
      // messages: [
      //   {
      //     role: "system",
      //     content:
      //       // tell ai 3 things, what it is, the length constraint, and the focus area
      //       // "You are a helpful coding assistant. Keep responses under 3 sentences and focus on practical examples",
      //       "You are a friendly teacher who explains concepts using simple analogies. Always relate concepts to everyday experiences",
      //   },
      //   ...convertToModelMessages(messages),
      // ],

      // this is few shot approach
      messages: [
        {
          role: "system",
          content: "Convert user questions about React into code examples.",
        },
        {
          role: "user",
          content: "How to toggle a boolean?",
        },
        {
          role: "assistant",
          content:
            "const [isOpen, setIsOpen] = useState(false);\nconst toggle = () => setIsOpen(!isOpen)",
        },
        ...convertToModelMessages(messages),
      ],
    });

    result.usage.then((usage) => {
      console.log({
        messageCount: messages.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
