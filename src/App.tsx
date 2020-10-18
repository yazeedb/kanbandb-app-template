import React, { useState } from 'react';
import { useMachine } from '@xstate/react';

import { boardMachine } from './boardMachine';
import './App.scss';
import {
  Dropdown,
  Form,
  FormControl,
  Icon,
  IconButton,
  Modal,
  Panel
} from 'rsuite';
import { UpdateCard } from './UpdateCard';
import { ConfirmDelete } from './ConfirmDelete';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Status } from './model';

const App = () => {
  const [{ matches, context }, send] = useMachine(boardMachine, {
    devTools: true
  });

  const [inputValue, setInputValue] = useState('');
  const resetInputValue = () => setInputValue('');

  const loading = ['adding', 'deleting'].some((v) =>
    matches(`viewingCards.${v}`)
  );

  return (
    <main>
      <DragDropContext
        onDragEnd={({ destination, source, draggableId }) => {
          if (!destination) {
            return;
          }

          if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
          ) {
            return;
          }

          const startColumn = context.columns.find(
            (c) => c.id === source.droppableId
          );

          const finishColumn = context.columns.find(
            (c) => c.id === destination.droppableId
          );

          if (!startColumn || !finishColumn) {
            return;
          }

          const card = startColumn.cards.find((c) => c.id === draggableId);

          if (!card) {
            return;
          }

          send({
            type: 'MOVE_CARD',
            card: {
              ...card,
              status: destination.droppableId as Status
            }
          });
        }}
      >
        <section className="columns">
          {context.columns.map((column) => (
            <div className="column" key={column.id}>
              <header className="column-header">
                <h3>{column.name}</h3>
              </header>

              <Droppable droppableId={column.id} key={column.id}>
                {(dropProvided, dropSnapshot) => (
                  <section
                    className="column-body"
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    // @ts-ignore
                    isDraggingOver={dropSnapshot.isDraggingOver}
                  >
                    {column.cards.map((card, index) => (
                      <Draggable
                        draggableId={card.id}
                        index={index}
                        key={card.id}
                      >
                        {(dragProvided) => (
                          <div
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            ref={dragProvided.innerRef}
                          >
                            <Panel shaded bordered bodyFill className="card">
                              <Panel
                                header={
                                  <div className="card-header">
                                    <h5 className="card-name">{card.name}</h5>

                                    <div>
                                      <IconButton
                                        icon={<Icon icon="edit2" />}
                                        className="edit-card"
                                        loading={loading}
                                        onClick={() => {
                                          send({ type: 'UPDATE_CARD', card });
                                        }}
                                      />

                                      <IconButton
                                        icon={<Icon icon="trash2" />}
                                        loading={loading}
                                        onClick={() =>
                                          send({ type: 'DELETE_CARD', card })
                                        }
                                      />
                                    </div>
                                  </div>
                                }
                              >
                                <p>{card.description}</p>
                              </Panel>
                            </Panel>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {dropProvided.placeholder}
                  </section>
                )}
              </Droppable>
            </div>
          ))}
        </section>
      </DragDropContext>

      <footer>
        <Form
          fluid
          onSubmit={() => {
            if (inputValue.trim().length === 0) {
              return;
            }

            send({
              type: 'ADD_CARD',
              name: inputValue,
              description: '',
              status: 'TODO'
            });

            resetInputValue();
          }}
        >
          <FormControl
            autoFocus
            size="lg"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={setInputValue}
          />

          <Dropdown
            title="Add card"
            placement="topStart"
            appearance="primary"
            size="lg"
            className="add-card"
            disabled={matches('viewingCards.adding')}
          >
            {context.columns.map((c, index) => (
              <Dropdown.Item
                appearance="primary"
                key={index}
                type="submit"
                onClick={() => {
                  send({
                    type: 'ADD_CARD',
                    name: inputValue,
                    description: '',
                    status: c.id
                  });

                  resetInputValue();
                }}
              >
                {c.name}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </Form>
      </footer>

      <Modal
        show={matches('viewingCards.updating')}
        onHide={() => send('EXIT')}
      >
        <UpdateCard
          card={context.pendingCard}
          onClose={() => send('EXIT')}
          onSubmit={(name, description) =>
            send({
              type: 'SUBMIT_UPDATES',
              card: {
                ...context.pendingCard,
                name,
                description
              }
            })
          }
        />
      </Modal>

      <Modal
        backdrop="static"
        show={matches('viewingCards.confirmingDelete')}
        onHide={() => send('EXIT')}
      >
        <ConfirmDelete
          onSubmit={() => send('CONFIRM_DELETE')}
          onClose={() => send('EXIT')}
        />
      </Modal>
    </main>
  );
};

export default App;
