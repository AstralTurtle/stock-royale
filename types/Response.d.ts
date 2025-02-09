export enum ResponseType {
  Success,
  Failure,
}

export interface Response {
  type: ResponseType;
  message?: string;
}
