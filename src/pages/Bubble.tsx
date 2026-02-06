import React, { useState, useCallback } from 'react';
import { ArrowLeft, Workflow, RotateCcw, Copy, Check, Code2 } from 'lucide-react';
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
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setShowCodePanel(false);
  };

  const isDefaultOrder = orderedWorkflows.every((w, i) => w.id === workflows[i]?.id);

  const generateCodeSnippet = () => {
    const orderIds = orderedWorkflows.map(w => `  '${w.id}'`).join(',\n');
    return `Applique cet ordre dans workflowData.ts :\n\nexport const workflowOrder = [\n${orderIds},\n];`;
  };

  const copyToClipboard = async () => {
    const snippet = generateCodeSnippet();
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="ml-auto flex items-center gap-2">
            {!isDefaultOrder && (
              <>
                <button
                  onClick={() => setShowCodePanel(!showCodePanel)}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800
                             transition-colors px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-300
                             bg-blue-50 hover:bg-blue-100"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Appliquer au code</span>
                </button>
                <button
                  onClick={resetOrder}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900
                             transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showCodePanel && !isDefaultOrder && (
        <div className="bg-gray-900 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-200">Nouvel ordre des workflows</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Copiez ce snippet et collez-le dans le chat pour l'appliquer au code source.
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0
                  ${copied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
            <pre className="text-sm text-green-400 bg-gray-950 rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
              <span className="text-gray-500">// workflowData.ts - nouvel ordre</span>{'\n'}
              <span className="text-blue-400">export const</span> workflowOrder = [{'\n'}
              {orderedWorkflows.map((w, i) => (
                <React.Fragment key={w.id}>
                  {'  '}<span className="text-amber-300">'{w.id}'</span>
                  {i < orderedWorkflows.length - 1 ? ',' : ''}{' '}
                  <span className="text-gray-500">// {w.title}</span>{'\n'}
                </React.Fragment>
              ))}
              ];
            </pre>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Cartographie des workflows
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl">
            Vue d'ensemble de tous les processus et parcours utilisateur.
            Réorganisez les sections puis cliquez sur "Appliquer au code" pour générer le snippet.
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
