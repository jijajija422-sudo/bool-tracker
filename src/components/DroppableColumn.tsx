import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../utils/cn';

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, title, count, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 min-w-[300px] h-full flex flex-col bg-off-white bg-opacity-50 rounded-2xl transition-colors duration-200 overflow-hidden',
        isOver && 'bg-sage-50 bg-opacity-100'
      )}
    >
      <div className="flex items-center justify-between p-6 pb-2 shrink-0">
        <h3 className="text-lg font-serif font-semibold text-sage-800 tracking-wide uppercase text-xs">
          {title}
        </h3>
        <span className="text-sage-400 text-sm font-medium">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar min-h-0">{children}</div>
    </div>
  );
};

export default DroppableColumn;
