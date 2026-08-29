'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation } from '@/types/architecture';
import { compileDesignToCanonicalBIM } from '@/lib/bim/canonicalModel';
import {
  triggerRevitDesignAutomation,
  generateAECDataModelGraphQLQuery,
  extractAECDataModelNodes,
  DesignAutomationJob,
} from '@/lib/api/autodeskApsApi';
import {
  publishToSpeckleStream,
  getSpeckleViewerEmbedUrl,
} from '@/lib/api/speckleApi';
import {
  Cloud,
  Layers,
  Box,
  ExternalLink,
  Code,
  CheckCircle,
  Share2,
  RefreshCw,
  Cpu,
  Activity,
  Send,
  Terminal,
} from 'lucide-react';

interface CloudCollaborationModalProps {
  design: CandidateDesign;
  site: SiteInformation;
  onClose: () => void;
}

export const CloudCollaborationModal: React.FC<CloudCollaborationModalProps> = ({
  design,
  site,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'aps' | 'speckle' | 'graphql'>('aps');

  // APS State
  const [revitJob, setRevitJob] = useState<DesignAutomationJob | null>(null);
  const [runningRevit, setRunningRevit] = useState(false);

  // Speckle State
  const [streamId, setStreamId] = useState('archai-stream-01');
  const [branchName, setBranchName] = useState('main');
  const [commitMessage, setCommitMessage] = useState('AI Evolutionary Floor Plan v1.0');
  const [publishingSpeckle, setPublishingSpeckle] = useState(false);
  const [speckleCommitResult, setSpeckleCommitResult] = useState<{ commitId: string; streamUrl: string; objectCount: number } | null>(null);

  const building = compileDesignToCanonicalBIM(design, site);
  const aecNodes = extractAECDataModelNodes(building);
  const graphQLQuery = generateAECDataModelGraphQLQuery(building.id);

  const handleRunRevitAutomation = async () => {
    setRunningRevit(true);
    try {
      const job = await triggerRevitDesignAutomation(building, `ArchAI_${design.id}.rvt`);
      setRevitJob(job);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningRevit(false);
    }
  };

  const handlePublishSpeckle = async () => {
    setPublishingSpeckle(true);
    try {
      const res = await publishToSpeckleStream(
        'https://app.speckle.systems',
        streamId,
        branchName,
        building,
        commitMessage
      );
      setSpeckleCommitResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishingSpeckle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 text-slate-200 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-lg">
            <Cloud className="w-5 h-5" />
            <span>Cloud BIM Collaboration Hub (Autodesk APS & Speckle)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2.5 py-1 rounded-lg bg-slate-800 transition"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('aps')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'aps'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Autodesk Platform Services (APS)
          </button>
          <button
            onClick={() => setActiveTab('speckle')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'speckle'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Speckle AEC Data Stream
          </button>
          <button
            onClick={() => setActiveTab('graphql')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'graphql'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> AEC Data Model GraphQL
          </button>
        </div>

        {/* TAB 1: AUTODESK PLATFORM SERVICES */}
        {activeTab === 'aps' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Model Derivative Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">APS Model Derivative Engine</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded font-mono">SVF2 / RVT</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Translates ArchAI IFC and BIM elements into SVF2 optimized meshes for real-time browser rendering and object metadata extraction.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] font-mono text-slate-300 space-y-1">
                  <div>Status: <span className="text-emerald-400 font-bold">Online (US Region)</span></div>
                  <div>Manifest: <span className="text-sky-400 truncate block">urn:adsk.objects:archai_{building.id}</span></div>
                </div>
              </div>

              {/* Design Automation for Revit */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">Revit Automation API</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded font-mono">Revit 2024 Engine</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Automatically spins up cloud Revit instances to generate native editable <code className="text-sky-400">.rvt</code> projects with walls, columns, levels & families.
                </p>
                <button
                  onClick={handleRunRevitAutomation}
                  disabled={runningRevit}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningRevit ? 'animate-spin' : ''}`} />
                  {runningRevit ? 'Building Native Revit .RVT...' : 'Generate Native Revit .RVT Project'}
                </button>
              </div>

            </div>

            {/* Revit Automation Logs */}
            {revitJob && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Revit Design Automation Job Completed ({revitJob.id})</span>
                </div>
                <div className="bg-black/80 p-3 rounded-xl font-mono text-[10px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                  {revitJob.logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
                {revitJob.outputRvtUrl && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={revitJob.outputRvtUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      Download Native Revit .RVT File <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPECKLE AEC STREAM */}
        {activeTab === 'speckle' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 text-xs">Publish to Speckle Stream</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono">Speckle 2.0</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Stream canonical BIM building elements directly to Speckle Server for real-time collaboration with Rhino Grasshopper, Revit, Archicad, and PowerBI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px]">Stream ID</span>
                  <input
                    type="text"
                    value={streamId}
                    onChange={(e) => setStreamId(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px]">Branch Name</span>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-slate-400 text-[11px]">Commit Message</span>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handlePublishSpeckle}
                disabled={publishingSpeckle}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {publishingSpeckle ? 'Serializing & Publishing to Speckle...' : 'Publish BIM Commit to Speckle'}
              </button>
            </div>

            {speckleCommitResult && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Speckle Commit Published ({speckleCommitResult.commitId})</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Serialized <strong>{speckleCommitResult.objectCount} Speckle BuiltElements</strong> (Walls, Slabs, Columns, Rooms).
                </div>
                <div className="pt-2">
                  <a
                    href={speckleCommitResult.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-500/20 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition"
                  >
                    Open in Speckle 3D Web Viewer <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AEC DATA MODEL GRAPHQL */}
        {activeTab === 'graphql' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
            <p className="text-slate-400 text-[11px]">
              The Autodesk AEC Data Model provides granular GraphQL schema access to design parameters, categories, and level hierarchies without downloading raw files.
            </p>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 block text-xs">Autodesk AEC Data Model Query</span>
              <pre className="bg-black/90 p-3 rounded-xl font-mono text-[10px] text-purple-300 overflow-x-auto">
                {graphQLQuery}
              </pre>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 block text-xs">Extracted AEC Element Nodes ({aecNodes.length} items)</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {aecNodes.slice(0, 6).map((node) => (
                  <div key={node.id} className="bg-slate-900 p-2 rounded-xl flex justify-between items-center text-[10px]">
                    <div>
                      <span className="font-bold text-slate-200">{node.name}</span>
                      <span className="text-slate-500 ml-2">({node.category})</span>
                    </div>
                    <span className="font-mono text-purple-400">{node.properties.length} Properties</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
