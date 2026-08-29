'use client';

import React, { useState, useEffect } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements } from '@/types/architecture';
import {
  ProjectPersistenceService,
  SavedProjectRecord,
  DesignVersionSnapshot,
} from '@/lib/db/projectPersistenceService';
import {
  ObjectStorageClient,
  StoredObjectMetadata,
  BucketNamespace,
} from '@/lib/storage/objectStorageClient';
import {
  Database,
  Cloud,
  History,
  Save,
  FolderOpen,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Download,
  HardDrive,
  FileCode,
  Image,
  Box,
  Layers,
  Clock,
} from 'lucide-react';

interface ProjectPersistenceModalProps {
  currentSite: SiteInformation;
  currentRequirements: BuildingRequirements;
  currentDesigns: CandidateDesign[];
  activeDesignId: string;
  onLoadProject: (project: SavedProjectRecord) => void;
  onRestoreVersion: (version: DesignVersionSnapshot) => void;
  onClose: () => void;
}

export const ProjectPersistenceModal: React.FC<ProjectPersistenceModalProps> = ({
  currentSite,
  currentRequirements,
  currentDesigns,
  activeDesignId,
  onLoadProject,
  onRestoreVersion,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'versions' | 'storage'>('projects');
  const [projectTitle, setProjectTitle] = useState<string>('Modern Sustainable Villa');
  const [savedProjects, setSavedProjects] = useState<SavedProjectRecord[]>([]);
  const [versionHistory, setVersionHistory] = useState<DesignVersionSnapshot[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<BucketNamespace | 'all'>('all');
  const [storageObjects, setStorageObjects] = useState<StoredObjectMetadata[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, [activeDesignId]);

  const refreshData = () => {
    setSavedProjects(ProjectPersistenceService.listProjects());
    setVersionHistory(ProjectPersistenceService.listVersions(activeDesignId));
    setStorageObjects(ObjectStorageClient.listObjects());
  };

  const handleSaveToCloud = () => {
    const record = ProjectPersistenceService.saveProject(
      projectTitle,
      currentSite,
      currentRequirements,
      currentDesigns,
      activeDesignId
    );
    setSaveSuccessMsg(`Project "${record.title}" saved to PostgreSQL with PostGIS geometry!`);
    refreshData();
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ProjectPersistenceService.deleteProject(id);
    refreshData();
  };

  const filteredStorageObjects = selectedNamespace === 'all'
    ? storageObjects
    : storageObjects.filter((o) => o.namespace === selectedNamespace);

  const totalStorageMB = +(
    storageObjects.reduce((sum, o) => sum + o.sizeBytes, 0) / (1024 * 1024)
  ).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 text-slate-200 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-lg">
            <Database className="w-5 h-5" />
            <span>PostgreSQL + PostGIS &amp; Cloud Storage Hub</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2.5 py-1 rounded-lg bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'projects' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" /> Saved Projects ({savedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'versions' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Design Revision History ({versionHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'storage' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" /> Cloudflare R2 / AWS S3 ({storageObjects.length} Assets)
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[62vh] overflow-y-auto pr-1">
          
          {/* TAB 1: SAVED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-5 text-xs">
              
              {/* Save Project Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-sm block">Save Current Active Workspace to Cloud</span>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title (e.g. Bandra Eco Villa)"
                    className="flex-1 min-w-[240px] bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 font-medium text-xs focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleSaveToCloud}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save Project to Database
                  </button>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Projects List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-400 text-xs block">Saved Database Projects:</span>
                
                {savedProjects.length === 0 ? (
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-slate-500">
                    No projects saved yet. Click "Save Project to Database" above to create your first cloud record.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedProjects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          onLoadProject(proj);
                          onClose();
                        }}
                        className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl cursor-pointer transition space-y-2 group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-200 text-sm group-hover:text-sky-300 transition block">
                              {proj.title}
                            </span>
                            <span className="text-[11px] text-slate-400">{proj.description}</span>
                          </div>
                          <button
                            onClick={(e) => handleDelete(proj.id, e)}
                            className="text-slate-600 hover:text-rose-400 p-1 rounded-lg transition"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                          <span>Jurisdiction: {proj.jurisdiction}</span>
                          <span>{proj.designs.length} Designs • Rev #{proj.versionCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: DESIGN VERSION HISTORY */}
          {activeTab === 'versions' && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-200 text-sm block">
                Immutable Design Snapshots for Active Candidate ({activeDesignId})
              </span>

              {versionHistory.length === 0 ? (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-slate-500">
                  No version snapshots created for this candidate design yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {versionHistory.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sky-400 font-mono text-xs">
                            Revision #{ver.versionNumber}
                          </span>
                          <span className="text-slate-200 font-semibold">{ver.changelog}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Saved: {new Date(ver.createdAt).toLocaleString()} • Built Area: {ver.snapshot.totalBuiltUpArea} sq ft
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onRestoreVersion(ver);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                      >
                        Restore Snapshot
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OBJECT STORAGE BROWSER */}
          {activeTab === 'storage' && (
            <div className="space-y-4 text-xs">
              
              {/* Storage Overview Banner */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-sky-400" />
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Cloudflare R2 Bucket: archai-assets-prod</span>
                    <span className="text-[11px] text-slate-500 font-mono">Zero-Binary DB Rule Enforced: GLBs and renders stored in S3/R2</span>
                  </div>
                </div>
                <div className="font-mono text-right text-xs">
                  <span className="font-bold text-sky-400">{totalStorageMB} MB</span>
                  <span className="text-slate-500 block text-[10px]">Total Object Size</span>
                </div>
              </div>

              {/* Namespace Filter Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'models', 'renders', 'exports', 'site-images', 'reports', 'assets'] as const).map((ns) => (
                  <button
                    key={ns}
                    onClick={() => setSelectedNamespace(ns)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      selectedNamespace === ns
                        ? 'bg-sky-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    /{ns}
                  </button>
                ))}
              </div>

              {/* Objects Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Object Key / File</th>
                      <th className="p-2.5">Namespace</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Content Type</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                    {filteredStorageObjects.map((obj) => (
                      <tr key={obj.key} className="hover:bg-slate-900/50">
                        <td className="p-2.5 text-slate-200 font-bold max-w-[280px] truncate" title={obj.key}>
                          {obj.filename}
                        </td>
                        <td className="p-2.5 text-sky-400">/{obj.namespace}</td>
                        <td className="p-2.5">{(obj.sizeBytes / (1024 * 1024)).toFixed(2)} MB</td>
                        <td className="p-2.5 text-slate-500">{obj.contentType}</td>
                        <td className="p-2.5 text-right">
                          <a
                            href={obj.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 font-bold inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
