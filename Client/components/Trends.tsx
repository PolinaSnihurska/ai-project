import React from 'react';
import { topCat } from '@/app/data';

const Trends = () => {
  return (
    <div className='w-full max-w-[1300px] mx-auto px-4 xl:px-0 mt-6'>
        <div className='flex overflow-x-auto gap-5 snap-proximity snap-x pb-4 custom-scrollbar'>
            {topCat.map((Cat,index)=>
                <div key={index} className='min-w-[300px] mb-2 min-h-[80px] rounded-[10px] border-[1px] flex justify-between items-center snap-center hover:shadow-md transition-shadow'>
                    <div className='flex flex-row ml-2 items-center justify-center'>
                        {/* Додали flex items-center justify-center щоб іконка завжди була рівно по центру сірого квадратика */}
                        <div className='p-[4px] rounded-[10px] bg-gray-100 flex items-center justify-center'>
                            {/* ❗️ Додали object-contain */}
                            <img className='w-[30px] h-[30px] m-[8px] object-contain' src={Cat.imgLink} alt={Cat.name}/>
                        </div>
                        <div className='ml-4'>
                            <p className='text-[14px] font-bold text-gray-800 tracking-[1px] uppercase'>{Cat.name}</p>
                            <a href={Cat.showLink} className='text-[14px] font-semibold tracking-[0.5px] text-[#4593c8] hover:text-[#31729f] transition-colors'>Show All</a>
                        </div>
                    </div>
                    <div className='h-[60%] mr-5'>
                        <p className='text-[12px] text-silver'>({Cat.quantity})</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default Trends;