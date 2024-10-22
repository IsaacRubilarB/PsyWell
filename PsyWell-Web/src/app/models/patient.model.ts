// src/app/models/patient.model.ts
export interface Patient {
  id: number;
  name: string;
  age: number;
  diagnosis: string;
  emotionalStatus: string;
  physiologicalMonitor: {
    heartRate: number;
    temperature: number;
    steps: number;
    hydration: number;
    sleep: number;
  };
}
