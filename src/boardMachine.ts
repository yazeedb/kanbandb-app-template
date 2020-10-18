import { Machine, assign, DoneInvokeEvent } from 'xstate';
import KanbanDB from 'kanbandb/dist/KanbanDB';
import {
  Card,
  CardId,
  Column,
  createColumns,
  emptyCard,
  Status
} from './model';

interface MachineContext {
  columns: Column[];
  errorMessage: string;
  pendingCard: Card;
}

type MachineEvent =
  | RetryFetch
  | AddCard
  | DeleteCard
  | UpdateCard
  | Exit
  | SubmitUpdates;

const instance = KanbanDB.connect('');

export const boardMachine = Machine<MachineContext, any, MachineEvent>(
  {
    initial: 'fetching',
    context: {
      columns: [],
      errorMessage: '',
      pendingCard: emptyCard
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
          },
          DELETE_CARD: 'viewingCards.deleting',
          UPDATE_CARD: {
            target: 'viewingCards.updating',
            actions: 'setPendingCard'
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
          deleting: {
            invoke: {
              src: 'deleteCard',
              onDone: 'refreshBoard',
              onError: 'refreshBoard'
            }
          },
          updating: {
            on: {
              EXIT: 'idle',
              SUBMIT_UPDATES: {
                target: 'submittingUpdates',
                cond: 'isValidUpdate'
              }
            }
          },
          submittingUpdates: {
            invoke: {
              src: 'updateCard',
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
        }),

      deleteCard: (context, event) => {
        return instance.then((db: any) => {
          const { id } = event as DeleteCard;

          return db.deleteCardById(id);
        });
      },

      updateCard: (context, event) => {
        return instance.then((db: any) => {
          const { card } = event as SubmitUpdates;

          return db.updateCardById(card.id, card);
        });
      }
    },

    actions: {
      setColumns: assign({
        columns: (context, event) => {
          const e = event as DoneInvokeEvent<Card[]>;

          return createColumns(e.data);
        }
      }),

      setPendingCard: assign({
        pendingCard: (context, event) => {
          const e = event as UpdateCard;

          return e.card;
        }
      })
    },

    guards: {
      isValidName: (context, event) => {
        const e = event as AddCard;

        return e.name.trim().length > 0;
      },

      isValidUpdate: (context, event) => {
        const { card } = event as SubmitUpdates;

        return card.name.trim().length > 0;
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

type DeleteCard = {
  type: 'DELETE_CARD';
  id: CardId;
};

type UpdateCard = {
  type: 'UPDATE_CARD';
  card: Card;
};

type Exit = {
  type: 'EXIT';
};

type SubmitUpdates = {
  type: 'SUBMIT_UPDATES';
  card: Card;
};
