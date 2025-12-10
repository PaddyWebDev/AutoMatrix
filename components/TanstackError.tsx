import React from 'react'
import { TriangleAlert } from 'lucide-react'

export default function TanstackError() {
    return (
        <div className='h-dvh w-full flex items-center justify-center'>
            <div className="flex flex-row text-red-500 bg-neutral-100 font-bold items-center gap-2 px-5 py-3 shadow-md text-2xl" >
                Error Occurred <TriangleAlert className=' h-6 w-6' />
            </div>
        </div>
    )
}
