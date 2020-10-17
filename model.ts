export interface Card {
  id: CardId;
  name: string;
  description: string;
  status: Status;
  created: UnixTimestamp;
  lastUpdated: number;
}

export type CardId = 'string';

export interface Column {
  id: Status;
  name: string;
  cards: Card[];
}

type Status = 'TODO' | 'DOING' | 'DONE';
type UnixTimestamp = number;
