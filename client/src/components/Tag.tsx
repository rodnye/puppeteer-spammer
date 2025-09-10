import { getColorFromHash } from '../utils/colors';

export default function Tag({ children }: { children: string }) {
  return (
    <span
      className={
        'm-1 px-2 py-1 text-white shadow-lg rounded-md text-xs ' +
        getColorFromHash(children)
      }
    >
      {children}
    </span>
  );
}
