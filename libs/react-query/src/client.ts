import { RumsanService } from '@rumsan/sdk';
import { QueryClient } from '@tanstack/react-query';

class _RumsanQuery {
  private _queryClient: QueryClient | null = null;

  constructor() {
    this._queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  }

  public set client(client: QueryClient) {
    this._queryClient = client;
  }

  public get client(): QueryClient {
    RumsanService.setClient({
      baseURL: 'http://localhost:5200/v1',
    });
    if (!this._queryClient)
      throw new Error(
        'QueryClient not setup. Please call RumsanReactQuery.setup() before using it.',
      );
    return this._queryClient;
  }
}

export const RumsanReactQuery = new _RumsanQuery();
export const RumsanReactQueryClient = RumsanReactQuery.client;
export const RumsanClient = RumsanService.getClient();
