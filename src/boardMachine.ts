import { Machine, assign } from 'xstate';
import KanbanDB from 'kanbandb/dist/KanbanDB';
import { Card, CardId, Column, Status } from './model';

interface MachineContext {
  columns: Column[];
  errorMessage: string;
}

type MachineEvent = RetryFetch;

const instance = KanbanDB.connect('');

export const boardMachine = Machine<MachineContext, any, MachineEvent>(
  {
    initial: 'fetching',
    context: {
      columns: [],
      errorMessage: ''
    },
    states: {
      fetching: {
        invoke: {
          src: 'fetchingCards',
          onDone: {
            target: 'viewingCards',
            actions: 'setCards'
          },
          onError: {
            target: 'fetchFailed',
            actions: 'setErrorMessage'
          }
        }
      },
      fetchFailed: {
        on: { RETRY_FETCH: 'fetchingCards' }
      },
      viewingCards: {}
    }
  },
  {
    services: {
      fetchingCards: (_) =>
        instance
          .then((db) => db.getCards().then((cards: Card[]) => cards))
          .catch((error: Error) => {
            // Don't error on 404s
            if (error.message === 'No data found.') {
              return [];
            }

            throw new Error(error.message);
          })
    }
  }
);

type RetryFetch = {
  type: 'RETRY_FETCH';
};
