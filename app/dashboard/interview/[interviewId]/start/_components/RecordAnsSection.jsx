"use client";
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModal';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { UserAnswer } from '@/utils/schema';
import { db } from '@/utils/db';

function RecordAnsSection({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
  const [userAnswer, setUserAnswer] = useState('');
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  // Update userAnswer when results change
  useEffect(() => {
    if (results.length > 0) {
      const newTranscript = results.map(result => result.transcript).join(' ');
      setUserAnswer(newTranscript);
    }
  }, [results]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const SaveAnswer = async () => {
    if (userAnswer.length < 10) {
      toast('Error while saving your answer. Please record again.');
      return;
    }

    setLoading(true);

    const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, User Answer: ${userAnswer}. Please provide a rating and feedback in JSON format with rating and feedback fields.`;
    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp = (await result.response.text()).replace('```json', '').replace('```', '');
    const JsonFeedbackResp = JSON.parse(mockJsonResp);

    if (!interviewData || !interviewData.mockId) {
      console.error("Interview data or mockId is missing or invalid");
      return;
    }

    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: JsonFeedbackResp?.feedback,
      rating: JsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format('DD-MM-yyyy'),
    });

    if (resp) {
      toast('User Answer recorded successfully');
      setUserAnswer('');
      setResults([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      SaveAnswer();
    }
  }, [isRecording]);

  return (
    <div className='flex justify-center flex-col'>
      <div className='flex flex-col justify-center rounded-lg p-5 mt-20 bg-black'>
        <Webcam
          mirrored={true}
          style={{
            height: 500,
            width: 500,
            zIndex: 10,
          }}
        />
      </div>
      <Button 
        disabled={loading}
        variant='outline' 
        className='my-10'
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className='text-red-600 flex gap-2'>
            <Mic /> Stop Recording...
          </h2>
        ) : (
          'Record Answer'
        )}
      </Button>
      <div>
        <Button onClick={() => console.log(userAnswer)}>
          Show User Answer
        </Button>
      </div>
    </div>
  );
}

export default RecordAnsSection;
