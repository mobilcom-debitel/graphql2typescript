import {
  visit,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  DocumentNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  TypeNode,
  EnumValueDefinitionNode,
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  UnionTypeDefinitionNode
} from 'graphql';

/**
 * Options for the GraphQL 2 TypeScript code generator
 */
export interface GeneratorOptions {
  /**
   * Headers to include at the top of the generated code
   */
  headers?: string[];

  /**
   * Custom imports
   */
  imports?: ImportDef[];

  /**
   * Defines the context type to be used in resolvers
   */
  context: ContextDef;

  /**
   * Type mappings which overload the internal representation of objects at the resolve stage
   */
  typeMap?: TypeMapping[];
}

/**
 * Defines the context type to be used in resolver functions
 */
export interface ContextDef {
  /**
   * Type name of the context
   */
  name: string;

  /**
   * Module to import the context type from (optional)
   */
  from?: string;
}

/**
 * Defines a mapping from a GraphQL type to an internal TypeScript type
 */
export interface TypeMapping {
  /**
   * GraphQL type name to override
   */
  gqlType: string;

  /**
   * TypeScript type name to use instead of the GraphQL type
   */
  tsType: string;

  /**
   * TypeScript type name to use instead of the GraphQL type at inputs (optional)
   *
   * Usually more specific than the tsType; useful in custom scalars where
   * deserialization (input) always results in a specific type, but serialization (output)
   * allows multiple types.
   */
  tsInputType?: string;

  /**
   * Module to import the TypeScript type from (optional)
   */
  from?: string;
}

/**
 * Defines name(s) to be imported from a module
 */
export interface ImportDef {
  /**
   * Names to be imported
   */
  names: string[];

  /**
   * Module to import from
   */
  from: string;
}

type NodeWithDescription =
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode
  | FieldDefinitionNode
  | InputObjectTypeDefinitionNode
  | InputValueDefinitionNode
  | EnumTypeDefinitionNode
  | EnumValueDefinitionNode;

export class Generator {
  protected headers: string[];
  protected imports = new Map<string, Set<string>>();
  protected contextType: string;
  protected typeMap = new Map<string, TypeMapping>();

  public constructor(options: GeneratorOptions) {
    this.headers = options.headers || [];

    this.addImport({ names: ['GraphQLResolveInfo'], from: 'graphql' });

    if (options.imports) {
      for (const im of options.imports) {
        this.addImport(im);
      }
    }

    this.contextType = options.context.name;
    if (options.context.from) {
      this.addImport({
        names: [options.context.name],
        from: options.context.from
      });
    }

    this.addTypeMapping({ gqlType: 'Int', tsType: 'number' });
    this.addTypeMapping({ gqlType: 'Float', tsType: 'number' });
    this.addTypeMapping({ gqlType: 'String', tsType: 'string' });
    this.addTypeMapping({ gqlType: 'Boolean', tsType: 'boolean' });
    this.addTypeMapping({ gqlType: 'ID', tsType: 'string' });

    if (options.typeMap) {
      for (const typeMapping of options.typeMap) {
        this.addTypeMapping(typeMapping);
      }
    }
  }

  public addTypeMapping(typeMapping: TypeMapping) {
    this.typeMap.set(typeMapping.gqlType, typeMapping);

    if (typeMapping.from) {
      this.addImport({ names: [typeMapping.tsType], from: typeMapping.from });

      if (typeMapping.tsInputType) {
        this.addImport({ names: [typeMapping.tsInputType], from: typeMapping.from });
      }
    }
  }

  public addImport(im: ImportDef) {
    const names = this.imports.get(im.from);

    if (names) {
      for (const name of im.names) {
        names.add(name);
      }
    } else {
      this.imports.set(im.from, new Set(im.names));
    }
  }

