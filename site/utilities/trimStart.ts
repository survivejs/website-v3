function trimStart(value: string, chars: string) {
  let index = 0;

  while (index < value.length && chars.includes(value[index])) {
    index += 1;
  }

  return value.slice(index);
}

export default trimStart;
