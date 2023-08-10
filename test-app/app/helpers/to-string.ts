import { helper } from '@ember/component/helper';

export interface ToStringSignature {
  Args: {
    Positional: Array<unknown>;
    Named: Record<string, never>;
  };
  Return: string;
}

export default helper<ToStringSignature>(function ([input]) {
  return input?.toString() ?? '';
});
