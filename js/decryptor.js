export function decrypt(data) {
  const key = 0xAA;
  for (let i = 0; i < data.length; i++)
  {
    data[i] ^= key;
  }
  return data;
}