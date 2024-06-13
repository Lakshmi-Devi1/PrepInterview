"use client";
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModal';
import { LoaderCircle } from 'lucide-react';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { useRouter } from 'next/navigation';

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobPosition, setJobPosition] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [jobExperience, setJobExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const router = useRouter();

    const resetForm = () => {
        setJobPosition('');
        setJobDesc('');
        setJobExperience('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const InputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. Based on the Job Position, Job Description, and Years of Experience, provide us ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} Interview questions along with answers in JSON format. Provide 'question' and 'answer' fields in the JSON.`;

        try {
            const result = await chatSession.sendMessage(InputPrompt);
            const responseText = await result.response.text();
            const cleanedResponseText = responseText.replace('```json', '').replace('```', '');

            try {
                const parsedResponse = JSON.parse(cleanedResponseText);
                console.log('Parsed Response:', parsedResponse);

                // Extract and log the ratings and feedbacks
                parsedResponse.forEach((question, index) => {
                    console.log(`Question ${index + 1} Rating:`, question.rating);
                    console.log(`Question ${index + 1} Feedback:`, question.feedback);
                });

                const resp = await db.insert(MockInterview)
                    .values({
                        mockId: uuidv4(),
                        jsonMockResp: JSON.stringify(parsedResponse),
                        jobPosition: jobPosition,
                        jobDesc: jobDesc,
                        jobExperience: jobExperience,
                        createdBy: user?.primaryEmailAddress?.emailAddress,
                        createdAt: moment().format('DD-MM-YYYY')
                    }).returning({ mockId: MockInterview.mockId });

                if (resp.length > 0) {
                    resetForm();
                    setOpenDialog(false);
                    router.push(`/dashboard/interview/${resp[0]?.mockId}`);
                }
            } catch (jsonError) {
                console.error('Error parsing JSON:', jsonError);
                console.error('Response text:', cleanedResponseText);
                toast.error('Failed to parse AI response. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to generate interview questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition' onClick={() => setOpenDialog(true)}>
                <h2 className='font-bold text-lg text-center'>
                    +Add New
                </h2>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='text-4xl text-indigo-500'>Tell us about your job interview</DialogTitle>
                        <DialogDescription>
                            <form onSubmit={onSubmit}>
                                <div>
                                    <h2 className='text-2xl'>Add details about your job position/role, job description, and years of experience</h2>
                                    <div className='mt-7 my-3 text-xl'>
                                        <label>Job Role/Job Position</label>
                                        <Input
                                            placeholder="Ex: full stack developer"
                                            required
                                            value={jobPosition}
                                            onChange={(event) => setJobPosition(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3 text-xl'>
                                        <label className='text-2xl'> Job Description/Tech Stack</label>
                                        <Textarea
                                            placeholder="Ex: React, Angular, Nodejs"
                                            required
                                            value={jobDesc}
                                            onChange={(event) => setJobDesc(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3 text-xl'>
                                        <label>Years of experience</label>
                                        <Input
                                            placeholder="Ex: 5"
                                            type="number"
                                            max="50"
                                            required
                                            value={jobExperience}
                                            onChange={(event) => setJobExperience(event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-5 justify-end text-2xl'>
                                    <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <LoaderCircle className='animate-spin' /> Generating from AI
                                            </>
                                        ) : (
                                            'Start Interview'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AddNewInterview;
