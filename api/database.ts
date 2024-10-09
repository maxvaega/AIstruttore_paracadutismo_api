export class Database {
  private db: Map<string, string>;

  constructor() {
    this.db = new Map();
  }

  delay() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async createUser(personId: string, threadId: string) {
    await this.delay();
    await this.db.set(personId, threadId);
  }
}
