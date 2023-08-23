import * as request from 'supertest';

describe('SubscriptionController (e2e)', () => {
  const host_url = `http://localhost:3001`;
  const message_endpoint = `/message`;
  const subscription_endpoint = `/subscription`;
  let createdSubscriptionIds: string[] = [];
  let createdMessageIds: string[] = [];

  const messageExample = {
    type: 'XML',
    content:
      '<message><from>User</from><to>Correlator</to><heading>Does it work?</heading><body>Hope it runs all the tests</body></message>',
    on_match_remove: false,
    routing_key: '',
  };

  const subscriptionExample = {
    type: 'XML',
    rules: ['/message/from[text()="User"]'],
    callback: 'https://webhook.site/e6121375-f3aa-41fc-98a3-4bcf29845df4',
    valid_until: null,
    priority: 0,
    matching_expression: '',
    read_old: false,
    on_match_remove: false,
  };

  afterEach(async () => {
    await clearIds();
  });

  const clearIds = async () => {
    for (const messageId of createdMessageIds) {
      await request(host_url).delete(message_endpoint + '/' + messageId);
    }

    createdMessageIds = [];
    for (const subscriptionId of createdSubscriptionIds) {
      await request(host_url).delete(
        subscription_endpoint + '/' + subscriptionId,
      );
    }
    createdSubscriptionIds = [];
  };

  describe('Subscription arrives first: simply tests', () => {
    it('Should delete the message and not delete the subscription when matching', async () => {
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(subscriptionExample)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      const sampleMessage = { ...messageExample, on_match_remove: true };
      await request(host_url)
        .post(message_endpoint)
        .send(sampleMessage)
        .expect(200);

      const addedMessages = await request(host_url)
        .get(message_endpoint)
        .expect(200);

      expect(addedMessages.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining(sampleMessage)]),
      );

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should not delete the message and not delete the subscription when not matching matching_expression', async () => {
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query({
          ...subscriptionExample,
          on_match_remove: true,
          matching_expression: 'shouldnotmatch',
        })
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      const sampleMessage = {
        ...messageExample,
        on_match_remove: true,
        routing_key: 'not_matches',
      };

      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send(sampleMessage)
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should not delete the message and not delete the subscription when not matching type', async () => {
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query({
          ...subscriptionExample,
          on_match_remove: true,
        })
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      const sampleMessage = {
        type: 'PLAIN_TEXT',
        content:
          '<message><from>User</from><to>Correlator</to><heading>Does it work?</heading><body>Hope it runs all the tests</body></message>',
        on_match_remove: true,
        routing_key: '',
      };

      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send(sampleMessage)
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should not delete the message and not delete the subscription when not matching rules', async () => {
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query({
          ...subscriptionExample,
          on_match_remove: true,
          rules: ['/message/from[text()="Usuario"]'],
        })
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      const sampleMessage = {
        ...messageExample,
        on_match_remove: true,
      };

      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send(sampleMessage)
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should not delete the message and delete the subscription when expired valid_until', async () => {
      // Get the current date and time
      const currentDate = new Date();

      // Add 2 seconds (2000 milliseconds) to the current date
      const futureDate = new Date(currentDate.getTime() + 2000);

      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query({
          ...subscriptionExample,
          on_match_remove: true,
          valid_until: futureDate.toISOString(),
        })
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const sampleMessage = {
        ...messageExample,
        on_match_remove: true,
      };

      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send(sampleMessage)
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(400);
    });
  });

  describe('Message arrives first: simply tests', () => {
    it('Should not delete neither the message nor the subscription when read_old = false', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send(messageExample)
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        on_match_remove: true,
      };
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });
  });

  describe('Message arrives first: modify tests', () => {
    it('Should delete the message and the subscription after modifying with read_old = true', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({ ...messageExample, on_match_remove: true })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        on_match_remove: true,
      };
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);

      await request(host_url)
        .patch(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .query({ read_old: true })
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(400);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(400);
    });

    it('Should delete the message and not delete the subscription after modifying with read_old = true and on_match_remove: false', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({ ...messageExample, on_match_remove: true })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        on_match_remove: true,
      };
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);

      await request(host_url)
        .patch(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .query({ read_old: true, on_match_remove: false })
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(400);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should delete the message and delete the subscription after modifying message and matching', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({
          ...messageExample,
          on_match_remove: true,
          routing_key: 'doesnotmatch',
        })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        on_match_remove: true,
        matching_expression: 'matches',
      };
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);

      await request(host_url)
        .patch(message_endpoint + '/' + createdMessageRes.text)
        .send({ routing_key: 'matches' })
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(400);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(400);
    });

    it('Should delete the message and not delete the subscription after modifying subscription and matching with read_old', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({
          ...messageExample,
          on_match_remove: true,
          routing_key: 'matches',
        })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        on_match_remove: true,
        matching_expression: 'doesnotmatch',
      };
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);

      await request(host_url)
        .patch(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .query({
          matching_expression: 'matches',
          on_match_remove: false,
          read_old: true,
        })
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(400);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should not delete the message and not delete the subscription after modifying subscription and matching without read_old', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({
          ...messageExample,
          on_match_remove: true,
          routing_key: 'matches',
        })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        on_match_remove: true,
        matching_expression: 'doesnotmatch',
      };
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);

      await request(host_url)
        .patch(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .query({
          matching_expression: 'matches',
          on_match_remove: false,
        })
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should not delete the message and delete the subscription after modifying message and matching', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({
          ...messageExample,
          on_match_remove: true,
          routing_key: 'doesnotmatch',
        })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        on_match_remove: true,
        matching_expression: 'matches',
      };
      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);

      await request(host_url)
        .patch(message_endpoint + '/' + createdMessageRes.text)
        .send({ routing_key: 'matches', on_match_remove: false })
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(400);
    });
  });

  describe('Message arrives first: read_old and on_match_remove combinations', () => {
    it('Should not delete the message and add the subscription when matching and read_old = true, on_match_remove (subscription) = false', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({ ...messageExample })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query({
          ...subscriptionExample,
          read_old: true,
          on_match_remove: false,
        })
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should not delete the message and not add the subscription when matching, read_old = true, on_match_remove (subscription) = true', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({ ...messageExample })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        read_old: true,
        on_match_remove: true,
      };

      await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(200);

      const addedSubscriptions = await request(host_url)
        .get(subscription_endpoint)
        .expect(200);

      delete sampleSubscription.read_old;
      expect(addedSubscriptions.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining(sampleSubscription)]),
      );
    });

    it('Should delete the message when on_match_remove = true and add the subscription when matching and read_old = true, on_match_remove = false', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({ ...messageExample, on_match_remove: true })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const createdSubscriptionRes = await request(host_url)
        .post(subscription_endpoint)
        .query({
          ...subscriptionExample,
          read_old: true,
          on_match_remove: false,
        })
        .expect(201);

      createdSubscriptionIds.push(createdSubscriptionRes.text);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(400);

      await request(host_url)
        .get(subscription_endpoint + '/' + createdSubscriptionRes.text)
        .expect(200);
    });

    it('Should delete the message when on_match_remove = true and add the subscription when matching and read_old = true, on_match_remove = true', async () => {
      const createdMessageRes = await request(host_url)
        .post(message_endpoint)
        .send({ ...messageExample, on_match_remove: true })
        .expect(201);

      createdMessageIds.push(createdMessageRes.text);

      const sampleSubscription = {
        ...subscriptionExample,
        read_old: true,
        on_match_remove: true,
      };

      await request(host_url)
        .post(subscription_endpoint)
        .query(sampleSubscription)
        .expect(200);

      await request(host_url)
        .get(message_endpoint + '/' + createdMessageRes.text)
        .expect(400);

      const addedSubscriptions = await request(host_url)
        .get(subscription_endpoint)
        .expect(200);

      delete sampleSubscription.read_old;
      expect(addedSubscriptions.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining(sampleSubscription)]),
      );
    });
  });
});
