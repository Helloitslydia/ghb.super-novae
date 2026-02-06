import React, { useState } from 'react';
import { ChevronRight, GitBranch } from 'lucide-react';
import type { WorkflowSection as WorkflowSectionType, FlowStep } from './workflowData';

const accentBorderMap: Record<string, string> = {
  blue: 'border-l-blue-500',
  emerald: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  sky: 'border-l-sky-500',
};

const accentDotMap: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
};

function BubbleNode({ step, index }: { step: FlowStep; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = step.icon;

  return (
    <div
      className="flex flex-col items-center gap-2.5 relative flex-shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animation: `bubble-appear 0.4s ease-out ${index * 80}ms both` }}
    >
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
                    shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer
                    hover:scale-110 ${step.bgColor}`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.8} />
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-gray-600 text-center max-w-[72px] sm:max-w-[84px] leading-tight">
        {step.label}
      </span>
      {hovered && (
        <div className="absolute bottom-full mb-3 bg-gray-900/95 backdrop-blur-sm text-white text-xs
                        rounded-lg px-3 py-2 pointer-events-none z-30 max-w-[220px] text-center
                        animate-fade-in shadow-xl whitespace-normal">
          {step.description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                          border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent
                          border-t-[6px] border-t-gray-900/95" />
        </div>
      )}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center self-start mt-5 sm:mt-6 px-0.5 sm:px-1 flex-shrink-0">
      <div className="h-px w-4 sm:w-8 bg-gray-300" />
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 -ml-1.5" />
    </div>
  );
}

interface WorkflowSectionProps {
  section: WorkflowSectionType;
}

export function WorkflowSection({ section }: WorkflowSectionProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${accentBorderMap[section.accentColor]} overflow-hidden`}>
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${accentDotMap[section.accentColor]}`} />
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 ml-5">{section.subtitle}</p>

        <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8 pb-2">
          <div className="flex items-start gap-0 min-w-max">
            {section.steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <BubbleNode step={step} index={i} />
                {i < section.steps.length - 1 && <FlowArrow />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {section.branches && (
          <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
            <div className="flex items-center gap-1.5 mb-4">
              <GitBranch className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Décisions possibles
              </span>
            </div>
            <div className="flex items-start gap-4 sm:gap-6 flex-wrap">
              {section.branches.map((branch, bi) =>
                branch.map((step) => (
                  <BubbleNode key={step.id} step={step} index={section.steps.length + bi} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
