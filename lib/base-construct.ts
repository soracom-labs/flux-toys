import { Construct, IConstruct } from "constructs";

export abstract class BaseConstruct extends Construct implements IConstruct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  protected addPrefixToId(id: string): string {
    return `${this.node.id}-${id}`;
  }

  protected functionName(): string {
    return `${this.node.id}-function`;
  }
}
