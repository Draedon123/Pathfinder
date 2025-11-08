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
    const node = {
      value,
      next: null,
    };

    const tail = this.tail;

    if (tail === null) {
      this.head = node;
    } else {
      tail.next = node;
    }
  }

  public dequeue(): T | null {
    if (this.head === null) {
      return null;
    }

    const removed = this.head?.value;
    this.head = this.head.next;

    return removed;
  }

  private get tail(): ListNode<T> | null {
    let node = this.head;

    while (node?.next) {
      node = node.next;
    }

    return node;
  }

  public get empty(): boolean {
    return this.head === null;
  }
}

export { Queue };