  public generateServerTypes(root: DocumentNode) {
    const parts: string[] = [];

    parts.push(this.headers.join('\n'));

    const im: string[] = [];
    this.imports.forEach((names, from) => {
      im.push(
        `import { ${Array.from(names).join(', ')} } from ${JSON.stringify(
          from
        )}`
      );
    });
    parts.push(im.join('\n'));

    parts.push(`type AsyncResult<T> = T | Promise<T>;`);

    visit(root, {
      ScalarTypeDefinition: node => {
        if (!this.typeMap.has(node.name.value)) {
          this.addTypeMapping({
            gqlType: node.name.value,
            tsType: 'string'
          });
        }
      }
    });

    visit(root, {
      ObjectTypeDefinition: node => {
        parts.push(
          this.generateTypeInterface(node),
          this.generateResolverInterface(node)
        );
      },
      InterfaceTypeDefinition: node => {
        parts.push(
          this.generateTypeInterface(node),
          this.generateResolverInterface(node)
        );
      },
      UnionTypeDefinition: node => {
        parts.push(
          this.generateUnionTypeDef(node),
          this.generateUnionResolverInterface(node)
        );
      },
      InputObjectTypeDefinition: node => {
        parts.push(this.generateInputInterface(node));
      },
      EnumTypeDefinition: node => {
        parts.push(this.generateEnumDef(node));
      },
      FieldDefinition: (field, key, parent, path, ancestors) => {
        parts.push(
          this.generateArgumentInterface(
            field,
            // tslint:disable-next-line:no-magic-numbers
            ancestors[2] as
              | ObjectTypeDefinitionNode
              | InterfaceTypeDefinitionNode
          )
        );
      }
    });

    return parts.join('\n\n');
  }

  //

  public generateTypeInterface(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
  ) {
    if (!node.fields || node.fields.length === 0) {
      throw new Error(
        `Trying to generate empty type interface for ${node.name.value}`
      );
    }

    return `${this.generateDescription(node)}
      export interface ${node.name.value} {
        ${node.fields.map(it => this.generateTypePropertyDef(it)).join('\n')}
      }`;
  }

  public generateTypePropertyDef(field: FieldDefinitionNode) {
    return `${this.generateDescription(field)}
      ${field.name.value}${field.type.kind !== 'NonNullType' ? '?' : ''}:
        ${this.generateType(field.type, false)};`;
  }

  public generateUnionTypeDef(node: UnionTypeDefinitionNode) {
    if (!node.types) {
      throw new Error('Trying to generate empty union type');
    }

    return `${this.generateDescription(node)}
      export type ${node.name.value} = ${node.types
      .map(it => this.generateTypeName(it.name.value))
      .join(' | ')}`;
  }

  //

  public generateResolverInterface(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
  ) {
    if (!node.fields || node.fields.length === 0) {
      throw new Error(
        `Trying to generate empty resolver interface for ${node.name.value}`
      );
    }

    return `${this.generateDescription(node)}
      export interface I${node.name.value}Resolver {
        ${this.generateResolveTypeDef(node)}
        ${node.fields
          .map(it => this.generateFieldResolverDef(it, node))
          .join('\n')}
      }`;
  }

  public generateUnionResolverInterface(node: UnionTypeDefinitionNode) {
    return `${this.generateDescription(node)}
      export interface I${node.name.value}Resolver {
        ${this.generateResolveTypeDef(node)}
      }`;
  }

  public generateResolveTypeDef(
    node:
      | ObjectTypeDefinitionNode
      | InterfaceTypeDefinitionNode
      | UnionTypeDefinitionNode
  ) {
    return node.kind === 'ObjectTypeDefinition'
      ? ''
      : `__resolveType?: (
      data: ${this.generateTypeName(node.name.value)},
      context: ${this.contextType},
      info: GraphQLResolveInfo
    ) => string;`;
  }

  public generateFieldResolverDef(
    field: FieldDefinitionNode,
    parent: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode
  ) {
    const tResult = this.generateType(field.type, true);
    return `${this.generateDescription(field)}
      ${field.name.value}?: (
        data: ${this.generateTypeName(parent.name.value)},
        args: ${this.generateArgumentInterfaceRef(field, parent)},
        context: ${this.contextType},
        info: GraphQLResolveInfo
      ) => AsyncResult<${tResult}>`;
  }

  //

  public generateArgumentInterfaceRef(
    field: FieldDefinitionNode,
    object: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
  ) {
    return field.arguments && field.arguments.length > 0
      ? this.generateArgumentInterfaceName(field, object)
      : '{}';
  }

  public generateArgumentInterface(
    field: FieldDefinitionNode,
    object: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
  ) {
    if (field.arguments && field.arguments.length > 0) {
      return `export interface ${this.generateArgumentInterfaceName(
        field,
        object
      )} {
        ${field.arguments
          .map(it => this.generateInputPropertyDef(it))
          .join('\n')}
      }`;
    }

    return '';
  }

