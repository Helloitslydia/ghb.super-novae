import React from 'react';
import { ArrowLeft, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workflows } from './bubble/workflowData';
import { WorkflowSection } from './bubble/WorkflowSection';
import { StatusLifecycle } from './bubble/StatusLifecycle';

export default function Bubble() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-gray-700" />
            <h1 className="text-lg font-semibold text-gray-900">Workflows</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Cartographie des workflows
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl">
            Vue d'ensemble de tous les processus et parcours utilisateur de l'application.
            Survolez chaque bulle pour voir le détail de l'étape.
          </p>
        </div>

        <div className="space-y-6">
          {workflows.map((section) => (
            <WorkflowSection key={section.id} section={section} />
          ))}
          <StatusLifecycle />
        </div>
      </main>
    </div>
  );
}
