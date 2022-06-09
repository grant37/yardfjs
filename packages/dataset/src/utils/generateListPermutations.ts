/* eslint-disable no-param-reassign */

/**
 * In-place swap.
 */
function swap<T>(i: number, j: number, input: T[]): T[] {
  const temp = input[i];
  input[i] = input[j];
  input[j] = temp;
  return input;
}

/**
 * Heap's algorithm. Directly from pseudocode at https://en.wikipedia.org/wiki/Heap%27s_algorithm
 */
export default function generateListPermutations<T>(
  n: number,
  input: T[]
): T[][] {
  const stack: number[] = new Array(n).fill(0);
  const output: T[][] = [[...input]];
  const current: T[] = [...input];

  // i is basically a stack pointer
  let i = 1;
  while (i < n) {
    if (stack[i] < i) {
      if (i % 2 === 0) {
        swap(0, i, current);
      } else {
        swap(stack[i], i, current);
      }

      // Save current permutation
      output.push([...current]);
      // Swap has occurred ending the for-loop. Simulate the increment of the for-loop counter
      stack[i] += 1;
      // Simulate recursive call reaching the base case by bringing the pointer to the base case analog in the array
      i = 1;
    } else {
      // Calling generate(i+1, A) has ended as the for-loop terminated. Reset the state and simulate popping the stack by incrementing the pointer
      stack[i] = 0;
      i += 1;
    }
  }

  return output;
}
