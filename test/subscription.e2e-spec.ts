import * as request from 'supertest';
import { checkObjects, modifyObject } from './common';

describe('SubscriptionController (e2e)', () => {
  const host_url = `http://localhost:3001`;
  const endpoint = `/subscription`;
  const createdSubscriptionIds: string[] = [];

  const subscriptionExample = {
    type: 'XML',
    rules: ['/message[from=35]', '/message[from=45]'],
    callback: 'https://webhook.site/84f9c975-cf86-41e8-af48-29b57936fffb',
    valid_until: null,
    priority: 0,
    matching_expression: '',
    read_old: false,
    on_match_remove: false,
  };

  afterAll(async () => {
    for (const subscriptionId of createdSubscriptionIds) {
      await request(host_url).delete(endpoint + '/' + subscriptionId);
    }
  });

  describe('Get all behaviour', () => {
    it('should return return all the subscriptions', async () => {
      return await request(host_url).get(endpoint).expect(200);
    });
  });

  describe('Add new subscription behaviour', () => {
    it('should fail when adding an empty subscription', () => {
      return request(host_url).post(endpoint).expect(400);
    });

    let createdNewSubscriptionId = null;
    it('should add a valid new subscription', async () => {
      const oldSubscriptions = await request(host_url)
        .get(endpoint)
        .expect(200);

      const createdSubscriptionRes = await request(host_url)
        .post(endpoint)
        .query(subscriptionExample)
        .expect(201);
      createdNewSubscriptionId = createdSubscriptionRes.text;

      const created = { ...subscriptionExample };
      delete created.read_old;

      await checkObjects(
        created,
        host_url,
        endpoint + '/',
        createdNewSubscriptionId,
      );

      const createdNewSubscription = await request(host_url)
        .get(endpoint + '/' + createdNewSubscriptionId)
        .expect(200);

      const newSubscriptions = await request(host_url)
        .get(endpoint)
        .expect(200);

      expect(newSubscriptions.body.length).toBeGreaterThan(
        oldSubscriptions.body.length,
      );
      return expect(newSubscriptions.body).toContainEqual(
        createdNewSubscription.body,
      );
    });

    it('should remove a valid new subscription', async () => {
      if (createdNewSubscriptionId) {
        const oldSubscriptions = await request(host_url)
          .get(endpoint)
          .expect(200);
        const oldSubscriptionsLen = oldSubscriptions.body.length;

        await request(host_url)
          .delete(endpoint + '/' + createdNewSubscriptionId)
          .expect(200);

        const newSubscriptions = await request(host_url)
          .get(endpoint)
          .expect(200);
        const newSubscriptionsLen = newSubscriptions.body.length;
        return expect(newSubscriptionsLen).toBeLessThan(oldSubscriptionsLen);
      } else {
        return expect(createdNewSubscriptionId).not.toBe(null);
      }
    });
  });

  describe('Type errors', () => {
    it('should fail when not adding type', () => {
      const subscriptionBody = { ...subscriptionExample };

      delete subscriptionBody.type;
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should fail when adding an empty type', () => {
      const subscriptionBody = { ...subscriptionExample, type: '' };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should fail when adding an invalid type', () => {
      const subscriptionBody = { ...subscriptionExample, type: 'invalid' };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should not be modified when modifying with an invalid type', () => {
      const subscriptionBody = { type: 'invalid' };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should not be modified when modifying with a valid type without rules', () => {
      const subscriptionBody = { type: 'XML' };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should be modified when modifying with a valid type with valid rules', () => {
      const subscriptionBody = {
        type: 'XML',
        rules: ['/message[from=1]'],
      };
      return modifySubscription(subscriptionBody, 200);
    });
  });

  describe('Rules errors', () => {
    it('should fail when not adding rules', () => {
      const subscriptionBody = { ...subscriptionExample };
      delete subscriptionBody.rules;

      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should fail when adding empty rules', async () => {
      await request(host_url)
        .post(endpoint)
        .query({ ...subscriptionExample, rules: [''] })
        .expect(400);

      return request(host_url)
        .post(endpoint)
        .query({ ...subscriptionExample, rules: [] })
        .expect(400);
    });

    it('should success when adding a string rules', async () => {
      const createdId = await request(host_url)
        .post(endpoint)
        .query({ ...subscriptionExample, rules: '/message[from=35]' })
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should not be modified when modifying with valid rules without type', () => {
      const subscriptionBody = {
        rules: ['/message[from=35]'],
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should not be modified when modifying with invalid rules with valid type', () => {
      const messageBody = {
        type: 'XML',
        rules: ['/&5462/'],
      };
      return modifySubscription(messageBody, 400);
    });

    it('should not be modified when modifying invalid rules with valid type', () => {
      const messageBody = {
        type: 'XML',
        rules: [],
      };
      return modifySubscription(messageBody, 400);
    });

    it('should be modified when modifying valid rules with valid type', () => {
      const messageBody = {
        type: 'XML',
        rules: ['/message[from=2]', '/message[from=3]', '/message[from=4]'],
      };
      return modifySubscription(messageBody, 200);
    });
  });

  describe('Callback errors', () => {
    it('cpee-callback should have priority against callback', async () => {
      const createdId = await request(host_url)
        .post(endpoint)
        .set('CPEE-CALLBACK', 'SHOULDHAVEPRIORITY')
        .query(subscriptionExample)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);

      const createdSub = await request(host_url)
        .get(endpoint + '/' + createdId.text)
        .expect(200);

      return expect(createdSub.body.callback).toEqual('SHOULDHAVEPRIORITY');
    });

    it('should fail when not adding callback', () => {
      const subscriptionBody = { ...subscriptionExample };

      delete subscriptionBody.callback;
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should fail when adding an empty callback', () => {
      const subscriptionBody = { ...subscriptionExample, callback: '' };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should not be modified when modifying with an empty callback', () => {
      const subscriptionBody = {
        callback: '',
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should be modified when modifying with a valid callback', () => {
      const subscriptionBody = {
        callback: '192.168.1.1:3001',
      };
      return modifySubscription(subscriptionBody, 200);
    });
  });

  describe('Valid_until errors', () => {
    it('should success when adding valid valid_until', async () => {
      const subscriptionBody = {
        ...subscriptionExample,
        valid_until: '2024-07-16T10:34:56.000Z',
      };

      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should success when not adding valid_until', async () => {
      const subscriptionBody = { ...subscriptionExample };

      delete subscriptionBody.valid_until;

      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should fail when adding an invalid date', () => {
      const subscriptionBody = {
        ...subscriptionExample,
        valid_until: 'invalid',
      };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should fail when adding an expired date', () => {
      const subscriptionBody = {
        ...subscriptionExample,
        valid_until: '2021-07-16T10:34:56.000Z',
      };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should be modified when modifying with an empty valid_until', () => {
      const subscriptionBody = {
        valid_until: null,
      };
      return modifySubscription(subscriptionBody, 200);
    });

    it('should not be modified when modifying with an invalid valid_until', () => {
      const subscriptionBody = {
        valid_until: 'invalid',
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should not be modified when modifying with an expired date', () => {
      const subscriptionBody = {
        valid_until: '2021-07-16T10:34:56.000Z',
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should be modified when modifying with a valid valid_until', () => {
      const subscriptionBody = {
        valid_until: '2025-07-16T10:34:56.000Z',
      };
      return modifySubscription(subscriptionBody, 200);
    });
  });

  describe('Priority errors', () => {
    it('should success when not adding priority', async () => {
      const subscriptionBody = { ...subscriptionExample };

      delete subscriptionBody.priority;
      const createdId = await request(host_url)
        .post(endpoint)
        .query({ ...subscriptionBody })
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should fail when adding an invalid priority', () => {
      const subscriptionBody = {
        ...subscriptionExample,
        priority: 'invalid',
      };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should fail when adding a priority lower than 0', () => {
      const subscriptionBody = {
        ...subscriptionExample,
        priority: -1,
      };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should success when adding a priority equal to 0', async () => {
      const subscriptionBody = {
        ...subscriptionExample,
        priority: 0,
      };
      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);
      createdSubscriptionIds.push(createdId.text);
    });

    it('should success when adding a priority between 0..255', async () => {
      const subscriptionBody = {
        ...subscriptionExample,
        priority: 127,
      };
      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);
      createdSubscriptionIds.push(createdId.text);
    });

    it('should success when adding a priority equal to 255', async () => {
      const subscriptionBody = {
        ...subscriptionExample,
        priority: 255,
      };
      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);
      createdSubscriptionIds.push(createdId.text);
    });

    it('should fail when adding a priority higher than 255', () => {
      const subscriptionBody = {
        ...subscriptionExample,
        priority: 256,
      };
      return request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(400);
    });

    it('should not be modified when adding an invalid priority', () => {
      const subscriptionBody = {
        priority: 'invalid',
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should not be modified when modifying with a priority lower than 0', () => {
      const subscriptionBody = {
        priority: -1,
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should be modified when modifying with a priority equal to 0', () => {
      const subscriptionBody = {
        priority: 0,
      };
      return modifySubscription(subscriptionBody, 200);
    });

    it('should be modified when modifying with a priority between 0 and 255', () => {
      const subscriptionBody = {
        priority: 127,
      };
      return modifySubscription(subscriptionBody, 200);
    });

    it('should be modified when modifying with a priority equal to 255', () => {
      const subscriptionBody = {
        priority: 255,
      };
      return modifySubscription(subscriptionBody, 200);
    });

    it('should not be modified when modifying with a priority higher than 255', () => {
      const subscriptionBody = {
        priority: 256,
      };
      return modifySubscription(subscriptionBody, 400);
    });
  });

  describe('Matching_expression errors', () => {
    it('should success when not adding matching_expression', async () => {
      const subscriptionBody = { ...subscriptionExample };

      delete subscriptionBody.matching_expression;

      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should success when adding an empty matching_expression', async () => {
      const subscriptionBody = {
        ...subscriptionExample,
        matching_expression: '',
      };
      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should fail when adding an invalid matching_expression', async () => {
      return request(host_url)
        .post(endpoint)
        .query({
          ...subscriptionExample,
          matching_expression: '/(abc/',
        })
        .expect(400);
    });

    it('should be modified when modifying with an empty matching_expression', () => {
      const subscriptionBody = {
        matching_expression: '',
      };
      return modifySubscription(subscriptionBody, 200);
    });

    it('should not be modified when modifying with an invalid matching_expression', () => {
      const subscriptionBody = {
        matching_expression: '/(abc/',
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should be modified when modifying with a valid matching_expression', () => {
      const subscriptionBody = {
        matching_expression: '/(abc)/',
      };
      return modifySubscription(subscriptionBody, 200);
    });
  });

  describe('Read_old errors', () => {
    it('should success when not adding read_old', async () => {
      const subscriptionBody = { ...subscriptionExample };

      delete subscriptionBody.read_old;

      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should fail when adding an invalid read_old', async () => {
      return request(host_url)
        .post(endpoint)
        .query({
          ...subscriptionExample,
          read_old: 'trues',
        })
        .expect(400);
    });

    it('should success when adding read_old', async () => {
      const subscriptionBody = { ...subscriptionExample, read_old: true };

      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });
  });

  describe('On_match_remove errors', () => {
    it('should success when not adding on_match_remove', async () => {
      const subscriptionBody = { ...subscriptionExample };

      delete subscriptionBody.on_match_remove;

      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should fail when adding an invalid on_match_remove', async () => {
      return request(host_url)
        .post(endpoint)
        .query({
          ...subscriptionExample,
          on_match_remove: 'trues',
        })
        .expect(400);
    });

    it('should success when adding on_match_remove', async () => {
      const subscriptionBody = {
        ...subscriptionExample,
        on_match_remove: true,
      };

      const createdId = await request(host_url)
        .post(endpoint)
        .query(subscriptionBody)
        .expect(201);

      createdSubscriptionIds.push(createdId.text);
    });

    it('should not be modified when modifying with an empty on_match_remove', () => {
      const subscriptionBody = {
        on_match_remove: '',
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should not be modified when modifying with an invalid on_match_remove', () => {
      const subscriptionBody = {
        on_match_remove: 'trues',
      };
      return modifySubscription(subscriptionBody, 400);
    });

    it('should be modified when modifying with a valid on_match_remove', () => {
      const subscriptionBody = {
        on_match_remove: true,
      };
      return modifySubscription(subscriptionBody, 200);
    });
  });

  let modifyObjectId = null;
  const modifySubscription = async (
    modifyProperties: object,
    expected: number,
    reset = false,
  ) => {
    if (!modifyObjectId || reset) {
      const createdSubscriptionRes = await request(host_url)
        .post(endpoint)
        .query(subscriptionExample)
        .expect(201);
      modifyObjectId = createdSubscriptionRes.text;
      createdSubscriptionIds.push(modifyObjectId);
    }
    return modifyObject(
      modifyObjectId,
      modifyProperties,
      {},
      modifyProperties,
      expected,
      host_url,
      endpoint,
    );
  };
});
