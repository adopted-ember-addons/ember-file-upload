export function upload(
  fn: any,
  options?: { network?: 'wired' | 'wifi' | 'dsl' | '4g' | '3g' | '2g' | 'gprs' | 'offline'; timeout?: number }
): (db: any, request: any) => Promise<any>;
