const greeting = (name: string): string => {
  return `Hello, ${name}!`;
};

const main = (): void => {
  const name = "TypeScript Starter";
  console.log(greeting(name));
};

main();

export { greeting };
