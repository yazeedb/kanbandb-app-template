import { Machine, assign, DoneInvokeEvent } from 'xstate';
import KanbanDB from 'kanbandb/dist/KanbanDB';
import { Card, CardId, Column, createColumns, Status } from './model';

interface MachineContext {
  columns: Column[];
  errorMessage: string;
}

type MachineEvent = RetryFetch | AddCard;

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
      viewingCards: {
        initial: 'idle',
        on: {
          ADD_CARD: {
            target: 'viewingCards.adding',
            cond: 'isValidName'
          }
        },
        states: {
          idle: {},
          adding: {
            invoke: {
              src: 'addCard',
              onDone: 'refreshBoard',
              onError: 'refreshBoard'
            }
          },
          refreshBoard: {
            invoke: {
              src: 'fetchCards',
              onDone: {
                target: 'idle',
                actions: 'setColumns'
              },
              onError: {
                target: 'refreshFailed',
                actions: 'setErrorMessage'
              }
            }
          },
          refreshFailed: {}
        }
      }
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
          }),

      addCard: (context, event) =>
        instance.then((db) => {
          const { name, status, description } = event as AddCard;

          return db.addCard({
            name: name.trim(),
            status: status.trim(),
            description: description.trim()
          });
        })
    },

    actions: {
      setColumns: assign({
        columns: (context, event) => {
          const e = event as DoneInvokeEvent<Card[]>;

          return createColumns(e.data);
        }
      })
    },

    guards: {
      isValidName: (context, event) => {
        const e = event as AddCard;

        return e.name.trim().length > 0;
      }
    }
  }
);

type RetryFetch = {
  type: 'RETRY_FETCH';
};

type AddCard = {
  type: 'ADD_CARD';
  name: string;
  description: string;
  status: Status;
};
