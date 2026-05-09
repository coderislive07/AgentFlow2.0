import { create } from 'zustand';

const initialAgents = {
  planner: {
    name: 'PlanZilla',
    role: 'Strategic Planner',
    status: 'idle',
    output: null,
  },

  researcher: {
    name: 'QueryLyn',
    role: 'Research Specialist',
    status: 'idle',
    output: null,
  },

  developer: {
    name: 'CodeWizard',
    role: 'Code Generation',
    status: 'idle',
    output: null,
  },

  tester: {
    name: 'BugBuster',
    role: 'QA & Testing',
    status: 'idle',
    output: null,
  },

  reporter: {
    name: 'DataBard',
    role: 'Report Generator',
    status: 'idle',
    output: null,
  },
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

  setTask: (task) =>
    set({
      task,
    }),

  setTaskId: (id) =>
    set({
      taskId: id,
    }),

  setStatus: (status) =>
    set({
      status,
    }),

  addLog: (timestamp, agent, message) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          timestamp,
          agent,
          message,
        },
      ],
    })),

  updateAgentStatus: (
    agent,
    status,
    output = null
  ) =>
    set((state) => ({
      agents: {
        ...state.agents,

        [agent]: {
          ...state.agents[agent],

          status:
            status || state.agents[agent]?.status,

          output:
            output ??
            state.agents[agent]?.output,
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

  updateFromServer: (data) => {
  console.log('💾 Store updateFromServer called with:', data);
  set((state) => {
    const nextAgents = { ...state.agents };
    if (data.agentStatus && typeof data.agentStatus === 'object') {
      for (const [key, patch] of Object.entries(data.agentStatus)) {
        if (patch == null) continue;
        const prev = nextAgents[key] || initialAgents[key] || {};
        nextAgents[key] = { ...prev, ...patch };
        console.log(`  ✏️ Updated agent ${key}:`, nextAgents[key]);
      }
    }

    const newState = {
      status: data.status ?? state.status,
      logs:
        data.logs !== undefined
          ? Array.isArray(data.logs)
            ? [...data.logs]
            : state.logs
          : state.logs,
      agents: nextAgents,
      output: data.output != null ? data.output : state.output,
    };

    console.log('💾 New state:', {
      status: newState.status,
      logsCount: newState.logs.length,
      agentKeys: Object.keys(newState.agents),
    });

    return newState;
  });
},
}));