"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'

function Interview({ params }) {
    const [interviewData, setInterviewData] = useState();
    const [webCamEnabled, setWebCamEnabled] = useState();
    
    useEffect(() => {
        console.log(params.interviewId)
        GetInterviewDetails();
    }, [])

    /**
     * Used to Get Interview Details by MockId/Interview Id
     */
    const GetInterviewDetails = async () => {
        const result = await db.select().from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewId))

        setInterviewData(result[0]);
    }

    return (
        <div className='my-10 px-5'>
            <h2 className='font-bold text-6xl mb-10 text-center'>Let's Get Started</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>

                <div className='flex flex-col gap-10'>
                    <div className='flex flex-col p-10 rounded-lg border gap-5 text-2xl'>
                        <h2><strong>Job Role/Job Position:</strong> {interviewData?.jobPosition} </h2>
                        <h2><strong>Job Description/Tech Stack:</strong> {interviewData?.jobDesc} </h2>
                        <h2><strong>Years of Experience:</strong> {interviewData?.jobExperience} </h2>
                    </div>
                    <div className='p-10 border rounded-lg border-yellow-300 bg-yellow-100 text-2xl'>
                        <h2 className='flex gap-2 items-center text-yellow-500 text-4xl'>
                            <Lightbulb />
                            <strong>Information</strong>
                        </h2>
                        <h2 className='mt-3 text-yellow-500'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                    </div>
                </div>
                <div className='flex flex-col items-center'>
                    {webCamEnabled ? <Webcam
                        onUserMedia={() => setWebCamEnabled(true)}
                        onUserMediaError={() => setWebCamEnabled(false)}
                        mirrored={true}
                        style={{
                            height: 500,
                            width: 500
                        }}
                    />
                        :
                        <>
                            <WebcamIcon className='h-96 w-96 my-7 p-20 bg-secondary rounded-lg border' />
                            <Button  className="w-40 text-2xl py-4" onClick={() => setWebCamEnabled(true)}>Click Here</Button>
                        </>
                    }
                </div>

            </div>
            <div className='flex justify-end items-end mt-10'>
                <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
                    <Button size="lg" className="text-2xl py-4 px-8">Start Interview</Button>
                </Link>
            </div>

        </div>
    )
}

export default Interview
