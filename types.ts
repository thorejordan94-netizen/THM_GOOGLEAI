export interface JobProfile {
  id: string;
  title: string;
  description: string;
}

export interface RoomMetadata {
  summary: string;
  description: string;
  difficulty: string;
  tags: string[];
  tools: string[];
  mainCategory: string;
  environment: string;
  keyTakeaways: string;
  timeEstimate: string;
  type: string; // 'Challenge' (CTF) or 'Walkthrough' (Learn)
}

export interface CareerRelevance {
  jobId: string;
  jobTitle: string;
  score: number; // 0-5
  justification: string;
}

export interface RoomData {
  id: string; // The slug/name from the list
  name: string;
  status: 'idle' | 'queued' | 'analyzing' | 'complete' | 'error';
  metadata?: RoomMetadata;
  analysis?: CareerRelevance[];
  url?: string;
}

export interface AnalysisResponseSchema {
  metadata: RoomMetadata;
  analysis: {
    windowsClient: { score: number; reason: string };
    windowsServer: { score: number; reason: string };
    network: { score: number; reason: string };
    dba: { score: number; reason: string };
    linux: { score: number; reason: string };
  };
}