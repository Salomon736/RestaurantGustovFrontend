export interface ApiResponseInterface<T> {
  data: T;
  isSuccess: boolean;
  statusCode: number;
  message: string;
  errors: Array<string>;
}
