export interface Card {
  id: CardId;
  name: string;
  description: string;
  status: Status;
  created: UnixTimestamp;
  lastUpdated: UnixTimestamp;
}

export type CardId = 'string';
export type Status = 'TODO' | 'DOING' | 'DONE';

export interface Column {
  id: Status;
  name: string;
  cards: Card[];
}

type UnixTimestamp = number;
