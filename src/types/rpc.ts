
export interface RpcResponse<T = any> {
  data: T | null;
  error: Error | null;
}

export interface BalanceUpdateResponse {
  data: boolean | null;
  error: Error | null;
}
