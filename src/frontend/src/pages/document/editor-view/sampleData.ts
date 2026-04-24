export const editors: ActiveEditor[] = [
  {
    id: '1',
    name: 'Lucy',
    color: 'ruby',
  },
  {
    id: '2',
    name: 'Steven',
    color: 'blue',
  },
  {
    id: '3',
    name: 'Karl',
    color: 'green',
  },
];

export type ActiveEditor = {
  id: string;
  name: string;
  color: string;
};
