type ListNode<T> = {
  value: T;
  next: ListNode<T> | null;
};

class Queue<T> {
  private head: ListNode<T> | null;

  constructor() {
    this.head = null;
  }

  public enqueue(value: T): void {
    const next = this.head;

    this.head = {
      value,
      next,
    };
  }

  public dequeue(): T | null {
    if (this.head === null) {
      return null;
    }

    const removed = this.head?.value;
    this.head = this.head.next;

    return removed;
  }

  public get empty(): boolean {
    return this.head === null;
  }
}

export { Queue };
