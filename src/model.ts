export interface Card {
  id: CardId;
  name: string;
  description: string;
  status: Status;
  created: UnixTimestamp;
  lastUpdated: UnixTimestamp;
}

export type CardId = string;
export type Status = 'TODO' | 'DOING' | 'DONE';

export interface Column {
  id: Status;
  name: string;
  cards: Card[];
}

const columns: Column[] = [
  { id: 'TODO', name: 'To-do', cards: [] },
  { id: 'DOING', name: 'In Progress', cards: [] },
  { id: 'DONE', name: 'Done', cards: [] }
];

export const createColumns = (cards: Card[]): Column[] =>
  columns.map((col) => ({
    ...col,
    cards: cards.filter((card) => card.status === col.id)
  }));

export const emptyCard: Card = {
  id: '',
  name: '',
  description: '',
  created: -1,
  lastUpdated: -1,
  status: 'TODO'
};

type UnixTimestamp = number;
