import { Machine, assign, DoneInvokeEvent } from 'xstate';
import KanbanDB from 'kanbandb/dist/KanbanDB';
import { Card, Column, createColumns, emptyCard, Status } from './model';

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
  | MoveCard
  | Exit
  | SubmitUpdates
  | ConfirmDelete;

const instance = KanbanDB.connect('');

const verbs = ['pick up', 'take out', 'clean', 'add', 'drive', 'ask'];
const nouns = ['milk', 'garbage', 'bathroom', 'garage', 'doctor', 'mother'];
const statuses = ['TODO', 'DOING', 'DONE'];

((totalCards) => {
  while (totalCards--) {
    const verb = verbs[Math.floor(Math.random() * (verbs.length))];
    const noun = nouns[Math.floor(Math.random() * (nouns.length))];
    const status = statuses[Math.floor(Math.random() * (statuses.length))] as Status;
    instance.then((db) => {
      db.addCard({
        name: `${verb} the ${noun}`,
        description: 'If you forget, you\'re toast!',
        status
      });
    });
  }
})(100);

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
          DELETE_CARD: {
            target: 'viewingCards.confirmingDelete',
            actions: 'setPendingCard'
          },
          UPDATE_CARD: {
            target: 'viewingCards.draftingUpdates',
            actions: 'setPendingCard'
          },
          MOVE_CARD: {
            target: 'viewingCards.submittingUpdates',
            actions: ['setPendingCard', 'optimisticallyMoveCard']
          }
        },
        onDone: 'fetching',
        states: {
          idle: {},
          adding: {
            invoke: {
              src: 'addCard',
              onDone: 'changeSuccess',
              onError: {
                target: 'idle',
                actions: 'flashError'
              }
            }
          },
          confirmingDelete: {
            on: {
              EXIT: 'idle',
              CONFIRM_DELETE: 'deleting'
            }
          },
          deleting: {
            invoke: {
              src: 'deleteCard',
              onDone: 'changeSuccess',
              onError: {
                target: 'idle',
                actions: 'flashError'
              }
            }
          },
          draftingUpdates: {
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
              onDone: 'changeSuccess',
              onError: {
                target: 'idle',
                actions: 'flashError'
              }
            }
          },
          changeSuccess: { type: 'final' }
        }
      }
    }
  },
  {
    services: {
      fetchCards: (_) => instance
        .then((db) => {
          return db.getCards().then((cards: Card[]) => {
            return cards;
          });
        })
        .catch((error: Error) => {
          // Don't error on 404s
          if (error.message === 'No data found.') {
            return [];
          }

          throw new Error(error.message);
        }),

      addCard: (context, event) => {
        return instance.then((db) => {
          const { name, status, description } = event as AddCard;

          return db.addCard({
            name: name.trim(),
            status: status.trim(),
            description: description.trim()
          });
        });
      },

      deleteCard: ({ pendingCard }, event) =>
        instance.then((db: any) => db.deleteCardById(pendingCard.id)),

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
      }),

      optimisticallyMoveCard: assign({
        columns: ({ columns }, event) => {
          const { card, startColumn, finishColumn } = event as MoveCard;

          const result = columns.map((column) => {
            if (column.id === startColumn.id) {
              return {
                ...column,
                cards: column.cards.filter((c) => c.id !== card.id)
              };
            }

            if (column.id === finishColumn.id) {
              return {
                ...column,
                cards: [...column.cards, card]
              };
            }

            return column;
          });

          return result;
        }
      })
    },

    guards: {
      isValidName: (context, event) => {
        const e = event as AddCard;
        const isValid = e.name.trim().length > 0;
        return isValid;
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
  card: Card;
};

type UpdateCard = {
  type: 'UPDATE_CARD';
  card: Card;
};

type MoveCard = {
  type: 'MOVE_CARD';
  card: Card;
  startColumn: Column;
  finishColumn: Column;
};

type Exit = {
  type: 'EXIT';
};

type SubmitUpdates = {
  type: 'SUBMIT_UPDATES';
  card: Card;
};

type ConfirmDelete = {
  type: 'CONFIRM_DELETE';
};
