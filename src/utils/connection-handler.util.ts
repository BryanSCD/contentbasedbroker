import { Logger } from '@nestjs/common/services';
import axios, { AxiosResponse } from 'axios';

export class ConnectionHandler {
  private static logger = new Logger(ConnectionHandler.name);

  /**
   * Creates a new PUT request
   * @param url URL to be called
   * @param data Content of the request
   * @param callback Callback once successfully finished
   */
  public static async putRequest(
    url: string,
    data: string,
  ): Promise<AxiosResponse<any, any>> {
    ConnectionHandler.logger.log(`Started new put request to: ${url}`);
    ConnectionHandler.logger.log(`data: ${data.toString().replace(/\n/g, '')}`);

    const options = {
      url: url,
      method: 'PUT',
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const res = await axios(options);
      ConnectionHandler.logger.log(`Answer from: ${url}`);
      ConnectionHandler.logger.log(`+statusCode: ${res.status}`);
      ConnectionHandler.logger.warn(`+content: ${res.data}`);
      return res;
    } catch (error) {
      ConnectionHandler.logger.error('Error calling ' + url + ': ' + error);
    }
  }
}
