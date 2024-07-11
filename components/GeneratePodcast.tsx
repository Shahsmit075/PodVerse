import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { GeneratePodcastProps } from '../types';
import { Loader } from 'lucide-react';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import Image from 'next/image';


const GeneratePodcast = ({ setAudio, setAudioStorageId, audio, voiceType, voicePrompt, setVoicePrompt, setAudioDuration }: GeneratePodcastProps) => {
  const [isAiAudio, setIsAiAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getAudioUrl = useMutation(api.podcasts.getUrl);
  const handleGenerateAudio = useAction(api.openai.generateAudioAction);

  const handleAudio = async (blob: Blob, fileName: string) => {
    setIsAudioLoading(true);
    setAudio('');

    try {
      const file = new File([blob], fileName, { type: 'audio/mp3' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsAudioLoading(false);
      toast({
        title: "Audio generated successfully",
      });
    } catch (error) {
      console.log(error);
      toast({ title: 'Error generating audio', variant: 'destructive' });
    }
  };

  const generateAudio = async () => {
    try {
      const response = await handleGenerateAudio({ input: voicePrompt, voice: voiceType || '' });
      const blob = new Blob([response], { type: 'audio/mp3' });
      handleAudio(blob, `audio-${uuidv4()}.mp3`);
    } catch (error) {
      console.log(error);
      toast({ title: 'Error generating audio', variant: 'destructive' });
    }
  };

  const uploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer()
        .then((ab) => new Blob([ab]));

      handleAudio(blob, file.name);
    } catch (error) {
      console.log(error);
      toast({ title: 'Error uploading audio', variant: 'destructive' });
    }
  };

  return (
    <>
      <div className="generate_thumbnail">
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiAudio(true)}
          className={cn('', {
            'bg-black-6': isAiAudio,
          })}
        >
          Use AI to generate audio
        </Button>
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiAudio(false)}
          className={cn('', {
            'bg-black-6': !isAiAudio,
          })}
        >
          Upload custom audio
        </Button>
      </div>
      {isAiAudio ? (
        <div className="flex flex-col gap-5">
          <div className="mt-5 flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
              AI Prompt to generate Audio
            </Label>
            <Textarea
              className="input-class font-light focus-visible:ring-offset-orange-1"
              placeholder="Provide text to generate audio (Currently not available due to limitatoins in OPENAI API...)
               - Contact Admin for access"
              rows={5}
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
            />
          </div>
          <div className="w-full max-w-[200px]">
            <Button type="submit" className="text-16 bg-orange-1 py-4 font-bold text-white-1" onClick={generateAudio}>
              {isAudioLoading ? (
                <>
                  Generating
                  <Loader size={20} className="animate-spin ml-2" />
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="image_div" onClick={() => audioRef?.current?.click()}>
          <Input
            type="file"
            className="hidden"
            ref={audioRef}
            onChange={(e) => uploadAudio(e)}
          />
          {!isAudioLoading ? (
            <Image src="/icons/upload-image.svg" width={40} height={40} alt="upload" />
          ) : (
            <div className="text-16 flex-center font-medium text-white-1">
              Uploading
              <Loader size={20} className="animate-spin ml-2" />
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-12 font-bold text-orange-1">
              Click to upload
            </h2>
            <p className="text-12 font-normal text-gray-1">MP3 files only</p>
          </div>
        </div>
      )}
      {audio && (
        <div className="flex-center w-full">
          <audio controls className="mt-5">
            <source src={audio} type="audio/mp3" />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}
    </>
  );
};

export default GeneratePodcast;

