import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import OpenAi from 'openai'
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";


const openai = new OpenAi({ 
    apiKey: process.env.OPENAI_API_KEY,
})

export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (_, { voice, input }) => {
   
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice as SpeechCreateParams['voice'],
        input
      });
      
      const buffer = await mp3.arrayBuffer();
    //   await fs.promises.writeFile(speechFile, buffer);
    return buffer;
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (_, { prompt }) => {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      quality:'standard',
      n:1
    })

    const url = response.data[0].url;

    if(!url) {
      throw new Error('Error generating image');
    }

    const imageResponse = await fetch(url);
    const buffer = await imageResponse.arrayBuffer();

    return buffer;

  },
})