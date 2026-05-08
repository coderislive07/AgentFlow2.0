import { create } from 'zustand';

const initialAgents = {
  planner: {
    name: 'Planzilla',
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
    role: 'Full-Stack Developer',
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

  updateFromServer: (data) => {
    console.log('STORE UPDATE:', data);

    set({
      status: data.status || 'idle',

      logs: [...(data.logs || [])],

      agents: {
        planner: {
          ...initialAgents.planner,
          ...(data.planner || {}),
        },

        researcher: {
          ...initialAgents.researcher,
          ...(data.researcher || {}),
        },

        developer: {
          ...initialAgents.developer,
          ...(data.developer || {}),
        },

        tester: {
          ...initialAgents.tester,
          ...(data.tester || {}),
        },

        reporter: {
          ...initialAgents.reporter,
          ...(data.reporter || {}),
        },
      },

      output: {
        plan:
          data.planner?.plan ||
          data.planner?.output ||
          null,

        research:
          data.researcher?.research ||
          data.researcher?.output ||
          null,

        code:
          data.developer?.implementation ||
          data.developer?.output ||
          null,

        tests:
          data.tester?.test_report ||
          data.tester?.output ||
          null,

        report:
          data.reporter?.final_report ||
          data.reporter?.output ||
          null,
      },
    });
  },
}));