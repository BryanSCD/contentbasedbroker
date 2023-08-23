import * as request from 'supertest';
import { checkObjects, modifyObject } from './common';

describe('MessageController (e2e)', () => {
  const host_url = `http://localhost:3001`;
  const endpoint = `/message`;
  const createdMessageIds: string[] = [];

  const messageExample = {
    type: 'XML',
    content:
      '<message><from>User</from><to>Correlator</to><heading>Does it work?</heading><body>Hope it runs all the tests</body></message>',
    on_match_remove: false,
    routing_key: '',
  };

  afterAll(async () => {
    for (const messageId of createdMessageIds) {
      await request(host_url).delete(endpoint + '/' + messageId);
    }
  });

  describe('Get all behaviour', () => {
    it('should return return all the messages', async () => {
      return await request(host_url).get(endpoint).expect(200);
    });
  });

  describe('Add new message behaviour', () => {
    it('should fail when adding an empty message', () => {
      return request(host_url).post(endpoint).expect(400);
    });

    let createdNewMessageId = null;
    it('should add a correct new message', async () => {
      const oldMessages = await request(host_url).get(endpoint).expect(200);

      const createdMessageRes = await request(host_url)
        .post(endpoint)
        .send(messageExample)
        .expect(201);

      createdNewMessageId = createdMessageRes.text;

      await checkObjects(
        messageExample,
        host_url,
        endpoint + '/',
        createdNewMessageId,
      );

      const createdNewMessage = await request(host_url)
        .get(endpoint + '/' + createdNewMessageId)
        .expect(200);

      const newMessages = await request(host_url).get(endpoint).expect(200);

      expect(newMessages.body.length).toBeGreaterThan(oldMessages.body.length);
      return expect(newMessages.body).toContainEqual(createdNewMessage.body);
    });

    it('should remove a valid new message', async () => {
      if (createdNewMessageId) {
        const oldMessages = await request(host_url).get(endpoint).expect(200);
        const oldMessagesLen = oldMessages.body.length;

        await request(host_url)
          .delete(endpoint + '/' + createdNewMessageId)
          .expect(200);

        const newMessages = await request(host_url).get(endpoint).expect(200);
        const newMessagesLen = newMessages.body.length;
        return expect(newMessagesLen).toBeLessThan(oldMessagesLen);
      } else {
        return expect(createdNewMessageId).not.toBe(null);
      }
    });
  });

  describe('Type errors', () => {
    it('should fail when not adding type', () => {
      const messageBody = { ...messageExample };

      delete messageBody.type;
      return request(host_url).post(endpoint).send(messageBody).expect(400);
    });

    it('should fail when adding an empty type', () => {
      const messageBody = { ...messageExample, type: '' };
      return request(host_url).post(endpoint).send(messageBody).expect(400);
    });

    it('should fail when adding an invalid type', () => {
      const messageBody = { ...messageExample, type: 'invalid' };
      return request(host_url).post(endpoint).send(messageBody).expect(400);
    });

    it('should not be modified when modifying with an invalid type', () => {
      const messageBody = { type: 'invalid' };
      return modifyMessage(messageBody, 400);
    });

    it('should not be modified when modifying with a valid type without content', () => {
      const messageBody = { type: 'XML' };
      return modifyMessage(messageBody, 400);
    });

    it('should be modified when modifying with a valid type with valid content', () => {
      const messageBody = {
        type: 'XML',
        content: '<message><body>Hope this modification runs</body></message>',
      };
      return modifyMessage(messageBody, 200);
    });
  });

  describe('Content errors', () => {
    it('should fail when not adding content', () => {
      const messageBody = { ...messageExample };

      delete messageBody.content;
      return request(host_url).post(endpoint).send(messageBody).expect(400);
    });

    it('should fail when adding an empty content', () => {
      const messageBody = { ...messageExample, content: '' };
      return request(host_url).post(endpoint).send(messageBody).expect(400);
    });

    it('should not be modified when modifying a valid content without type', () => {
      const messageBody = {
        content:
          '<message><body>Hope this modification doesnt run</body></message>',
      };
      return modifyMessage(messageBody, 400);
    });

    it('should not be modified when modifying an invalid content with valid type', () => {
      const messageBody = {
        type: 'XML',
        content: 'noxmlvalid',
      };
      return modifyMessage(messageBody, 400);
    });

    it('should be modified when modifying a valid content with valid type', () => {
      const messageBody = {
        type: 'XML',
        content:
          '<message><body>Hope this modification doesnt run</body></message>',
      };
      return modifyMessage(messageBody, 200);
    });
  });

  describe('OnMatchRemove errors', () => {
    it('should success when not adding on_match_remove', async () => {
      const messageBody = { ...messageExample };

      delete messageBody.on_match_remove;
      const createdMessageRes = await request(host_url)
        .post(endpoint)
        .send(messageBody)
        .expect(201);
      createdMessageIds.push(createdMessageRes.text);
      return checkObjects(
        messageExample,
        host_url,
        endpoint + '/',
        createdMessageRes.text,
      );
    });

    it('should fail when adding an empty on_match_remove', () => {
      const messageBody = { ...messageExample, on_match_remove: '' };
      return request(host_url).post(endpoint).send(messageBody).expect(400);
    });

    it('should fail when adding an invalid on_match_remove', () => {
      const messageBody = { ...messageExample, on_match_remove: 'invalid' };
      return request(host_url).post(endpoint).send(messageBody).expect(400);
    });

    it('should fail when modyfing with an invalid on_match_remove', () => {
      const messageBody = { on_match_remove: 'invalid' };
      return modifyMessage(messageBody, 400, true);
    });

    it('should success when modyfing with a valid on_match_remove', () => {
      const messageBody = { on_match_remove: true };
      return modifyMessage(messageBody, 200, true);
    });
  });

  describe('RoutingKey errors', () => {
    it('should success when not adding routing_key', async () => {
      const messageBody = { ...messageExample };

      delete messageBody.routing_key;
      const createdMessageRes = await request(host_url)
        .post(endpoint)
        .send(messageBody)
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      return checkObjects(
        messageExample,
        host_url,
        endpoint + '/',
        createdMessageRes.text,
      );
    });

    it('should success when adding an empty routing_key', async () => {
      const messageBody = { ...messageExample, routing_key: '' };
      const createdMessageRes = await request(host_url)
        .post(endpoint)
        .send(messageBody)
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      return checkObjects(
        messageExample,
        host_url,
        endpoint + '/',
        createdMessageRes.text,
      );
    });

    it('should success when modyfing with a valid routing_key', () => {
      const messageBody = { routing_key: 'string' };
      return modifyMessage(messageBody, 200, true);
    });
  });

  let modifyObjectId = null;
  const modifyMessage = async (
    modifyProperties: object,
    expected: number,
    reset = false,
  ) => {
    if (!modifyObjectId || reset) {
      const createdMessageRes = await request(host_url)
        .post(endpoint)
        .send(messageExample)
        .expect(201);
      modifyObjectId = createdMessageRes.text;
      createdMessageIds.push(modifyObjectId);
    }
    return modifyObject(
      modifyObjectId,
      {},
      modifyProperties,
      modifyProperties,
      expected,
      host_url,
      endpoint,
    );
  };
});
