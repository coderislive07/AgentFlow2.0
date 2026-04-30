import { create } from 'zustand';

const initialAgents = {
  planner: { name: 'PlanZilla', role: 'Strategic Planner', status: 'idle', output: null },
  researcher: { name: 'QueryLyn', role: 'Research Specialist', status: 'idle', output: null },
  coder: { name: 'CodeWizard', role: 'Code Generation', status: 'idle', output: null },
  tester: { name: 'BugBuster', role: 'QA & Testing', status: 'idle', output: null },
  reporter: { name: 'DataBard', role: 'Report Generator', status: 'idle', output: null },
};

export const useOpsStore = create((set) => ({
  task: '',
  taskId: null,
  status: 'idle',
  logs: [],
  agents: initialAgents,
  output: {
    plan: null,
    research: null,
    code: null,
    tests: null,
    report: null,
  },

  setTask: (task) => set({ task }),

  setTaskId: (id) => set({ taskId: id }),

  setStatus: (status) => set({ status }),

  addLog: (timestamp, agent, message) =>
    set((state) => ({
      logs: [...state.logs, { timestamp, agent, message }],
    })),

  updateAgentStatus: (agent, status, output = null) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agent]: {
          ...state.agents[agent],
          status,
          output,
        },
      },
    })),

  setOutput: (output) =>
    set((state) => ({
      output: {
        ...state.output,
        ...output,
      },
    })),

  reset: () =>
    set({
      task: '',
      taskId: null,
      status: 'idle',
      logs: [],
      agents: initialAgents,
      output: {
        plan: null,
        research: null,
        code: null,
        tests: null,
        report: null,
      },
    }),

  updateFromServer: (data) =>
    set({
      status: data.status,
      logs: data.logs || [],
      agents: data.agentStatus || initialAgents,
      output: data.output || {},
    }),
}));
