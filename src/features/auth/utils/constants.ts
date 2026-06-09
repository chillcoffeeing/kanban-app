export const TEST_ACCOUNTS = [
  { email: 'alice@kanban.dev', label: 'Tech Lead (dueño Board 1)' },
  { email: 'bob@kanban.dev', label: 'Frontend Dev (dueño Board 2)' },
  { email: 'carol@kanban.dev', label: 'UX Designer' },
  { email: 'dave@kanban.dev', label: 'Backend Dev' },
  { email: 'eve@kanban.dev', label: 'Mobile Dev (dueño Board 3)' },
  { email: 'frank@kanban.dev', label: 'DevOps Engineer' },
  { email: 'grace@kanban.dev', label: 'Data Engineer' },
];

export const PASSWORD = 'Passw0rd!';

export const INITIAL_FORM = {
  name: '', email: '', password: '',
  username: '', displayName: '', jobTitle: '', company: '',
};

export type FormField = keyof typeof INITIAL_FORM;
