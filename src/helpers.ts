import { Generator, GeneratorOptions } from './generator';
import { DocumentNode, parse } from 'graphql';

/**
 * Generate and print server types from a given schema to console.
 */
export function printServerTypes(
  options: GeneratorOptions & {
    src: string | DocumentNode;
  }
) {
  // tslint:disable-next-line:no-console
  console.log(generateServerTypes(options));
}

/**
 * Generate server types from a given schema.
 */
export function generateServerTypes(
  options: GeneratorOptions & {
    src: string | DocumentNode;
  }
) {
  const { src } = options;
  const generator = new Generator(options);

  return generator.generateServerTypes(
    typeof src === 'string' ? parse(src) : src
  );
}
