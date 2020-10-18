import React, { FC, useState } from 'react';
import {
  Modal,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'rsuite';
import { Card } from './model';

interface UpdateCardProps {
  card: Card;
  onSubmit: (newName: string, newDescription: string) => void;
  onClose: () => void;
}

export const UpdateCard: FC<UpdateCardProps> = ({
  card,
  onSubmit,
  onClose
}) => {
  const [newName, setNewName] = useState(card.name);
  const [newDescription, setNewDescription] = useState(card.description);

  const dirty =
    card.name !== newName.trim() || card.description !== newDescription.trim();

  const handleSubmit = () => onSubmit(newName, newDescription);

  return (
    <>
      <Modal.Header>
        <Modal.Title>Edit card</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid onSubmit={handleSubmit}>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              name="name"
              autoFocus
              value={newName}
              onChange={setNewName}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              name="description"
              componentClass="textarea"
              value={newDescription}
              onChange={setNewDescription}
            />
          </FormGroup>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button appearance="primary" disabled={!dirty} onClick={handleSubmit}>
          Submit
        </Button>
        <Button onClick={onClose} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </>
  );
};
