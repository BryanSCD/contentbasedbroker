import * as request from 'supertest';

export const checkObjects = async (
  expectedObjectBody: object,
  host_url: string,
  endpoint: string,
  addedObjectId: string,
) => {
  const addedMessage = await request(host_url)
    .get(endpoint + addedObjectId)
    .expect(200);

  return expect(addedMessage.body).toMatchObject(expectedObjectBody);
};

export const modifyObject = async (
  baseObjectId: string,
  modifyObjectPropertiesQuery: object = {},
  modifyObjectPropertiesBody: object = {},
  finalObjectElements: object,
  expected: number,
  host_url: string,
  endpoint: string,
) => {
  const messageObject = await request(host_url)
    .get(endpoint + '/' + baseObjectId)
    .expect(200);

  const messageReq = request(host_url)
    .patch(endpoint + '/' + baseObjectId)
    .query(modifyObjectPropertiesQuery)
    .send(modifyObjectPropertiesBody)
    .expect(expected);

  if (expected >= 400) {
    return messageReq;
  } else {
    await messageReq;
    const modifiedMessageObject = await request(host_url)
      .get(endpoint + '/' + baseObjectId)
      .expect(200);

    return expect(modifiedMessageObject.body).toMatchObject({
      ...messageObject.body,
      ...finalObjectElements,
    });
  }
};
