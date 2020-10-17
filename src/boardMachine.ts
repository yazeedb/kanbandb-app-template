import { Machine, assign, DoneInvokeEvent } from 'xstate';
import KanbanDB from 'kanbandb/dist/KanbanDB';
import { Card, CardId, Column, createColumns, Status } from './model';

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
          src: 'fetchCards',
          onDone: {
            target: 'viewingCards',
            actions: 'setColumns'
          },
          onError: {
            target: 'fetchFailed',
            actions: 'setErrorMessage'
          }
        }
      },
      fetchFailed: {
        on: { RETRY_FETCH: 'fetching' }
      },
      viewingCards: {}
    }
  },
  {
    services: {
      fetchCards: (_) =>
        instance
          .then((db) => db.getCards().then((cards: Card[]) => cards))
          .catch((error: Error) => {
            // Don't error on 404s
            if (error.message === 'No data found.') {
              return [];
            }

            throw new Error(error.message);
          })
    },
    actions: {
      setColumns: assign({
        columns: (context, event) => {
          const e = event as DoneInvokeEvent<Card[]>;

          return createColumns(e.data);
        }
      })
    }
  }
);

type RetryFetch = {
  type: 'RETRY_FETCH';
};
