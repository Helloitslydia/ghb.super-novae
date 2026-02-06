import React, { useState, useCallback } from 'react';
import { ArrowLeft, Workflow, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workflows } from './bubble/workflowData';
import { WorkflowSection } from './bubble/WorkflowSection';
import { StatusLifecycle } from './bubble/StatusLifecycle';

const STORAGE_KEY = 'bubble-workflow-order';

function loadOrder() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const order = JSON.parse(saved) as string[];
      const ordered = order
        .map(id => workflows.find(w => w.id === id))
        .filter(Boolean) as typeof workflows;
      const remaining = workflows.filter(w => !order.includes(w.id));
      return [...ordered, ...remaining];
    }
  } catch { /* ignore */ }
  return [...workflows];
}

export default function Bubble() {
  const navigate = useNavigate();
  const [orderedWorkflows, setOrderedWorkflows] = useState(loadOrder);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const saveOrder = useCallback((items: typeof workflows) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(w => w.id)));
  }, []);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDropIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const items = [...orderedWorkflows];
    const [removed] = items.splice(dragIndex, 1);
    items.splice(index, 0, removed);
    setOrderedWorkflows(items);
    saveOrder(items);
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...orderedWorkflows];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    setOrderedWorkflows(items);
    saveOrder(items);
  };

  const moveDown = (index: number) => {
    if (index === orderedWorkflows.length - 1) return;
    const items = [...orderedWorkflows];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    setOrderedWorkflows(items);
    saveOrder(items);
  };

  const resetOrder = () => {
    setOrderedWorkflows([...workflows]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isDefaultOrder = orderedWorkflows.every((w, i) => w.id === workflows[i]?.id);

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
          {!isDefaultOrder && (
            <button
              onClick={resetOrder}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900
                         transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Réinitialiser l'ordre</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Cartographie des workflows
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl">
            Vue d'ensemble de tous les processus et parcours utilisateur de l'application.
            Glissez-déposez les sections ou utilisez les flèches pour réorganiser l'ordre.
          </p>
        </div>

        <div className="space-y-4">
          {orderedWorkflows.map((section, index) => (
            <WorkflowSection
              key={section.id}
              section={section}
              index={index}
              total={orderedWorkflows.length}
              isDragging={dragIndex === index}
              isDropTarget={dropIndex === index && dragIndex !== index}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              onMoveUp={() => moveUp(index)}
              onMoveDown={() => moveDown(index)}
            />
          ))}
          <StatusLifecycle />
        </div>
      </main>
    </div>
  );
}