  public generateArgumentInterfaceName(
    field: FieldDefinitionNode,
    object: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
  ) {
    return `${object.name.value}${field.name.value.charAt(0).toUpperCase() +
      field.name.value.slice(1)}Args`;
  }

  //

  public generateType(node: TypeNode, optional: boolean): string {
    switch (node.kind) {
      case 'NonNullType':
        return this.generateType(node.type, false);
      case 'ListType':
        return `Array<${this.generateType(
          node.type,
          true
        )}>${this.generateOptionalSuffix(optional)}`;
      case 'NamedType':
        return `${this.generateTypeName(
          node.name.value
        )}${this.generateOptionalSuffix(optional)}`;
    }
  }

  public generateTypeName(name: string) {
    const typeMapping = this.typeMap.get(name);
    if (typeMapping) {
      return typeMapping.tsType;
    }

    return name;
  }

  //

  public generateInputInterface(node: InputObjectTypeDefinitionNode) {
    if (!node.fields || node.fields.length === 0) {
      throw new Error(
        `Trying to generate empty input interface for ${node.name.value}`
      );
    }

    return `${this.generateDescription(node)}
      export interface ${node.name.value} {
        ${node.fields.map(it => this.generateInputPropertyDef(it)).join('\n')}
      }`;
  }

  public generateInputPropertyDef(node: InputValueDefinitionNode) {
    return `${this.generateDescription(node)}
      ${node.name.value}${node.type.kind !== 'NonNullType' ? '?' : ''}:
        ${this.generateInputType(node.type, false)};`;
  }

  public generateInputType(node: TypeNode, optional: boolean): string {
    switch (node.kind) {
      case 'NonNullType':
        return this.generateInputType(node.type, false);
      case 'ListType':
        return `Array<${this.generateInputType(
          node.type,
          true
        )}>${this.generateOptionalSuffix(optional)}`;
      case 'NamedType':
        return `${this.generateInputTypeName(
          node.name.value
        )}${this.generateOptionalSuffix(optional)}`;
    }
  }

  public generateInputTypeName(name: string) {
    const typeMapping = this.typeMap.get(name);
    if (typeMapping) {
      return typeMapping.tsInputType ? typeMapping.tsInputType : typeMapping.tsType;
    }

    return name;
  }

  //

  public generateEnumDef(node: EnumTypeDefinitionNode) {
    if (!node.values || node.values.length === 0) {
      throw new Error(
        `Trying to generate empty enum definition for ${node.name.value}`
      );
    }

    return `${this.generateDescription(node)}
      export enum ${node.name.value} {
        ${node.values.map(it => this.generateEnumValueDef(it)).join(',\n')}
      }`;
  }

  public generateEnumValueDef(node: EnumValueDefinitionNode) {
    return `${this.generateDescription(node)}
      ${node.name.value} = ${JSON.stringify(node.name.value)}`;
  }

  //

  public generateOptionalSuffix(optional: boolean) {
    return optional ? ' | undefined' : '';
  }

  //

  public generateDescription(node: NodeWithDescription) {
    if (
      node.kind === 'FieldDefinition' ||
      node.kind === 'InputValueDefinition'
    ) {
      const t = this.generateTypeForDescription(node.type);
      const tt = t ? `(${t}) ` : '';
      const ttt = `${tt}${node.description ? node.description.value : ''}`;
      return this.generateComment(ttt);
    }

    return node.description ? this.generateComment(node.description.value) : '';
  }

  public generateTypeForDescription(node: TypeNode): string {
    switch (node.kind) {
      case 'NonNullType':
        return this.generateTypeForDescription(node.type);
      case 'ListType':
        const t = this.generateTypeForDescription(node.type);
        return t ? `Array<${t}>` : '';
      case 'NamedType':
        if (this.typeMap.has(node.name.value)) {
          return `${node.name.value}`;
        } else {
          return '';
        }
    }
  }

  public generateComment(text: string) {
    if (text.length === 0) {
      return '';
    }

    const lines = text.split(/\n/g).map(line => `* ${line}`);

    return `/**\n${lines.join('\n')}\n*/`;
  }
}
